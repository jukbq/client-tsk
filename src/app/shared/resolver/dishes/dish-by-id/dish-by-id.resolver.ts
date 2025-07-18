import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { DishesService } from '../../../services/dishes/dishes.service';
import { inject } from '@angular/core';

export const dishByIdResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const dishesID = route.params['dishesid']
  const currentURL = state.url;
  const dishesService = inject(DishesService);

  return dishesService.getObjectById(dishesID).pipe(
    map((data) => (
      {
        data,
        url: `https://tsk.in.ua${currentURL}`
      }))

  )

};
