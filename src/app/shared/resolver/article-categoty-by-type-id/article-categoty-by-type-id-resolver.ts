import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ArticleCategoriesService } from '../../../core/services/article-categories/article-categories-service';

export const articleCategotyByTypeIdResolver: ResolveFn<{ data: any; url: string }> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<{ data: any; url: string }> => {
  // Отримуємо id з параметрів
  const categoryID = route.paramMap.get('articleTypeId')!;
  const currentURL = state.url;

  // Інжектимо сервіс через новий API
  const articleCategoryService = inject(ArticleCategoriesService);
 
  return articleCategoryService.getArticleCategoryByTypeID(categoryID).pipe(
    map(data => ({
      data,
      url: `https://tsk.in.ua${currentURL}` // Можеш міняти базу як треба
    }))

    
  );
};