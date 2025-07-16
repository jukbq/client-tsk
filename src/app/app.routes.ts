import { RouterModule, Routes } from '@angular/router';
import { dishesAlResolver } from './shared/resolver/dishes/dishes-al/dishes-al.resolver';
import { lastRecipesResolver } from './shared/resolver/recipe/last-recipe/last-recipe.resolver';
import { NgModule } from '@angular/core';
import { PrivacyPolicyComponent } from './shared/components/privacy-policy/privacy-policy.component';
import { SearchComponent } from './shared/components/search/search.component';
import { DishFilterComponent } from './shared/components/dish-filter/dish-filter.component';
import { filterResolver } from './shared/resolver/filter/filter.resolver';

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
        path: 'search',
        component: SearchComponent,

    },
    {
        path: 'recipe-filte/:filterType/:slug',
        component: DishFilterComponent,
        resolve: {
            recipes: filterResolver
        }
    },







    {
        path: 'privacyy', component: PrivacyPolicyComponent
    },

    {
        path: '**',
        loadComponent: () => import('./../app/shared/components/soft-404/soft-404.component').then(m => m.Soft404Component)
    }

];


@NgModule({
    imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
    exports: [RouterModule]
})


export class AppRoutingModule { }