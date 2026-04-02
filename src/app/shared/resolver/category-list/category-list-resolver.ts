import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, of, take } from 'rxjs';
import { CategoriesService } from '../../../core/services/categories/categories-service';
import { inject } from '@angular/core';

export const categoryListResolver: ResolveFn<any[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<any[]> => {
  const dishesID = route.params['dishesid'];
  const categoryService = inject(CategoriesService);
  const router = inject(Router);
  return categoryService.getLightById(dishesID).pipe(
    take(1),
    map((categories) =>
      [...categories].sort((a, b) => a.categoryName.localeCompare(b.categoryName)),
    ),
    catchError((err) => {
      router.navigate(['/404']);
      return of([]);
    }),
  );
};
