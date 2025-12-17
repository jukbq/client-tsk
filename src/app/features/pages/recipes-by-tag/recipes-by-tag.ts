import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  signal,
} from '@angular/core';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService, ShortRecipe } from '../../../core/services/search/search-service';
import { SeoService } from '../../../core/services/seo/seo-service';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-recipes-by-tag',
  imports: [FormsModule, SsrLinkDirective, NgOptimizedImage],
  templateUrl: './recipes-by-tag.html',
  styleUrl: './recipes-by-tag.scss',
})
export class RecipesByTag implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly seoService = inject(SeoService);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly renderer = inject(Renderer2);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  // Використовуємо Signals для реактивності
  recipes = signal<ShortRecipe[]>([]);
  displayCount = signal(8);
  query = '';

  // Computed signal автоматично оновлює список при зміні recipes або displayCount
  searchResults = computed(() => this.recipes().slice(0, this.displayCount()));

  private resizeSubscription?: Subscription;

  // Вивідні поля (можна теж зробити сигналами за бажанням)
  listTitle = '';
  listDescription = '';
  image = '';
  currentURL = '';

  ngOnInit(): void {
    // Отримуємо дані з резолвера
    this.route.data.subscribe((data: any) => {
      const resolvedData = data.recipes;

      if (!resolvedData || !resolvedData.recipes) {
        this.router.navigate(['/404']);
        return;
      }

      this.recipes.set(resolvedData.recipes);
      this.extractSeoDescription(resolvedData);
    });

    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.initBrowserLogic();
    }
  }

  private initBrowserLogic(): void {
    // Підписка на ресайз через RxJS
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(150), distinctUntilChanged())
      .subscribe(() => this.updateDisplayCount());

    this.updateDisplayCount();

  }

  updateDisplayCount(): void {
    if (!this.isBrowser) return;

    const width = window.innerWidth;
    let newCount = 8;

    if (width <= 480) newCount = 4;
    else if (width <= 780) newCount = 6;

    this.displayCount.set(newCount);
  }

  onSearch(): void {
    const trimmedQuery = this.query.trim();
    if (trimmedQuery.length >= 3) {
      this.searchService.searchRecipes(trimmedQuery).subscribe((results) => {
        this.recipes.set(results);
      });
    } else if (trimmedQuery.length === 0) {
      // Повертаємо початковий стан, якщо запит стерто (опціонально)
      // Можна додати логіку збереження початкових рецептів
    }
  }

  loadMore(): void {
    this.displayCount.update((count) => count + 8);
  }

  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
  }

  extractSeoDescription(data: any): void {
    this.currentURL = data.currentURL;
    this.seoService.setCanonicalUrl(this.currentURL);

    const found = [
      data.descriptionSeason,
      data.descriptionDifficulty,
      data.descriptionCountry,
      data.descriptionRegion,
      data.descriptionHoliday,
      data.descriptionRecipeType,
    ].find((d) => d?.title);

    if (found) {
    this.listTitle = found.title;
    this.listDescription = found.description;
    this.image = found.image;

    this.titleService.setTitle(found.metaTitle || found.title);

    // Явно вказуємо тип MetaDefinition[]
    // Також перетворюємо значення на String, щоб уникнути помилок з null/undefined
    const tags: MetaDefinition[] = [
      { name: 'description', content: String(found.metaDescription || '') },
      { property: 'og:title', content: String(found.metaTitle || found.title || '') },
      { property: 'og:description', content: String(found.metaDescription || '') },
      { property: 'og:image', content: String(found.image || '') },
      { property: 'og:url', content: String(this.currentURL || '') },
      { name: 'author', content: 'Yurii Ohlii' },
      { property: 'og:type', content: 'website' }
    ];

    tags.forEach(tag => this.meta.updateTag(tag));
  }
  }
}
