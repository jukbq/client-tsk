import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { CategoriesService } from '../../../core/services/categories/categories-service';

// Тип, який резолвер повертає
export interface CategoryByIdResolveData {
  data: any;
  url: string;
}

export const categoryByIdResolver: ResolveFn<CategoryByIdResolveData> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<CategoryByIdResolveData> => {
  const categoryid = route.params['categoryid'];
  const currentURL = state.url;
  const categoryService = inject(CategoriesService);
  


  return categoryService.getObjectById(categoryid).pipe(
    map((data) => ({
      data,
      url: `https://tsk.in.ua${currentURL}`
    }))
  );
};
