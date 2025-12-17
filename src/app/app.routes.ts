import { Routes } from '@angular/router';

import { dishesAllResolver } from './shared/resolver/dishes-alll/dishes-all-resolver';
import { lastRecipeResolver } from './shared/resolver/last-recipe/last-recipe-resolver';
import { dishByIdResolver } from './shared/resolver/dish-by-id/dish-by-id-resolver';
import { categoryListResolver } from './shared/resolver/category-list/category-list-resolver';
import { categoryByIdResolver } from './shared/resolver/category-by-id/category-by-id-resolver';
import { recipeResolver } from './shared/resolver/recipe/recipe-resolver';
import { filterResolver } from './shared/resolver/filter/filter-resolver';

import { articleTypeResolver } from './shared/resolver/article-type/article-type-resolver';
import { articleCategotyByTypeIdResolver } from './shared/resolver/article-categoty-by-type-id/article-categoty-by-type-id-resolver';
import { articleTypeByIdResolver } from './shared/resolver/article-type-by-id/article-type-by-id-resolver';
import { articlePageResolver } from './shared/resolver/article-page/article-page-resolver';
import { articleCategotyByidResolver } from './shared/resolver/article-categoty-byid/article-categoty-byid-resolver';
import { articlesByCategoryResolver } from './shared/resolver/articles-by-category/articles-by-category-resolver';

export const routes: Routes = [
  // Головна
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home),
    resolve: {
      dishes: dishesAllResolver,
      recentRecipe: lastRecipeResolver,
    }
  },

  // Всі страви
  {
    path: 'dishes',
    loadComponent: () =>
      import('./pages/dishes/dishes').then(m => m.Dishes),
    resolve: {
      dishes: dishesAllResolver,
    }
   
  },

  // Категорії
  {
    path: 'categories/:dishesid',
    loadComponent: () =>
      import('./pages/category/category').then(m => m.Category),
    resolve: {
      dishes: dishByIdResolver,
      categryList: categoryListResolver,
    }
  
  },

  {
    path: 'recipes-list/:categoryid',
    loadComponent: () =>
      import('./pages/recipe-list/recipe-list').then(m => m.RecipeList),
    resolve: {
      category: categoryByIdResolver,
    }
    
  },

  {
    path: 'recipe-page/:recipeid',
    loadComponent: () =>
      import('./pages/recipe-page/recipe-page').then(m => m.RecipePage),
    resolve: {
      recipe: recipeResolver,
    }
  
  },

  {
    path: 'recipe-filte/:filterType/:slug',
    loadComponent: () =>
      import('./features/pages/recipes-by-tag/recipes-by-tag')
        .then(m => m.RecipesByTag),
    resolve: {
      recipes: filterResolver,
    },
  },

  {
    path: 'search',
    loadComponent: () =>
      import('./shared/components/search/search').then(m => m.Search),
    data: { hideFooter: true },
  },

  {
    path: 'about-us',
    loadComponent: () =>
      import('./features/pages/about-us/about-us').then(m => m.AboutUs),
  },

  {
    path: 'kontakty',
    loadComponent: () =>
      import('./features/pages/contact/contact').then(m => m.Contact),
  },

  {
    path: 'privacyy',
    loadComponent: () =>
      import('./features/pages/privacy-policy/privacy-policy')
        .then(m => m.PrivacyPolicy),
  },

  {
    path: 'auth',
    loadComponent: () =>
      import('./shared/components/auth/auth').then(m => m.Auth),
    data: { hideFooter: true },
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('./features/pages/profile/profile').then(m => m.Profile),
  },

  {
    path: 'umovy-korystuvannya',
    loadComponent: () =>
      import('./features/pages/terms-of-use/terms-of-use')
        .then(m => m.TermsOfUse),
  },

  // Articles
  {
    path: 'articlses',
    loadComponent: () =>
      import('./features/articles/articles-home/articles-home')
        .then(m => m.ArticlesHome),
    resolve: {
      articleTypes: articleTypeResolver,
    },
  },

  {
    path: 'article-categories/:articleTypeId',
    loadComponent: () =>
      import('./features/articles/article-categories/article-categories')
        .then(m => m.ArticleCategories),
    resolve: {
      articleTypes: articleTypeByIdResolver,
      aticleCategryList: articleCategotyByTypeIdResolver,
    },
  },

  {
    path: 'article-list/:articleCategoryId',
    loadComponent: () =>
      import('./features/articles/atricle-list/atricle-list')
        .then(m => m.AtricleList),
    resolve: {
      category: articleCategotyByidResolver,
      articles: articlesByCategoryResolver,
    },
  },

  {
    path: 'article-page/:articleId',
    loadComponent: () =>
      import('./features/articles/article-page/article-page')
        .then(m => m.ArticlePage),
    resolve: {
      article: articlePageResolver,
    },
  },

  // Soft 404
  {
    path: '**',
    loadComponent: () =>
      import('./pages/soft-404/soft-404').then(m => m.Soft404),
    data: { renderMode: 'ssr' },
  },
];


