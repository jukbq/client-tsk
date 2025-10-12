import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { SsrLinkDirective } from '../../../../shared/directives/ssr-link.directive';

@Component({
  selector: 'app-recipe-info',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective],
  templateUrl: './recipe-info.component.html',
  styleUrl: './recipe-info.component.scss',
})
export class RecipeInfoComponent {
  @Input() seasons: any[] = [];
  @Input() info: any[] = [];

  isOpen = false;

  blockedFilters = ['totalTime', 'numberCalories', 'someOtherShit'];
  isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  isBlockedFilter(item: string): boolean {
    return this.blockedFilters.includes(item);
  }

  toggleAll() {
    this.isOpen = !this.isOpen;
  }
}
