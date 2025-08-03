import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { CategoriesService } from '../../../services/categories/categories.service';

export const categoryByIdResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const categoryid = route.params['categoryid'];
  console.log(categoryid);

  const currentURL = state.url;
  const categoryService = inject(CategoriesService);



  return categoryService.getObjectById(categoryid).pipe(
    map((data) => (
      {
        data,
        url: `https://tsk.in.ua${currentURL}`
      }))
  );
};
