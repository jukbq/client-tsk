import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, of, take } from 'rxjs';
import { DishesService } from '../../../core/services/dishes/dishes-service';

export const dishByIdResolver: ResolveFn<{ data: any; url: string }> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<{ data: any; url: string }> => {
  const dishesID = route.params['dishesid'];
  const currentURL = state.url;
  const dishesService = inject(DishesService);
  const router = inject(Router);

  return dishesService.getObjectById(dishesID).pipe(
    take(1),
    map((data) => ({
      data,
      url: `https://tsk.in.ua${currentURL}`,
    })),
    catchError((err) => {
    // перенаправлення на 404 або повернення порожнього об’єкта
      router.navigate(['/404']);
      return of({ data: null, url: `https://tsk.in.ua${currentURL}` });
    }),
  );
};
