import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
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
      return {
        data,
        url: `https://tsk.in.ua${currentURL}`
      };
    }),
  );
};
