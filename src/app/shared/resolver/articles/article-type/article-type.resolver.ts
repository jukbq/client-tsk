import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ArticleTypeService } from '../../../services/article/article-type/article-type.service';
import { inject } from '@angular/core';

export const articleTypeResolver: ResolveFn<{ data: any; url: string }> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<{ data: any; url: string }> => {

  const typeService = inject(ArticleTypeService);

  const currentURL = state.url;

  return typeService.getAllarticleTypeLieght().pipe(
    map((data) => ({
      data,
      url: `https://tsk.in.ua${currentURL}`
    }))
  );
};
