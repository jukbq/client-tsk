import { Component, inject } from '@angular/core';
import { SsrLinkDirective } from '../../SsrLinkDirective/ssr-link.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { DishesService } from '../../../core/services/dishes/dishes-service';

@Component({
  selector: 'app-footer',
  imports: [SsrLinkDirective],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
private dishesService = inject(DishesService);

  // Перетворюємо Observable на сигнал. 
  // Він автоматично оновить шаблон, коли дані прийдуть.
  dishesList = toSignal(this.dishesService.getAllLight(), { initialValue: [] });
  
  // Поточний рік для копірайту
  currentYear = new Date().getFullYear();
}
