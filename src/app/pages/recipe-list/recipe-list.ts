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
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { SsrLinkDirective } from '../../shared/SsrLinkDirective/ssr-link.directive';
import { SeoService } from '../../core/services/seo/seo-service';
import { RecipeStateService } from '../../core/services/recipe-state/recipe-state-service';
import { FavoritesService } from '../../core/services/favorites/favorites-service';
import { AuthService } from '../../core/services/auth/auth-service';
import { ModalService } from '../../core/services/modal/modal.service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList {
  // ===== DI =====
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly seoServices = inject(SeoService);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly recipeStateService = inject(RecipeStateService);
  private readonly fav = inject(FavoritesService);
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);

  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;

  // ===== STATE =====
  image = signal('');
  additionalImage = signal('');
  categoryName = signal('');
  categoryDescription = signal('');
  dishesName = signal('');
  dishesID = signal('');
  recipesFilter = signal<any[]>([]);
  favoriteIds = signal<string[]>([]);
  isVisible = signal(false);
  fontSize = signal('5vh');

  readonly isBrowser = isPlatformBrowser(this.platformId);

  private currentURL = '';
  private ldJsonScript?: HTMLScriptElement;

  // ===== INIT =====
  ngOnInit() {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);

      this.auth.user$
        .pipe(
          switchMap((user) => {
            if (!user) {
              return of([]);
            }
            return this.fav.getFavorites(user.uid);
          }),
        )
        .subscribe((ids) => this.favoriteIds.set(ids));
    }

    // 🔥 ВСЕ — З RESOLVER
    this.route.data.subscribe((data: any) => {
      if (!data?.category?.data?.dishes?.dishesName) {
        this.router.navigate(['/404']);
        return;
      }

      // 1️⃣ Категорія + SEO
      this.applyCategoryData(data.category);

      // 2️⃣ Рецепти
      const recipes = Array.isArray(data.recipes) ? data.recipes : [];

      const sorted = [...recipes].sort((a, b) => a.recipeTitle.localeCompare(b.recipeTitle));

      this.recipesFilter.set(sorted);
      this.recipeStateService.setRecipes(sorted);

      // 3️⃣ Schema ТІЛЬКИ ТЕПЕР
      this.setItemListSchema(data.category, sorted);
    });
  }

  // ===== CATEGORY + SEO =====
  private applyCategoryData(category: any) {
    const cat = category.data;

    this.image.set(cat.image);
    this.additionalImage.set(cat.additionalImage);
    this.categoryName.set(cat.categoryName);
    this.categoryDescription.set(cat.categoryDescription);
    this.dishesName.set(cat.dishes.dishesName);
    this.dishesID.set(cat.dishes.id);

    this.currentURL = category.url;

    this.titleService.setTitle(cat.seoCategoryName);
    this.seoServices.setCanonicalUrl(this.currentURL);
    this.seoServices.setHreflang(this.currentURL);

    const tags: MetaDefinition[] = [
      { name: 'description', content: cat.seoCategoryDescription },
      { property: 'og:title', content: cat.seoCategoryName },
      { property: 'og:description', content: cat.seoCategoryDescription },
      { property: 'og:image', content: cat.image },
      { property: 'og:url', content: this.currentURL },
      { property: 'og:type', content: 'website' },
    ];

    tags.forEach((tag) => this.meta.updateTag(tag));

    this.updateFontSize(cat.categoryName);
  }

  // ===== SCHEMA =====
  private setItemListSchema(category: any, recipes: any[]) {
    const cat = category.data;

    const itemListSchema = {
      '@context': 'https://schema.org',
     '@type': 'CollectionPage',
      name: cat.categoryName,
      url: category.url,
      image: cat.image,
      description: this.stripHtml(cat.categoryDescription),
      itemListElement: recipes.map((recipe, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: recipe.recipeTitle,
        url: `https://tsk.in.ua/recipe-page/${recipe.id}`,
      })),
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Головна',
          item: 'https://tsk.in.ua/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Рецепти Синього Кота',
          item: 'https://tsk.in.ua/dishes',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: cat.dishes.dishesName,
          item: `https://tsk.in.ua/categories/${cat.dishes.id}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: cat.categoryName,
          item: category.url,
        },
      ],
    };

    this.setSchema([itemListSchema, breadcrumbSchema]);
  }

 private setSchema(schemas: any[]){
    if (this.ldJsonScript) {
      this.renderer.removeChild(this.document.head, this.ldJsonScript);
    }

    this.ldJsonScript = this.renderer.createElement('script');
    if (this.ldJsonScript) {
      this.ldJsonScript.type = 'application/ld+json';
      this.ldJsonScript.text = JSON.stringify(schemas);
      this.renderer.appendChild(this.document.head, this.ldJsonScript);
    }
  }

  private stripHtml(html: string): string {
    return html
      ?.replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300);
  }

  // ===== UI =====
  updateFontSize(name: string) {
    if (!this.isBrowser) return;

    const w = window.innerWidth;
    const len = name.length;

    if (w >= 992) this.fontSize.set(len <= 10 ? '18vh' : len <= 20 ? '15vh' : '12vh');
    else if (w >= 789) this.fontSize.set(len <= 10 ? '15vh' : len <= 20 ? '12vh' : '10vh');
    else if (w >= 576) this.fontSize.set(len <= 10 ? '11vh' : len <= 20 ? '10vh' : '8vh');
  }

  isFavorite(id: string): boolean {
    return this.favoriteIds().includes(id);
  }

  toggleFavorite(id: string) {
    const user = this.auth.currentUser;

    if (!user) {
      this.modal.open({
        type: 'auth',
        data: { reason: 'add-fav', recipeId: id, returnUrl: this.router.url },
      });
      return;
    }

    if (this.isFavorite(id)) {
      this.fav.removeFavorite(user.uid, id).catch((err) => console.error(err));
    } else {
      this.fav.addFavorite(user.uid, id).catch((err) => console.error(err));
    }
  }

  // ===== SCROLL EFFECTS =====
  @HostListener('window:scroll')
  onScroll() {
    if (!this.isBrowser) return;

    const scrollY = window.scrollY;

    const bg = this.document.querySelector('.bg_image') as HTMLElement;
    if (bg) {
      this.renderer.setStyle(bg, 'transform', `translate3d(0, ${Math.round(scrollY * 0.4)}px, 0)`);
    }

    if (!this.isVisible() && this.textBlocksRef) {
      const rect = this.textBlocksRef.nativeElement.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        this.isVisible.set(true);
      }
    }

    this.document.querySelectorAll('.dishes_card').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        this.renderer.addClass(el, 'show');
      }
    });
  }

  ngOnDestroy() {
    if (!this.isBrowser) return;
    if (this.ldJsonScript) {
      this.renderer.removeChild(this.document.head, this.ldJsonScript);
    }
  }
}
