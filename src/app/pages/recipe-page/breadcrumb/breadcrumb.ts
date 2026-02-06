import { Component, computed, input } from '@angular/core';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';

export interface BreadcrumbItem {
  label: string;
  link: string | any[];
}

@Component({
  selector: 'app-breadcrumb',
  imports: [SsrLinkDirective],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {
 // Використовуємо input-сигнали для автоматичного відстеження змін
  dishesID = input.required<string>();
  dishesName = input.required<string>();
  categoryID = input.required<string>();
  categoryName = input.required<string>();
  recipeTitle = input.required<string>();

  // Computed масив: перераховується тільки якщо змінився будь-який з input-ів
  breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    { label: 'Головна', link: '/' },
    { label: 'Рецепти Синього Кота', link: '/dishes' },
    { label: this.dishesName(), link: ['categories', this.dishesID()] },
    { label: this.categoryName(), link: ['recipes-list', this.categoryID()] },
    { label: this.recipeTitle(), link: '' },
  ]);
}
