import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CategoriesService } from '../../../services/categories/categories.service';
import { inject } from '@angular/core';

export const categoryByIdResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const categoryID = route.params['categoryid']
  const categoryService = inject(CategoriesService);
  return categoryService.getObjectById(categoryID);
};
