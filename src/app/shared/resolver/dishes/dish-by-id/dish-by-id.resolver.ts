import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DishesService } from '../../../services/dishes/dishes.service';
import { inject } from '@angular/core';

export const dishByIdResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const dishesID = route.params['dishesid'];
  const currentURL = state.url;
  const dishesService = inject(DishesService);

  return dishesService.getObjectById(dishesID).pipe(
    map((data) => {
      if (!data || !data.id) {
        console.log(`🔍 Не знайдено страву з ID: ${dishesID}`);
        throw new Error('NotFound');
      }
      return {
        data,
        url: `https://tsk.in.ua${currentURL}`,
      };
      console.log(`🍽️ Страва знайдена:`);

    })
  );
};
