import { Component, inject, Inject, input, Input, PLATFORM_ID, signal } from '@angular/core';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-recipe-info',
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './recipe-info.html',
  styleUrl: './recipe-info.scss',
})
export class RecipeInfo {
private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  // Вхідні дані як сигнали
  seasons = input<any[]>([]);
  info = input<any[]>([]);

  // Стан акордеона
  isOpen = signal(false);

  // Список фільтрів, які не мають бути посиланнями
  private readonly blockedFilters = ['totalTime', 'numberCalories', 'someOtherShit'];

  isBlockedFilter(infoLink: string): boolean {
    return this.blockedFilters.includes(infoLink);
  }

  toggleAll() {
    this.isOpen.update(v => !v);
  }
}
