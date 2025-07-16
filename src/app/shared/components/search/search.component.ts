import { CommonModule, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShortRecipesResponse } from '../../interfaces/short-recipes';
import { SearchService } from '../../services/search/search.service';
import { SsrLinkDirective } from '../../directives/ssr-link.directive';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, SsrLinkDirective],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  isBrowser = false;

  recipes: ShortRecipesResponse[] = [];
  searchResults: ShortRecipesResponse[] = [];
  displayCount = 6;


  query = '';



  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private searchService: SearchService,
    private viewportScroller: ViewportScroller,
    private meta: Meta,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }


  ngOnInit(): void {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }

    this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });

    if (this.isBrowser) {
      const header = document.querySelector('header');
      if (header) {
        (header as HTMLElement).style.position = 'fixed';
      }
    }
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

}
