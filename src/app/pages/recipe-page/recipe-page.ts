import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import {
  Component,
  computed,
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
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { SeoService } from '../../core/services/seo/seo-service';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import { RecipeHeader } from './recipe-header/recipe-header';
import { RecipeInfo } from './recipe-info/recipe-info';
import { sign } from 'crypto';
import { RecipeDescriptio } from './recipe-descriptio/recipe-descriptio';
import { DisplayAds } from '../../shared/components/adsense/display-ads/display-ads';
import { Ingredients } from './ingredients/ingredients';
import { Instructions } from './instructions/instructions';
import { RecipeAdviceC } from './recipe-advice-c/recipe-advice-c';
import { RecipeCarousel } from './recipe-carousel/recipe-carousel';
import { RelatedRecipes } from './related-recipes/related-recipes';
import { Soft404 } from '../soft-404/soft-404';

interface MenuItem {
  id: string;
  label: string;
  index: number;
}

@Component({
  selector: 'app-recipe-page',
  imports: [
    Breadcrumb,
    RecipeHeader,
    RecipeInfo,
    RecipeDescriptio,
    DisplayAds,
    Ingredients,
    Instructions,
    RecipeAdviceC,
    RecipeCarousel,
    RelatedRecipes,
    Soft404,
  ],
  templateUrl: './recipe-page.html',
  styleUrl: './recipe-page.scss',
})
export class RecipePage {
  // Залежності через inject()
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly seoServices = inject(SeoService);
  private readonly viewportScroller = inject(ViewportScroller);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  // Стан (Signals)
  activeItem = signal(0);
  dishesID = signal('');
  dishesName = signal('');
  categoryID = signal('');
  categoryName = signal('');
  recipeTitle = signal('');
  mainImageDesktop = signal('');
  mainImageMobile = signal('');
  recipeID = signal('');
  recipeSubtitles = signal('');
  descriptionRecipe = signal('');
  advice = signal('');
  completion = signal('');
  currentURL = signal('');

  seasons = signal<any[]>([]);
  info = signal<any[]>([]);
  accompanyingRecipes = signal<any[]>([]);
  relatedRecipes = signal<any[]>([]);
  ingredients = signal<any[]>([]);
  instructions = signal<any[]>([]);
  accompanyingArticles = signal<any[]>([]);

  isNotFound = signal(false);

  ratingSum = signal(0);
  ratingCount = signal(0);

  menuItems: MenuItem[] = [
    { id: 'recipe-about', label: 'ПРО РЕЦЕПТ', index: 0 },
    { id: 'ingredients', label: 'ІНГРЕДІЄНТИ', index: 1 },
    { id: 'instruction', label: 'КРОКИ', index: 2 },
    { id: 'council', label: 'ПОРАДИ', index: 3 },
  ];

  headerHeight = signal(0);
  menuHeight = signal(60);

  averageRating = computed(() => {
  const count = this.ratingCount();
  if (!count) return 0;
  return this.ratingSum() / count;
});


  totalOffset = computed(() => this.menuHeight());

  ngOnInit() {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }

    // 2. Слухаємо зміну даних
    this.route.data.subscribe((data: any) => {
      const recipeData = data?.recipe;
      if (!recipeData?.recipeSSR) {
        this.isNotFound.set(true);
        return;
      }

      this.isNotFound.set(false);
      this.applyRecipeData(recipeData);

      // --- ДОДАЙТЕ ЦЕЙ БЛОК ТУТ ---
      // Коли дані застосовані, скролимо вгору
      if (this.isBrowser) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        // або використовуйте 'smooth', якщо хочете бачити переліт
      }
      // ----------------------------
    });
  }

  private applyRecipeData(data: any) {
    const ssr = data.recipeSSR;

    this.ratingSum.set(ssr.ratingSum || 0);
    this.ratingCount.set(ssr.ratingCount || 0);

    // Масове оновлення сигналів
    this.dishesID.set(ssr.dishesID);
    this.dishesName.set(ssr.dishesName);
    this.categoryID.set(ssr.categoryID);
    this.categoryName.set(ssr.categoryName);
    this.recipeTitle.set(ssr.recipeTitle);
    this.mainImageDesktop.set(ssr.mainImageDesktop);
    this.mainImageMobile.set(ssr.mainImageMobile);
    this.recipeID.set(ssr.recipeID);

    this.recipeSubtitles.set(ssr.recipeSubtitles);
    this.descriptionRecipe.set(ssr.descriptionRecipe);
    this.advice.set(ssr.advice);
    this.completion.set(ssr.completion);
    this.seasons.set(ssr.bestSeason || []);
    this.ingredients.set(ssr.ingredients || []);
    this.accompanyingRecipes.set(ssr.accompanyingRecipes || []);
    this.instructions.set(ssr.instructions || []);
    this.info.set(data.info || []);

    this.relatedRecipes.set(ssr.relatedRecipes || []);
    this.setMetaTags(data.recipeMeta);

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
          name: 'Рецепти страв Таверни «Синій Кіт»',
          item: 'https://tsk.in.ua/dishes',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: ssr.dishesName,
          item: `https://tsk.in.ua/categories/${ssr.dishesID}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: ssr.categoryName,
          item: `https://tsk.in.ua/recipes-list/${ssr.categoryID}`,
        },
        { '@type': 'ListItem', position: 5, name: ssr.recipeTitle, item: ssr.currentURL },
      ],
    };

    this.setSchema(data.recipeSchema, 'recipe');
    this.setSchema(breadcrumbSchema, 'breadcrumb');
  }

  private setSchema(schema: any, id: string): void {
    const selector = `script[data-schema="${id}"]`;

    let script = this.document.querySelector(selector) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', id);
      this.document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(schema);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    setTimeout(() => {
      // Додаємо "as HTMLElement", щоб відкрити доступ до offsetHeight
      const header = this.document.querySelector('header') as HTMLElement;
      const menu = this.document.querySelector('.menu_block') as HTMLElement;

      if (header) {
        this.headerHeight.set(header.offsetHeight);
      }

      if (menu) {
        // Тепер помилки не буде
        this.menuHeight.set(menu.offsetHeight);
      }
    }, 0);
  }

  private setMetaTags(meta: any) {
    if (!meta) return;

    this.currentURL.set(meta.currentURL);
    this.titleService.setTitle(meta.seoName);
console.log(meta.seoDescription);

    const tags: MetaDefinition[] = [
     
      { property: 'description', content: meta.seoDescription },
      { property: 'og:title', content: meta.seoName },
       { property: 'og:description', content: meta.seoDescription },
      { property: 'og:image', content: meta.mainImage  },
      { property: "og:image:width", content: "1920" },
      { property: "og:image:height", content: "1080" },
      { property: 'og:image', content: meta.mainImage  },
      
      { property: 'og:url', content: meta.currentURL },
      { property: 'og:type', content: 'article' }, // Для рецептів краще article
      { property: 'fb:app_id', content: '433617998637385' },
    ];

    tags.forEach((tag) => this.meta.updateTag(tag));
    this.seoServices.setCanonicalUrl(meta.currentURL);

    this.seoServices.setHreflang(meta.currentURL);
  }

  onMenuClick(item: MenuItem) {
    this.activeItem.set(item.index);
    const el = this.document.getElementById(item.id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - this.totalOffset();
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.isBrowser) return;

    const middleScreen = window.innerHeight / 3; // Поріг спрацювання трохи вище середини

    for (const item of this.menuItems) {
      const el = this.document.getElementById(item.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= middleScreen && rect.bottom >= middleScreen) {
          this.activeItem.set(item.index);
          break;
        }
      }
    }
  }
}
