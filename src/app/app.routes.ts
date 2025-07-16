import { Routes } from '@angular/router';
import { dishesAlResolver } from './shared/resolver/dishes/dishes-al/dishes-al.resolver';
import { lastRecipesResolver } from './shared/resolver/recipe/last-recipe/last-recipe.resolver';
import { PrivacyPolicyComponent } from './shared/components/privacy-policy/privacy-policy.component';
import { SearchComponent } from './shared/components/search/search.component';

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
        path: 'search',
        component: SearchComponent,

    },


    {
        path: 'privacyy', component: PrivacyPolicyComponent
    },

    {
        path: '**',
        loadComponent: () =>
            import('./../app/shared/components/soft-404/soft-404.component')
                .then(m => m.Soft404Component)
    }

];
