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
  verticalImage = signal('');
  categoryName = signal('');
  categoryDescription = signal('');
  dishesName = signal('');
  dishesID = signal('');
  recipesFilter = signal<any[]>([]);
  favoriteIds = signal<string[]>([]);
  isVisible = signal(false);
  fontSize = signal('5vh');

  categoryFaq = signal<any[]>([]);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  private currentURL = '';


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

      const itemListSchema = {
        '@type': 'CollectionPage',
        name: data.category.data.categoryName,
        url: data.category.url,
        description: this.stripHtml(data.category.data.categoryDescription),
        itemListElement: data.recipes.map((recipe: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: recipe.recipeTitle,
          url: `https://tsk.in.ua/recipe-page/${recipe.id}`,
        })),
      };

      this.seoServices.setSchema({
        '@context': 'https://schema.org',
        '@graph': [...data.category.schemas, itemListSchema],
      });
      this.recipeStateService.setRecipes(sorted);
    });
  }

  // ===== CATEGORY + SEO =====
  private applyCategoryData(category: any) {
    const cat = category.data;

    this.image.set(cat.image);
    this.additionalImage.set(cat.additionalImage);
    this.verticalImage.set(cat.verticalImage);
    this.categoryName.set(cat.categoryName);
    this.categoryDescription.set(cat.categoryDescription);
    this.dishesName.set(cat.dishes.dishesName);
    this.dishesID.set(cat.dishes.id);
    this.categoryFaq.set(cat.faq || []);

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





  private stripHtml(html: string): string {
    const text = html
      ?.replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return text.length > 300 ? text.slice(0, text.lastIndexOf(' ', 300)) + '...' : text;
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

  }
}
