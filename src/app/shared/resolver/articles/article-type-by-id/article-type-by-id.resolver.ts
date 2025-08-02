import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ArticleTypeService } from '../../../services/article/article-type/article-type.service';

export const articleTypeByIdResolver: ResolveFn<{ data: any; url: string }> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<{ data: any; url: string }> => {

  const articleTypeId = route.params['articleTypeId'];
  const typeService = inject(ArticleTypeService);
  const currentURL = state.url;

  return typeService.getArticleTypesByName(articleTypeId).pipe(
    map((data) => ({
      data,
      url: `https://tsk.in.ua${currentURL}`
    }))
  );
};
