import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CategoriesService } from '../../../services/categories/categories.service';

export const categoryListResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const dishesID = route.params['dishesid']
  const categoryService = inject(CategoriesService);
  return categoryService.getLightById(dishesID);
};