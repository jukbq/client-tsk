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
  dishesName = signal('');
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
      
      if (!wrapper?.data || !categories) {
        this.router.navigate(['/404']);
        return;
      }

      this.currentURL = wrapper.url;
      this.categryList.set(
        [...categories].sort((a, b) => a.categoryName.localeCompare(b.categoryName))
      );
      this.setupSeo(wrapper.data);
    });
  }

  private setupSeo(dishes: DishesResponse) {
    this.dishesName.set(dishes.dishesName);
    this.dishDescription.set(dishes.dishDescription);
    this.image.set(dishes.image);
    this.additionalImage.set(dishes.additionalImage);

    this.titleService.setTitle(dishes.seoName);
    this.seoServices.setCanonicalUrl(this.currentURL);

    // Оновлення мета-тегів
    this.meta.updateTag({ name: 'description', content: dishes.seoDescription || '' });
    this.meta.updateTag({ property: 'og:title', content: dishes.seoName });
    this.meta.updateTag({ property: 'og:image', content: dishes.image });
    this.meta.updateTag({ property: 'og:url', content: this.currentURL });

    this.setSchema({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: dishes.dishesName,
      description: dishes.seoDescription,
      image: dishes.image,
      url: this.currentURL
    });
  }

  private setSchema(schema: any) {
    if (this.ldJsonScript) {
      this.renderer.removeChild(this.document.head, this.ldJsonScript);
    }
    this.ldJsonScript = this.renderer.createElement('script');
    this.ldJsonScript!.type = 'application/ld+json';
    this.ldJsonScript!.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, this.ldJsonScript);
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
    this.document.querySelectorAll('.dishes_card').forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        this.renderer.addClass(card, 'show');
      }
    });
  }
}
