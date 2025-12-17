import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ArticleCategoriesService } from '../../../core/services/article-categories/article-categories-service';
import { ArticleCategoriesResponse } from '../../../core/interfaces/article-categories';

export interface ArticleCategoryResolvedData {
  data: ArticleCategoriesResponse; 
  url: string;
}

export const articleCategotyByidResolver: ResolveFn<ArticleCategoryResolvedData> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<ArticleCategoryResolvedData> => {
  
  // Додаємо трохи безпеки: беремо ID з параметрів
  const categoryId = route.paramMap.get('articleCategoryId'); 
  
  // Якщо ID немає, можна або кинути помилку, або редиректнути, 
  // але для SSR краще повернути Observable з порожнім об'єктом або null
  if (!categoryId) {
    throw new Error('Category ID is missing in the route parameters');
  }

  const articleCategoryService = inject(ArticleCategoriesService);
  const currentURL = state.url;

  return articleCategoryService.getObjectById(categoryId).pipe(
    map((data) => ({
      data,
      // Використовуємо шаблонний рядок для формування канонічного URL. 
      // В Angular 20 це все ще надійний спосіб передати мета-дані для SEO.
      url: `https://tsk.in.ua${currentURL}`
    }))
  );
};