import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { RecipeService } from '../../../services/recipe/recipe.service';
import { SeoService } from '../../../services/seo/seo.service';



export const recipeResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const recipeID = route.params['recipeid'];
  const recipeService = inject(RecipeService);
  const seoService = inject(SeoService);


  return recipeService.getRecipeByID(recipeID).pipe(


    map(recipe => {

      if (!recipe || recipe.id !== recipeID) {
        throw new Error('NOT_FOUND');
      }


      if (recipe && recipe.id === recipeID) {
        const currentURL = state.url;

        const recipeSchema = {
          "@context": "https://schema.org/",
          "@type": "Recipe",
          "name": recipe.recipeTitle,
          "image": recipe.mainImage,

          "author": {
            '@type': 'Person',
            name: 'Yurii Ohlii',
          },

          "datePublished": recipe.createdAt,
          "description": recipe.seoDescription,
          "recipeCuisine": recipe.cuisine.cuisineName,
          "prepTime": seoService.convertTimeToISO(recipe.prepTime),
          "cookTime": seoService.convertTimeToISO(recipe.cookTime),
          "totalTime": seoService.convertTimeToISO(recipe.totalTime),
          "keywords": recipe.keywords,
          "recipeYield": recipe.numberServings,
          "recipeCategory": recipe.dishes.dishesName,
          "nutrition": {
            '@type': 'NutritionInformation',
            calories: recipe.numberCalories,
          },
          /*    "aggregateRating": {
               '@type': 'AggregateRating',
               ratingValue: '5.0',
               reviewCount: '1',
             }, */
          "recipeIngredient": seoService.formatIngredientsForSchema(recipe.ingredients),
          "recipeInstructions": seoService.convertStepsToSchema(recipe.instructions, currentURL),
          "url": `https://tsk.in.ua${currentURL}`,
          "potentialAction": {
            "@type": "SearchAction",
            "target": "recipe-fihttps://tsk.in.ua/search?q={search_term_string}lte",
            "query-input": "required name=search_term_string"
          },
          ...(recipe.videoUrl?.trim() ? { video: recipe.videoUrl } : {})
        };


        // Обробляємо bestSeason для додавання зображень
        // Використовуємо map для створення масиву з об'єктами,
        const seasonImageMap: Record<string, string> = {
          winter: 'assets/icon/seasons/Winter.webp',
          spring: 'assets/icon/seasons/spring.webp',
          summer: '/assets/icon/seasons/Summer.webp',
          Autumn: 'assets/icon/seasons/Autumn.webp',

        };

        const processedSeasons = recipe.bestSeason.map((season: { list: string | number }) => {
          let image = 'assets/icons/seasons/default.svg';

          if (season.list === 'All-year') {
            image = 'assets/icon/seasons/All-Year-Round.webp';
          } else {
            image = seasonImageMap[season.list] || image;
          }

          return {
            ...season,
            image,
          };
        });





        const recipeSSR = {
          recipeTitle: recipe.recipeTitle,
          mainImage: recipe.mainImage,
          recipeSubtitles: recipe.recipeSubtitles,
          descriptionRecipe: recipe.descriptionRecipe,

          seoName: recipe.seoName,
          seoDescription: recipe.seoDescription,
          keywords: recipe.keywords,

          dishesID: recipe.dishes.id,
          dishesName: recipe.dishes.dishesName,
          categoryID: recipe.categoriesDishes.id,
          categoryName: recipe.categoriesDishes.categoryName,

          ingredients: recipeService.formatIngredients(recipe.ingredients),
          accompanyingRecipes: recipeService.findRecipesWithIds(recipe.ingredients),
          instructions: recipe.instructions,

          bestSeason: processedSeasons,
          advice: recipe.advice,
          completion: recipe.completion,
          currentURL: `https://tsk.in.ua${currentURL}`,

        }





        // Формуємо масив info з різними властивостями рецепту
        // Використовуємо map для створення масиву з об'єктами, що містять зображення та назву
        let info: any = [];
        let timeImage = '/assets/icon/time.webp';
        let powerImage = '/assets/icon/calories.webp';

        // Додаємо зображення для часу приготування
        let difficultyImage = '';
        let difficultyID = recipe.difficultyPreparation?.list ?? null;

        let difficultyName = recipe.difficultyPreparation?.name ?? null;
        const difficultyLevel = recipe.difficultyPreparation?.list;

        if (difficultyLevel === 'light') {
          difficultyImage = '/assets/icon/difficulty/base.webp';
        } else if (difficultyLevel === 'medium') {
          difficultyImage = 'assets/icon/difficulty/medium.webp';
        } else if (difficultyLevel === 'hard') {
          difficultyImage = 'assets/icon/difficulty/difficult.webp';
        } else {
          difficultyImage = 'assets/icon/difficulty/default.webp';
        }






        info.push(
          {
            slug: "totalTime",
            infoLink: "totalTime",
            image: timeImage,
            name: recipe.totalTime,
          },
          {
            slug: "numberCalories",
            infoLink: "numberCalories",
            image: powerImage,
            name: recipe.numberCalories,
          },
          {
            slug: difficultyID,
            infoLink: "difficultyPreparation",
            image: difficultyImage,
            name: difficultyName,
          },
          {
            slug: recipe.cuisine?.slug ?? null,
            infoLink: "cuisine",
            image: recipe.cuisine?.image ?? null,
            name: recipe.cuisine?.cuisineName ?? null,
          },
          {
            slug: recipe.region?.slug ?? null,
            infoLink: "region",
            image: recipe.region?.regionFlag ?? null,
            name: recipe.region?.regionName ?? null,
          }
        )



        // Формуємо holiday та recipeType масиви
        // Якщо recipe.holiday та recipe.recipeType існують, то мапимо їх

        if (recipe.holiday) {
          recipe.holiday.map(
            (item: { slug: any, holidayName: any; image: any }) => ({
              slug: item.slug,
              infoLink: "holiday",
              image: item.image,
              name: item.holidayName,

            })
          ).forEach((item: { name: any; }) => {
            if (item.name) {
              info.push(item);
            }
          }
          );

        }

        // Формуємо recipeType
        // Якщо recipe.recipeType існує, то мапимо їх

        if (recipe.recipeType) {
          recipe.recipeType.map(
            (item: { slug: any, recipeTypeName: any; image: any }) => ({
              slug: item.slug,
              infoLink: "recipeType",
              image: item.image,
              name: item.recipeTypeName,

            })
          ).forEach((item: { name: any; }) => {
            if (item.name) {
              info.push(item);
            }
          }
          );

        }



        return {
          recipeSchema,
          recipeSSR,
          info,


        };
      } else {
        return null;
      }


    }),

    catchError((error) => {
      console.error('Error fetching recipe:', error);
      // У разі помилки повертаємо null або EMPTY
      return of(null);
    })

  );



};
