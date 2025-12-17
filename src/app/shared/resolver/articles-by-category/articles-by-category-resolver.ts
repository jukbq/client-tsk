import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ArticlePageService } from '../../../core/services/article-page/article-page-service';

export interface ArticlesByCategoryResolved {
  data: any; // Тут може бути ваш ArticleLightInterface[]
  url: string;
}

export const articlesByCategoryResolver: ResolveFn<ArticlesByCategoryResolved> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<ArticlesByCategoryResolved> => {
  
  const articlePageService = inject(ArticlePageService);
  
  // ТУТ БУЛА ПОМИЛКА: назва має бути ТОЧНО як у path роута
  const categoryID = route.paramMap.get('articleCategoryId'); 
  const currentURL = state.url;

  if (!categoryID) {
    // Тепер ця помилка не повинна вилітати, бо назви однакові
    throw new Error('Category ID not found in route parameters');
  }

  return articlePageService.getArticleLightById(categoryID).pipe(
    map((data) => ({
      data,
      url: `https://tsk.in.ua${currentURL}`
    }))
  );
};