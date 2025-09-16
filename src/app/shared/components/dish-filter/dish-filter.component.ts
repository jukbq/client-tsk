import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SearchService } from '../../services/search/search.service';
import { SeoService } from '../../services/seo/seo.service';

import { ShortRecipesResponse } from '../../interfaces/short-recipes';
import { Meta, Title } from '@angular/platform-browser';
import { SsrLinkDirective } from '../../directives/ssr-link.directive';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-dish-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, SsrLinkDirective],
  templateUrl: './dish-filter.component.html',
  styleUrl: './dish-filter.component.scss'
})
export class DishFilterComponent {
  isBrowser = false;

  recipes: ShortRecipesResponse[] = [];
  searchResults: ShortRecipesResponse[] = [];
  displayCount = 8;
  resizeSubscription?: Subscription;

  query = '';
  currentURL = '';

  // Вивідні поля
  listTitle = '';
  listDescription = '';
  image = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private viewportScroller: ViewportScroller,
    private seoService: SeoService,
    private titleService: Title,
    private meta: Meta,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: any) => {
      const resolvedData = data.recipes;

      if (!resolvedData || !resolvedData.recipes) {
        // SSR-friendly 404
        this.router.navigate(['/404']);
      }

      this.recipes = resolvedData.recipes;
      this.searchResults = this.recipes.slice(0, this.displayCount);
      this.currentURL = resolvedData.currentURL;
      this.seoService.setCanonicalUrl(this.currentURL);

      this.extractSeoDescription(resolvedData);
    });

    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);

      // Підписка на ресайз вікна
      this.resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
        this.updateDisplayCount();
      });
      this.updateDisplayCount();

      const header = document.querySelector('header');
      if (header) {
        (header as HTMLElement).style.position = 'fixed';
      }
    }
  }


  updateDisplayCount(): void {
    const width = window.innerWidth;
    let newCount = 8;

    if (width <= 480) {
      newCount = 4;
    } else if (width <= 780) {
      newCount = 6;
    }

    if (newCount !== this.displayCount) {
      this.displayCount = newCount;
      this.searchResults = this.recipes.slice(0, this.displayCount);
    }
  }

  // Не забуваємо відписатись при знищенні компонента
  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
  }


  onSearch(): void {
    if (this.query.trim().length >= 3) {
      this.searchService.searchRecipes(this.query).subscribe(results => {
        this.recipes = results;
        this.searchResults = this.recipes.slice(0, this.displayCount);
      });
    } else {
      this.searchResults = [];
    }
  }

  loadMore(): void {
    const nextCount = this.searchResults.length + this.displayCount;
    this.searchResults = this.recipes.slice(0, nextCount);
  }

  extractSeoDescription(data: any): void {
    const possibleDescriptions = [
      data.descriptionSeason,
      data.descriptionDifficulty,
      data.descriptionCountry,
      data.descriptionRegion,
      data.descriptionHoliday,
      data.descriptionRecipeType
    ];

    const found = possibleDescriptions.find(d => d?.title);

    if (found) {
      this.listTitle = found.title;
      this.listDescription = found.description;
      this.image = found.image;

      if (found.metaTitle) {
        this.titleService.setTitle(found.metaTitle);
        this.meta.updateTag({ property: 'og:title', content: found.metaTitle });
      }

      if (found.metaDescription) {
        this.meta.updateTag({ name: 'description', content: found.metaDescription });
        this.meta.updateTag({ property: 'og:description', content: found.metaDescription });
      }

      this.meta.updateTag({ name: 'author', content: 'Yurii Ohlii' });
      this.meta.updateTag({ name: 'imageUrl', content: found.image });
      this.meta.updateTag({ property: 'fb:app_id', content: '433617998637385' });
      this.meta.updateTag({ property: 'og:type', content: 'website' });
      this.meta.updateTag({ property: 'og:image', content: found.image });
      this.meta.updateTag({ property: 'og:url', content: this.currentURL });
    }
  }



}
