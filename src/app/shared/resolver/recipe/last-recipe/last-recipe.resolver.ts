import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { RecipeService } from '../../../services/recipe/recipe.service';

export const lastRecipesResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const recipeService = inject(RecipeService); // Інжектимо RecipeService
  return recipeService.getRecentRecipes(); // Повертаємо Observable з Firebase
};
