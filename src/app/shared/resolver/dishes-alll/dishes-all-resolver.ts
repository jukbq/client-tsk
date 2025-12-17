import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { DishesService } from '../../../core/services/dishes/dishes-service';

export const dishesAllResolver: ResolveFn<{ data: any; url: string }> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<{ data: any; url: string }> => {
 const dishesService = inject(DishesService);
  const router = inject(Router);
  const currentURL = state.url;

  return dishesService.getAllLight().pipe(
    map((data) => ({
      data,
      url: `https://tsk.in.ua${currentURL}`
    })),
    catchError((error) => {
      console.error('Помилка при завантаженні даних:', error);
      // Направляємо користувача на сторінку 404 або помилки
      router.navigate(['/404']); 
      // Повертаємо Observable з пустим значенням, щоб Angular не падав
      return of({ data: [], url: `https://tsk.in.ua${currentURL}` });
    })
  );
};
