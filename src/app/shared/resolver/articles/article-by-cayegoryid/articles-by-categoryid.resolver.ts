import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ArticlePageService } from '../../../services/article/article-page/article-page.service';

export const articlesByCategoryidResolver: ResolveFn<{ data: any; url: string }> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<{ data: any; url: string }> => {
  const categoryID = route.params['artucleCategoryid'];
  const currentURL = state.url;
  const articlePageService = inject(ArticlePageService);

  return articlePageService.getArticleLightById(categoryID).pipe(

    map((data) => (
      {
        data,
        url: `https://tsk.in.ua${currentURL}`
      }))
  );
};
