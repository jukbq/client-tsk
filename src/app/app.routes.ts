import { RouterModule, Routes } from '@angular/router';
import { dishesAlResolver } from './shared/resolver/dishes/dishes-al/dishes-al.resolver';
import { lastRecipesResolver } from './shared/resolver/recipe/last-recipe/last-recipe.resolver';
import { PrivacyPolicyComponent } from './shared/components/privacy-policy/privacy-policy.component';
import { SearchComponent } from './shared/components/search/search.component';
import { dishByIdResolver } from './shared/resolver/dishes/dish-by-id/dish-by-id.resolver';
import { categoryListResolver } from './shared/resolver/category/category-list/category-list.resolver';
import { categoryByIdResolver } from './shared/resolver/category/category-by-id/category-by-id.resolver';
import { recipeResolver } from './shared/resolver/recipe/recipe/recipe.resolver';
import { DishFilterComponent } from './shared/components/dish-filter/dish-filter.component';
import { filterResolver } from './shared/resolver/filter/filter.resolver';
import { NgModule } from '@angular/core';
import { AboutUsComponent } from './shared/components/about-us/about-us.component';
import { TermsOfUseComponent } from './shared/components/terms-of-use/terms-of-use.component';
import { ContactComponent } from './shared/components/contact/contact.component';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/home/home.component').then((m) => m.HomeComponent),
        resolve: {
            dishes: dishesAlResolver,
            recentRecipe: lastRecipesResolver,
        },


    },

    {
        path: 'dishes',
        loadComponent: () =>
            import('./pages/dishes/dishes.component').then((m) => m.DishesComponent),
        resolve: {
            dishes: dishesAlResolver,
        },
    },

    {
        path: 'categories/:dishesid',
        loadComponent: () =>
            import('./pages/category/category.component').then(
                (m) => m.CategoryComponent
            ),
        resolve: {
            dishes: dishByIdResolver,
            categryList: categoryListResolver
        },
    },
    {
        path: 'recipes-list/:categoryid',
        loadComponent: () =>
            import('./pages/recipe-list/recipe-list.component').then(
                (m) => m.RecipeListComponent
            ),
        resolve: {
            category: categoryByIdResolver,
        },
    },

    {
        path: 'recipe-page/:recipeid',
        loadComponent: () =>
            import('./pages/recipe-page/recipe-page.component').then(
                (m) => m.RecipePageComponent
            ),

        resolve: {
            recipe: recipeResolver,

        },

    },

    {
        path: 'recipe-filte/:filterType/:slug',
        component: DishFilterComponent,
        resolve: {
            recipes: filterResolver
        }
    },


    {
        path: 'search',
        component: SearchComponent,

    },


    {
        path: 'privacyy', component: PrivacyPolicyComponent
    },
    {
        path: 'about-us', component: AboutUsComponent
    },
    {
        path: 'umovy-korystuvannya', component: TermsOfUseComponent
    },
    {
        path: 'kontakty', component: ContactComponent
    },

    {
        path: '**',
        loadComponent: () =>
            import('./../app/shared/components/soft-404/soft-404.component')
                .then(m => m.Soft404Component)
    }

];


@NgModule({
    imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
    exports: [RouterModule]
})


export class AppRoutingModule { }