import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { RecipeService } from '../../../core/services/recipe/recipe-service';
import { SeoService } from '../../../core/services/seo/seo-service';
import { RESPONSE } from '../../../../express.tokens';

export interface RecipeSSR {
  recipeID: string;
  recipeTitle: string;
  mainImage: string;
  recipeSubtitles: string;
  descriptionRecipe: string;

  dishesID: string;
  dishesName: string;
  categoryID: string;
  categoryName: string;

  ingredients: any[];
  accompanyingRecipes: any[];
  accompanyingArticles: any[];

  instructions: any[];
  bestSeason: any[];
  advice: string;
  completion: string;
  currentURL: string;
}

export interface RecipeResolverData {
  recipeMeta: any;
  recipeSchema: any;
  recipeSSR: RecipeSSR;
  info: any[];
}

export const recipeResolver: ResolveFn<RecipeResolverData | null> = (
  route,
  state,
): Observable<RecipeResolverData | null> => {
  const recipeID = route.params['recipeid'];
  const recipeService = inject(RecipeService);
  const seoService = inject(SeoService);
  const router = inject(Router);
  const response = inject(RESPONSE, { optional: true });

  return recipeService.getRecipeByID(recipeID).pipe(
    map((recipe) => {
      if (!recipe || recipe.id !== recipeID) {
        if (response) response.statusCode = 404;
        throw new Error('Recipe not found');
      }

      const currentURL = state.url;

      const recipeMeta = {
        seoName: recipe.seoName,
        seoDescription: recipe.seoDescription,
        keywords: recipe.keywords,
        mainImage: recipe.mainImage,
        currentURL: `https://tsk.in.ua${currentURL}`,
      };

      // Формуємо schema.org
      const recipeSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Recipe',
        name: recipe.recipeTitle,
        image: recipe.mainImage,
        author: { '@type': 'Person', name: 'Yurii Ohlii' },
        datePublished: recipe.createdAt,
        description: recipe.seoDescription,
        ...(recipe.cuisine?.schemaCuisine && {
          recipeCuisine: recipe.cuisine.schemaCuisine,
        }),

        prepTime: seoService.convertTimeToISO(recipe.prepTime),
        cookTime: seoService.convertTimeToISO(recipe.cookTime),
        totalTime: seoService.convertTimeToISO(recipe.totalTime),
        keywords: recipe.keywords,
        recipeYield: recipe.numberServings,
        recipeCategory: recipe.dishes.dishesName,
        nutrition: { '@type': 'NutritionInformation', calories: recipe.numberCalories },
        recipeIngredient: seoService.formatIngredientsForSchema(recipe.ingredients),
        recipeInstructions: seoService.convertStepsToSchema(recipe.instructions, currentURL),

        url: `https://tsk.in.ua${currentURL}`,
        ...(recipe.videoUrl?.trim() && { video: recipe.videoUrl }),
      };

      // Обробка bestSeason
      const seasonImageMap: Record<string, string> = {
        winter: 'assets/icon/seasons/Winter.webp',
        spring: 'assets/icon/seasons/spring.webp',
        summer: '/assets/icon/seasons/Summer.webp',
        Autumn: 'assets/icon/seasons/Autumn.webp',
        'All-year': 'assets/icon/seasons/All-Year-Round.webp',
      };

      const processedSeasons = recipe.bestSeason.map((season: any) => ({
        ...season,
        image: seasonImageMap[season.list] || 'assets/icons/seasons/default.svg',
      }));

      // Формуємо SSR об'єкт
      const recipeSSR: RecipeSSR = {
        recipeID,
        recipeTitle: recipe.recipeTitle,
        mainImage: recipe.mainImage,
        recipeSubtitles: recipe.recipeSubtitles,
        descriptionRecipe: recipe.descriptionRecipe,

        dishesID: recipe.dishes.id,
        dishesName: recipe.dishes.dishesName,
        categoryID: recipe.categoriesDishes.id,
        categoryName: recipe.categoriesDishes.categoryName,

        ingredients: recipeService.formatIngredients(recipe.ingredients),
        accompanyingRecipes: recipeService.findRecipesWithIds(recipe.ingredients),
        accompanyingArticles: recipeService.findArticlesWithIds(recipe.ingredients),
        instructions: recipe.instructions,
        bestSeason: processedSeasons,
        advice: recipe.advice,
        completion: recipe.completion,
        currentURL: `https://tsk.in.ua${currentURL}`,
      };

      // Додаємо додаткові статті, якщо є
      if (recipe.articleID && recipe.articleImage && recipe.articleName) {
        recipeSSR.accompanyingArticles.push({
          articleID: recipe.articleID,
          articleImage: recipe.articleImage,
          articleName: recipe.articleName,
        });
      }

      // Формуємо info

      type DifficultyLevel = 'light' | 'medium' | 'hard' | null;

      const difficultyLevel: DifficultyLevel = recipe.difficultyPreparation?.list ?? null;

      const difficultyImages: Record<Exclude<DifficultyLevel, null>, string> = {
        light: '/assets/icon/difficulty/base.webp',
        medium: 'assets/icon/difficulty/medium.webp',
        hard: 'assets/icon/difficulty/difficult.webp',
      };

      const difficultyImage =
        difficultyLevel && difficultyImages[difficultyLevel]
          ? difficultyImages[difficultyLevel]
          : '/assets/icon/difficulty/default.webp';

      const info = [
        {
          slug: 'totalTime',
          infoLink: 'totalTime',
          image: '/assets/icon/time.webp',
          name: recipe.totalTime,
        },
        {
          slug: 'numberCalories',
          infoLink: 'numberCalories',
          image: '/assets/icon/calories.webp',
          name: recipe.numberCalories,
        },
        {
          slug: difficultyLevel,
          infoLink: 'difficultyPreparation',
          image: difficultyImage,
          name: recipe.difficultyPreparation?.name || null,
        },
        {
          slug: recipe.cuisine?.slug ?? null,
          infoLink: 'cuisine',
          image: recipe.cuisine?.image ?? null,
          name: recipe.cuisine?.cuisineName ?? null,
        },
        {
          slug: recipe.region?.slug ?? null,
          infoLink: 'region',
          image: recipe.region?.regionFlag ?? null,
          name: recipe.region?.regionName ?? null,
        },
        ...(recipe.holiday ?? [])
          .map((h: any) => ({
            slug: h.slug,
            infoLink: 'holiday',
            image: h.image,
            name: h.holidayName,
          }))
          .filter((i: any) => i.name),
        ...(recipe.recipeType ?? [])
          .map((r: any) => ({
            slug: r.slug,
            infoLink: 'recipeType',
            image: r.image,
            name: r.recipeTypeName,
          }))
          .filter((i: any) => i.name),
      ];

      return { recipeMeta, recipeSchema, recipeSSR, info };
    }),

    catchError((err) => {
      if (response) response.statusCode = 404;
      return throwError(() => err);
    }),
  );
};
