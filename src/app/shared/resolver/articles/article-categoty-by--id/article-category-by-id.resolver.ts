import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ArticleCategoriesService } from '../../../services/article/article-categories/article-categories.service';
import { inject } from '@angular/core';

export const articleCategoryByIdResolver: ResolveFn<{ data: any; url: string }> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<{ data: any; url: string }> => {
  const categoryID = route.params['artucleCategoryid'];

  const currentURL = state.url;
  const articleCategoryService = inject(ArticleCategoriesService);

  return articleCategoryService.getObjectById(categoryID).pipe(
    map((data) => (
      {
        data,
        url: `https://tsk.in.ua${currentURL}`
      }))
  );
};
