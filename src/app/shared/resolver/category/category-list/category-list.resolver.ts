import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CategoriesService } from '../../../services/categories/categories.service';

export const categoryListResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const dishesID = route.params['dishesid']
  const categoryService = inject(CategoriesService);
  return categoryService.getLightById(dishesID).pipe(
    map(data => {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error('NotFound');  // Кидаємо помилку, якщо даних немає
      }
      return data;
    }),
    catchError(() => throwError(() => new Error('NotFound')))
  );
};