import {
  Component,
  DOCUMENT,
  ElementRef,
  HostListener,
  inject,
  PLATFORM_ID,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { SsrLinkDirective } from '../../shared/SsrLinkDirective/ssr-link.directive';
import { AuthModal } from '../../shared/components/auth-modal/auth-modal';
import { SeoService } from '../../core/services/seo/seo-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CategoriesService } from '../../core/services/categories/categories-service';
import { DishesService } from '../../core/services/dishes/dishes-service';
import { RecipeService } from '../../core/services/recipe/recipe-service';
import { FavoritesService } from '../../core/services/favorites/favorites-service';
import { AuthService } from '../../core/services/auth/auth-service';
import { ModalService } from '../../core/services/modal/modal.service';
import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { debounceTime, fromEvent, of, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly recipeService = inject(RecipeService);
  private readonly categoryService = inject(CategoriesService);
  private readonly auth = inject(AuthService);
  private readonly fav = inject(FavoritesService);
  private readonly modal = inject(ModalService);
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);

  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;

  readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signals
  recipes = signal<any[]>([]);
  selectedIndex = signal(0);
  isMobile = signal(false);
  favoriteIds = signal<string[]>([]);
  dishesList = signal<any[]>([]);
  dishCategories = signal<{ [key: string]: any[] }>({});
  isVisible = signal(false);

  private subscriptions = new Subscription();

  ngOnInit(): void {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.initBrowserLogic();
    }

    // Отримання даних з резолверів
    this.subscriptions.add(
      this.route.data.subscribe((data: any) => {
        this.recipes.set(data.recentRecipe || []);
        const dishes = data.dishes?.data || [];
        this.dishesList.set(
          dishes.sort((a: any, b: any) => a.dishesName.localeCompare(b.dishesName)),
        );

        this.loadSeo(data.dishes?.url);
        this.loadAdditionalData();
      }),
    );
  }

  private initBrowserLogic(): void {
    this.checkScreen();
    this.subscriptions.add(
      fromEvent(window, 'resize')
        .pipe(debounceTime(100))
        .subscribe(() => this.checkScreen()),
    );

  this.subscriptions.add(
  this.auth.user$
    .pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }
        return this.fav.getFavorites(user.uid);
      })
    )
    .subscribe(ids => this.favoriteIds.set(ids))
);
  }

  checkScreen() {
    this.isMobile.set(window.innerWidth <= 900);
  }

  // SEO та Schema.org
  private loadSeo(url: string) {
    const title = 'Рецепти для щоденної кухні – Таверна «Синій Кіт»';
    const img =
      'https://firebasestorage.googleapis.com/v0/b/synikit-12dee.appspot.com/o/home%2Fbackground.webp?alt=media';

    this.titleService.setTitle(title);
    this.seoService.setCanonicalUrl(url);

    this.meta.updateTag({
      name: 'description',
      content:
        'Рецепти для щоденної кухні від таверни «Синій Кіт»: супи, борщі, м’ясні страви, гарніри, випічка та напої. Готуй вдома без зайвих ускладнень.',
    });
    this.meta.updateTag({ property: 'og:image', content: img });
    this.meta.updateTag({ property: 'og:url', content: url });

    this.setSchema({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: title,
      url: 'https://tsk.in.ua',
      image: img,
    });
  }

  private setSchema(schema: any) {
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, script);
  }

  // Завантаження категорій та кількості рецептів
  private loadAdditionalData() {
    this.dishesList().forEach((dish) => {
      // Завантаження підкатегорій
      this.categoryService.getLightById(dish.id).subscribe((categories) => {
        this.dishCategories.update((dc) => ({
          ...dc,
          [dish.id]: categories.sort((a, b) => a.categoryName.localeCompare(b.categoryName)),
        }));
      });
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.isBrowser) return;
    // Оптимізована логіка появи елементів (можна додати IntersectionObserver для кращої продуктивності)
    this.animateOnScroll();
  }

  private animateOnScroll() {
    const elements = this.document.querySelectorAll('.dishes_block');
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        this.renderer.addClass(el, 'show');
      }
    });
  }

  // Дії користувача
  selectRecipe(i: number) {
    this.selectedIndex.set(i);
  }
  isFavorite(id: string) {
    return this.favoriteIds().includes(id);
  }

  toggleFavorite(recipeId: string) {
    const user = this.auth.currentUser;

    // 🚫 Якщо не залогінений
    if (!user) {
      this.modal.open({
        type: 'auth',
        data: {
          reason: 'add-fav',
          recipeId,
          returnUrl: this.router.url,
        },
      });
      return;
    }

    // ✅ Якщо вже в обраному — видаляємо
    if (this.isFavorite(recipeId)) {
      this.fav
        .removeFavorite(user.uid, recipeId)
        .catch((err) => console.error('Remove favorite error:', err));
    }
    // ✅ Якщо нема — додаємо
    else {
      this.fav
        .addFavorite(user.uid, recipeId)
        .catch((err) => console.error('Add favorite error:', err));
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
