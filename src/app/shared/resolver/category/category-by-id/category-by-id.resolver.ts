import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CategoriesService } from '../../../services/categories/categories.service';
import { inject } from '@angular/core';

export const categoryByIdResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const categoryID = route.params['categoryid'];
  const currentURL = state.url;
  const categoryService = inject(CategoriesService);


  return categoryService.getObjectById(categoryID).pipe(
    map((data) => {
      if (!data) {
        throw new Error('NotFound');
      }
      return {
        data,
        url: `https://tsk.in.ua${currentURL}`
      };
    }),
    catchError((err) => {
      return throwError(() => new Error('NotFound'));
    })
  );
};
