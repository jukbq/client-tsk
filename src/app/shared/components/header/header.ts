import { CommonModule, isPlatformBrowser, NgClass } from '@angular/common';
import { Component, HostListener, inject, Inject, PLATFORM_ID, signal } from '@angular/core';
import { SsrLinkDirective } from '../../SsrLinkDirective/ssr-link.directive';
import { NavigationEnd, Router } from '@angular/router';
import { DishesService } from '../../../core/services/dishes/dishes-service';
import { CategoriesService } from '../../../core/services/categories/categories-service';
import { ArticleTypeService } from '../../../core/services/article-type/article-type-service';
import { ArticleCategoriesService } from '../../../core/services/article-categories/article-categories-service';
import { AuthService } from '../../../core/services/auth/auth-service';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  imports: [SsrLinkDirective],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '[class.fixed-header]': 'isFixed()'
  }
})
export class Header {
  // Inject services
  private dishesService = inject(DishesService);
  private categoryService = inject(CategoriesService);
  private typeService = inject(ArticleTypeService);
  private articleCategoryService = inject(ArticleCategoriesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Signals для стану
  isBrowser = isPlatformBrowser(this.platformId);
  isMenuOpen = signal(false);
  parallaxEnabled = signal(true);
  
  // Дані
  dishesList = signal<any[]>([]);
  subDishes = signal<any[]>([]);
  articleTypeList = signal<any[]>([]);
  subArticleCategories = signal<any[]>([]);
  
  // Активні елементи
  activeMenu = signal<string>('');
  activeSubItem = signal<number | null>(null);
  selectedDishesId = signal<string | null>(null);
  articleTypeId = signal<string | null>(null);

  // Користувач через Signal (з RxJS)
  user = toSignal(this.authService.user$);
  isLoggedIn = () => !!this.user();

  isFixed = signal(false);
  constructor() {
    // Відстеження роутінгу для паралаксу
    if (this.isBrowser) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
       // 1. Оновлюємо стан паралаксу (ваша логіка)
        this.updateParallaxState(url);

        // 2. Оновлюємо стан фіксації (нова логіка)
        // Додаємо сюди всі маршрути, де хедер має бути fixed
        const shouldFix = url.includes('/recipe-page') || url.includes('/search');
        this.isFixed.set(shouldFix);
      });

      
    }
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.dishesService.getAllLight().subscribe(data => {
      this.dishesList.set(data.sort((a: any, b: any) => a.dishesName.localeCompare(b.dishesName)));
    });

    this.typeService.getAll().subscribe(data => {
      this.articleTypeList.set(data.sort((a: any, b: any) => a.articleTypeName.localeCompare(b.articleTypeName)));
    });
  }

  private updateParallaxState(url: string) {
    const staticRoutes = ['/recipe-page', '/search', '/about-us', '/kontakty'];
    const isStatic = staticRoutes.some(route => url.startsWith(route));
    this.parallaxEnabled.set(!isStatic);
    
    const header = document.querySelector('header');
    if (header) header.style.transform = 'translate3d(0, 0, 0)';
  }

  // Логіка меню
  onSelectItem(menuName: string): void {
    this.activeMenu.update(current => current === menuName ? '' : menuName);
    this.activeSubItem.set(null);
    this.subArticleCategories.set([]);
  }

  loadSubDishes(dishId: string, index: number): void {
    if (this.selectedDishesId() !== dishId) {
      this.selectedDishesId.set(dishId);
      this.activeSubItem.set(index);
      this.categoryService.getLightById(dishId).subscribe(data => {
        this.subDishes.set(data.sort((a: any, b: any) => a.categoryName.localeCompare(b.categoryName)));
      });
    } else {
      this.selectedDishesId.set(null);
      this.activeSubItem.set(null);
    }
  }

  loadArticleCategories(typeId: string, index: number) {
    if (this.articleTypeId() !== typeId) {
      this.articleTypeId.set(typeId);
      this.activeSubItem.set(index);
      this.articleCategoryService.getArticleCategoryByTypeID(typeId).subscribe(data => {
        this.subArticleCategories.set(data.sort((a: any, b: any) => a.aticleCategoryName.localeCompare(b.aticleCategoryName)));
      });
    } else {
      this.articleTypeId.set(null);
      this.activeSubItem.set(null);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
    if (this.isBrowser) {
      document.body.classList.toggle('no-scroll', this.isMenuOpen());
    }
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.selectedDishesId.set(null);
    if (this.isBrowser) document.body.classList.remove('no-scroll');
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.isBrowser || !this.parallaxEnabled()) return;
    const header = document.querySelector('header');
    if (header) {
      const v = Math.max(0, Math.round(window.scrollY * 0.8));
      header.style.transform = `translate3d(0, ${v}px, 0)`;
    }
  }
}
