import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ArticlePageService } from '../../../core/services/article-page/article-page-service';

export interface ArticlePageResolved {
  data: any;
  url: string;
}

export const articlePageResolver: ResolveFn<ArticlePageResolved> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<ArticlePageResolved> => {
  const articlePageService = inject(ArticlePageService);

  const articleId = route.paramMap.get('articleId');

 
  if (!articleId) {
    throw new Error('articleId is missing in route params');
  }

  const currentURL = state.url;

  return articlePageService
    .getRecipeByID(articleId)
    .pipe(
      map((data) => ({
        data,
        // якщо апі базовий урл береш із середовищ – можна теж із environment, але тут так, як у тебе було
        url: `https://tsk.in.ua${currentURL}`,
      }))
    );
};