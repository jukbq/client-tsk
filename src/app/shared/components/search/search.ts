import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { SsrLinkDirective } from '../../SsrLinkDirective/ssr-link.directive';
import { FormsModule } from '@angular/forms';
import { SearchService, ShortRecipe } from '../../../core/services/search/search-service';
import { Meta } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, of, Subject } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { ShortRecipesResponse } from '../../../core/interfaces/short-recipes';

@Component({
  selector: 'app-search',
 imports: [FormsModule, 
    SsrLinkDirective, 
    NgOptimizedImage],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit {
  // ---------- inject ----------
  private platformId = inject(PLATFORM_ID);
  private searchService = inject(SearchService);
  private viewportScroller = inject(ViewportScroller);
  private meta = inject(Meta);

  private isBrowser = isPlatformBrowser(this.platformId);

  // ---------- signals ----------
  query = signal('');
  recipes = signal<ShortRecipe[]>([]);
  searchResults = signal<ShortRecipe[]>([]);

  private displayCount = 6;

 
  ngOnInit(): void {
    if (this.isBrowser) this.viewportScroller.scrollToPosition([0, 0]);
    this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
  }

  // ---------- handlers ----------
  onQueryChange(event: Event): void {
    if (!this.isBrowser) return;

    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);

    if (value.trim().length < 3) {
      this.searchResults.set([]);
      return;
    }

    this.searchService.searchRecipes(value).subscribe(results => {
      this.recipes.set(results);
      this.searchResults.set(results.slice(0, this.displayCount));
    });
  }

  loadMore(): void {
    const nextCount = this.searchResults().length + this.displayCount;
    this.searchResults.set(
      this.recipes().slice(0, nextCount)
    );
  }

}