import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';
import { DishesService } from '../../../services/dishes/dishes.service';
import { inject } from '@angular/core';

export const dishByIdResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const dishesID = route.params['dishesid'];
  const currentURL = state.url;
  const dishesService = inject(DishesService);

  return dishesService.getObjectById(dishesID).pipe(
    map((data) => {
      if (!data) {
        throw new Error('NotFound'); // Або можна throwError(() => new Error('NotFound'))
      }

      return {
        data,
        url: `https://tsk.in.ua${currentURL}`,
      };
    }),
    catchError((err) => {
      // Це необхідно, щоб спрацював маршрут '**' і підвантажив 404 компонент
      return throwError(() => new Error('NotFound'));
    })
  );

};
