import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ArticlePageService } from '../../../services/article/article-page/article-page.service';
import { inject } from '@angular/core';

export const articlePageResolver: ResolveFn<{ data: any; url: string }> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<{ data: any; url: string }> => {

  const articleId = route.params['articleId'];
  const articlePageService = inject(ArticlePageService);
  const currentURL = state.url;

  return articlePageService.getRecipeByID(articleId).pipe(
    map((data) => ({
      data,
      url: `https://tsk.in.ua${currentURL}`
    }))
  );
};
