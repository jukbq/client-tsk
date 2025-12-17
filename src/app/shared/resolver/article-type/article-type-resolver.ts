import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, EMPTY, map, Observable } from 'rxjs';
import { ArticleTypeService } from '../../../core/services/article-type/article-type-service';

export interface ArticleTypeResolverResult {
  data: any[];
  url: string;
}

export const articleTypeResolver:  ResolveFn<ArticleTypeResolverResult> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<ArticleTypeResolverResult> => {

  const typeService = inject(ArticleTypeService);
  const router = inject(Router);

  const currentURL = `https://tsk.in.ua${state.url}`;

  return typeService.getAllLight().pipe(
    map((data) => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        // Нема даних → це не ок
        router.navigateByUrl('/404');
        return EMPTY as unknown as ArticleTypeResolverResult;
      }

      return {
        data,
        url: currentURL
      };
    }),
    catchError((err) => {
      console.error('[articleTypeResolver] error:', err);
      router.navigateByUrl('/404');
      return EMPTY;
    })
  );
};