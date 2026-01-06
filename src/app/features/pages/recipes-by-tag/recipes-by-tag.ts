import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, fromEvent, Subscription } from 'rxjs';

import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { SearchService, ShortRecipe } from '../../../core/services/search/search-service';
import { SeoService } from '../../../core/services/seo/seo-service';

@Component({
  selector: 'app-recipes-by-tag',
  standalone: true,
  imports: [FormsModule, SsrLinkDirective, NgOptimizedImage],
  templateUrl: './recipes-by-tag.html',
  styleUrl: './recipes-by-tag.scss',
})
export class RecipesByTag implements OnInit, OnDestroy {
  // ===== DI =====
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly seoService = inject(SeoService);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  // ===== State =====
  recipes = signal<ShortRecipe[]>([]);
  displayCount = signal(8);
  query = '';

  searchResults = computed(() =>
    this.recipes().slice(0, this.displayCount())
  );

  listTitle = '';
  listDescription = '';
  image = '';
  currentURL = '';

  private resizeSubscription?: Subscription;

  // ===== Lifecycle =====
  ngOnInit(): void {
    // 🔴 ФІЛЬТРИ = NOINDEX (обовʼязково)
    this.meta.updateTag({
      name: 'robots',
      content: 'noindex, follow',
    });

    // Дані з резолвера (через snapshot — стабільно для SSR)
    const resolved = this.route.snapshot.data['recipes'];

    if (!resolved || !resolved.recipes) {
      this.router.navigate(['/404']);
      return;
    }

    this.recipes.set(resolved.recipes);
    this.currentURL = resolved.currentURL;

    // Canonical (self)
    this.seoService.setCanonicalUrl(this.currentURL);

    // SEO-текст (для UX + соцмереж, не для індексу)
    this.applySeoDescription(resolved);

    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.initBrowserLogic();
    }
  }

  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
  }

  // ===== Browser-only logic =====
  private initBrowserLogic(): void {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(150), distinctUntilChanged())
      .subscribe(() => this.updateDisplayCount());

    this.updateDisplayCount();
  }

  private updateDisplayCount(): void {
    if (!this.isBrowser) return;

    const width = window.innerWidth;

    if (width <= 480) this.displayCount.set(4);
    else if (width <= 780) this.displayCount.set(6);
    else this.displayCount.set(8);
  }

  // ===== Search =====
  onSearch(): void {
    const q = this.query.trim();

    if (q.length < 3) return;

    this.searchService.searchRecipes(q).subscribe(results => {
      this.recipes.set(results);
    });
  }

  loadMore(): void {
    this.displayCount.update(v => v + 8);
  }

  // ===== SEO helpers =====
  private applySeoDescription(data: any): void {
    const found = [
      data.descriptionSeason,
      data.descriptionDifficulty,
      data.descriptionCuisine,
      data.descriptionRegion,
      data.descriptionHoliday,
      data.descriptionRecipeType,
    ].find(d => d?.title);

    if (!found) return;

    this.listTitle = found.title;
    this.listDescription = found.description;
    this.image = found.image;

    // Title — для UX
    this.titleService.setTitle(found.metaTitle || found.title);

    // Meta — мінімум, без фанатизму
    const tags: MetaDefinition[] = [
      { name: 'description', content: String(found.metaDescription || '') },
      { property: 'og:title', content: String(found.metaTitle || found.title) },
      { property: 'og:description', content: String(found.metaDescription || '') },
      { property: 'og:image', content: String(found.image || '') },
      { property: 'og:url', content: String(this.currentURL) },
      { property: 'og:type', content: 'website' },
    ];

    tags.forEach(tag => this.meta.updateTag(tag));
  }
}
