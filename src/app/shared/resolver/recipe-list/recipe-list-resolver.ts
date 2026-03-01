import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { Observable, of, take } from 'rxjs';
import { RecipeService } from '../../../core/services/recipe/recipe-service';

export const recipeListResolver: ResolveFn<any[]> = (
  route: ActivatedRouteSnapshot,
): Observable<any[]> => {
  const categoryId = route.params['categoryid'];
  const recipeService = inject(RecipeService); // ✅ ТІЛЬКИ RecipeService

  if (!categoryId) {
    return of([]);
  }

  return recipeService.getRecipeLightById(categoryId).pipe(take(1));
};
