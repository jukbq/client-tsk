import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ArticleTypeService } from '../../../core/services/article-type/article-type-service';

export const articleTypeByIdResolver: ResolveFn<{ data: any; url: string }> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<{ data: any; url: string }> => {

  // Дістаємо id через paramMap, строгіше з типами
  const articleTypeId = route.paramMap.get('articleTypeId')!;
  const currentURL = state.url;

  // Інжектимо сервіс через inject()
  const typeService = inject(ArticleTypeService);

  return typeService.getArticleTypesByName(articleTypeId).pipe(
    map(data => ({
      data,
      url: `https://tsk.in.ua${currentURL}`
    }))
  );
};