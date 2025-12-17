import {
  Component,
  DOCUMENT,
  ElementRef,
  HostListener,
  inject,
  Inject,
  PLATFORM_ID,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { СuisineResponse } from '../../core/interfaces/cuisine';
import { RegionResponse } from '../../core/interfaces/region';
import { ProductsRequest } from '../../core/interfaces/products';
import { SsrLinkDirective } from '../../shared/SsrLinkDirective/ssr-link.directive';
import { AuthModal } from '../../shared/components/auth-modal/auth-modal';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { SeoService } from '../../core/services/seo/seo-service';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { RecipeService } from '../../core/services/recipe/recipe-service';
import { RecipeStateService } from '../../core/services/recipe-state/recipe-state-service';
import { FavoritesService } from '../../core/services/favorites/favorites-service';
import { AuthService } from '../../core/services/auth/auth-service';
import { ModalService } from '../../core/services/modal/modal.service';

interface RecipeLight {
  id: string;
  recipeTitle: string;
  mainImage: string;
  cuisine: СuisineResponse;
  region: RegionResponse;
  ingredients: ProductsRequest[];
}

@Component({
  selector: 'app-recipe-list',
  imports: [SsrLinkDirective, AuthModal, NgOptimizedImage],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly seoServices = inject(SeoService);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly recipeService = inject(RecipeService);
  private readonly recipeStateService = inject(RecipeStateService);
  private readonly fav = inject(FavoritesService);
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);

  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;

  // Стан через Signals
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

  ngOnInit() {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      
      // Підписка на користувача для обраного
      this.auth.user$.subscribe((user) => {
        if (user) {
          this.fav.getFavorites(user.uid).subscribe((ids) => this.favoriteIds.set(ids));
        }
      });
    }

    // Параметри маршруту (ID категорії)
    this.route.paramMap.subscribe((params) => {
      const categoryId = params.get('categoryid');
      if (categoryId) {
        this.recipeStateService.setCategoryId(categoryId);
        this.loadRecipes(categoryId);
      }
    });

    // Дані з резолвера (SEO та мета-дані)
    this.route.data.subscribe((data: any) => {
      if (!data?.category?.data?.dishes?.dishesName) {
        this.router.navigate(['/404']);
        return;
      }
      this.applyResolverData(data);
    });
  }

  private loadRecipes(categoryId: string) {
    const saved = this.recipeStateService.getRecipes();
    if (saved && saved.length > 0) {
      this.recipesFilter.set([...saved].sort((a, b) => a.recipeTitle.localeCompare(b.recipeTitle)));
    } else {
      this.recipeService.getRecipeLightById(categoryId).subscribe((data: any) => {
        const sorted = [...data].sort((a, b) => a.recipeTitle.localeCompare(b.recipeTitle));
        this.recipesFilter.set(sorted);
        this.recipeStateService.setRecipes(data);
      });
    }
  }

  private applyResolverData(data: any) {
    const cat = data.category.data;
    this.image.set(cat.image);
    this.additionalImage.set(cat.additionalImage);
    this.categoryName.set(cat.categoryName);
    this.categoryDescription.set(cat.categoryDescription);
    this.dishesName.set(cat.dishes.dishesName);
    this.dishesID.set(cat.dishes.id);
    
    this.currentURL = data.category.url;

    // SEO з використанням MetaDefinition для запобігання помилок TS
    this.titleService.setTitle(cat.seoCategoryName);
    this.seoServices.setCanonicalUrl(this.currentURL);

    const tags: MetaDefinition[] = [
      { name: 'description', content: cat.seoCategoryDescription },
      { name: 'keywords', content: cat.keywords },
      { property: 'og:title', content: cat.seoCategoryName },
      { property: 'og:image', content: cat.image },
      { property: 'og:url', content: this.currentURL },
      { property: 'og:type', content: 'website' }
    ];
    tags.forEach(tag => this.meta.updateTag(tag));

    this.setSchema({
      '@context': 'https://schema.org',
      '@type': 'Recipe', // Можна адаптувати під CollectionPage для списку
      name: cat.categoryName,
      url: this.currentURL,
      image: cat.image,
      description: cat.categoryDescription
    });

    this.updateFontSize(cat.categoryName);
  }

  private setSchema(schema: any) {
    if (this.ldJsonScript) this.renderer.removeChild(this.document.head, this.ldJsonScript);
    this.ldJsonScript = this.renderer.createElement('script');
    if (this.ldJsonScript) {
      this.ldJsonScript.type = 'application/ld+json';
      this.ldJsonScript.text = JSON.stringify(schema);
      this.renderer.appendChild(this.document.head, this.ldJsonScript);
    }
  }

  updateFontSize(name: string) {
    if (!this.isBrowser) return;
    const w = window.innerWidth;
    const len = name.length;
    let size = '5vh';

    if (w >= 992) size = len <= 10 ? '18vh' : len <= 20 ? '15vh' : '12vh';
    else if (w >= 789) size = len <= 10 ? '15vh' : len <= 20 ? '12vh' : '10vh';
    else if (w >= 576) size = len <= 10 ? '11vh' : len <= 20 ? '10vh' : '8vh';
    
    this.fontSize.set(size);
  }

  isFavorite(id: string) {
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
      this.fav.removeFavorite(user.uid, id);
      this.favoriteIds.update(ids => ids.filter(favId => favId !== id));
    } else {
      this.fav.addFavorite(user.uid, id);
      this.favoriteIds.update(ids => [...ids, id]);
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.isBrowser) return;
    const scrollY = window.scrollY;

    // Паралакс фону
    const bg = this.document.querySelector('.bg_image') as HTMLElement;
    if (bg) {
      this.renderer.setStyle(bg, 'transform', `translate3d(0, ${Math.round(scrollY * 0.4)}px, 0)`);
    }

    // Анімація контенту
    if (!this.isVisible() && this.textBlocksRef) {
      const rect = this.textBlocksRef.nativeElement.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) this.isVisible.set(true);
    }

    // Анімація карток
    this.document.querySelectorAll('.dishes_card').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) this.renderer.addClass(el, 'show');
    });
  }
  
}
