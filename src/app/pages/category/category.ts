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
import { CategoriesDishesResponse } from '../../core/interfaces/categories -dishes';
import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../core/services/seo/seo-service';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { DishesResponse } from '../../core/interfaces/dishes';
import { SsrLinkDirective } from '../../shared/SsrLinkDirective/ssr-link.directive';

@Component({
  selector: 'app-category',
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class Category {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly route = inject(ActivatedRoute);
  private readonly seoServices = inject(SeoService);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);

  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;

  // Signals для реактивності
  image = signal('');
  additionalImage = signal('');
  h1Title = signal('');
  dishDescription = signal('');
  categryList = signal<CategoriesDishesResponse[]>([]);
  isVisible = signal(false);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  private currentURL = '';
  private ldJsonScript?: HTMLScriptElement;

  ngOnInit() {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }

    this.route.data.subscribe((data: any) => {
      const wrapper = data?.dishes;
      const categories = data?.categryList;

      if (!wrapper?.data || !categories?.length) {
        this.router.navigate(['/404']);
        return;
      }

      this.currentURL = wrapper.url;
      this.categryList.set(
        [...categories].sort((a, b) => a.categoryName.localeCompare(b.categoryName)),
      );
      this.setupSeo(wrapper.data);
    });
  }

  private setupSeo(dishes: DishesResponse) {
    this.h1Title.set(dishes.dishesName);
    this.dishDescription.set(dishes.dishDescription);
    this.image.set(dishes.image);
    this.additionalImage.set(dishes.additionalImage);

    this.titleService.setTitle(dishes.seoName);
    this.seoServices.setCanonicalUrl(this.currentURL);

    this.seoServices.setHreflang(this.currentURL);

    // Оновлення мета-тегів
    this.meta.updateTag({ name: 'description', content: dishes.seoDescription || '' });
    this.meta.updateTag({ property: 'og:title', content: dishes.seoName });
    this.meta.updateTag({ property: 'og:description', content: dishes.seoDescription || '' });
    this.meta.updateTag({ property: 'og:image', content: dishes.image });
    this.meta.updateTag({ property: 'og:url', content: this.currentURL });

    const collectionSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: dishes.dishesName,
      description: dishes.seoDescription,
      image: dishes.image,
      url: this.currentURL,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: this.categryList().map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.categoryName,
          url: `${this.currentURL.replace(/\/$/, '')}/recipes-list/${item.id}`,
        })),
      },
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
          name: 'Рецепти страв Таверни «Синій Кіт»',
          item: 'https://tsk.in.ua/dishes',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: dishes.dishesName,
          item: this.currentURL,
        },
      ],
    };

    this.setSchemas([collectionSchema, breadcrumbSchema]);
  }

  private setSchemas(schemas: any[]) {
    const existing = this.document.getElementById('category-schema');
    if (existing) {
      existing.remove();
    }

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'category-schema';
    script.text = JSON.stringify(schemas);

    this.renderer.appendChild(this.document.head, script);
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.isBrowser) return;

    const scrollY = window.scrollY;

    // Оптимізований паралакс через Renderer2
    const bg = this.document.querySelector('.bg_image') as HTMLElement;
    if (bg) {
      this.renderer.setStyle(bg, 'transform', `translate3d(0, ${scrollY * 0.4}px, 0)`);
    }

    // Поява контенту
    if (!this.isVisible() && this.textBlocksRef) {
      const rect = this.textBlocksRef.nativeElement.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        this.isVisible.set(true);
      }
    }

    // Поява карток
    this.document.querySelectorAll('.dishes_card').forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        this.renderer.addClass(card, 'show');
      }
    });
  }

  ngOnDestroy() {
    if (!this.isBrowser) return;
    const bg = this.document.querySelector('.bg_image') as HTMLElement | null;
    if (bg) {
      this.renderer.removeStyle(bg, 'transform');
    }
  }
}
