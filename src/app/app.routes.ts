import { Routes } from '@angular/router';
import { dishesAlResolver } from './shared/resolver/dishes/dishes-al/dishes-al.resolver';
import { lastRecipesResolver } from './shared/resolver/recipe/last-recipe/last-recipe.resolver';

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
        path: '**',
        loadComponent: () =>
            import('./../app/shared/components/soft-404/soft-404.component')
                .then(m => m.Soft404Component)
    }

];
