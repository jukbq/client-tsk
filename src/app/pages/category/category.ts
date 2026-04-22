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
import { CategoriesDishesResponse } from '../../core/interfaces/categories -dishes';
import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../core/services/seo/seo-service';
import { Meta, Title } from '@angular/platform-browser';
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
  verticalImage = signal('');
  h1Title = signal('');
  dishDescription = signal('');
  categryList = signal<CategoriesDishesResponse[]>([]);
  isVisible = signal(false);

  faq = signal<any[]>([]);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  private currentURL = '';

  ngOnInit() {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }

    this.route.data.subscribe((data: any) => {
      const wrapper = data?.dishes;
      const categories = data?.categryList;

     if (!wrapper || !categories?.length) {
        this.router.navigate(['/404']);
        return;
      }

      this.currentURL = wrapper.url;
      this.categryList.set(categories);

      // 🔥 UI дані
      this.h1Title.set(wrapper.data.dishesName);
      this.dishDescription.set(wrapper.data.dishDescription);
      this.image.set(wrapper.data.image);
      this.additionalImage.set(wrapper.data.additionalImage);
      this.verticalImage.set(wrapper.data.verticalImage);

      this.faq.set(wrapper.faq || []);

      // 🔥 META з resolver
      if (wrapper.meta) {
        this.titleService.setTitle(wrapper.meta.title);

        this.meta.updateTag({
          name: 'description',
          content: wrapper.meta.description,
        });

        this.meta.updateTag({
          property: 'og:title',
          content: wrapper.meta.title,
        });

        this.meta.updateTag({
          property: 'og:description',
          content: wrapper.meta.description,
        });

        this.meta.updateTag({
          property: 'og:image',
          content: wrapper.meta.image,
        });

        this.meta.updateTag({
          property: 'og:url',
          content: wrapper.meta.url,
        });

        this.seoServices.setCanonicalUrl(wrapper.meta.url);
        this.seoServices.setHreflang(wrapper.meta.url);
      }

      // 🔥 SCHEMA з resolver
      if (wrapper.schemas?.length) {
        this.seoServices.setSchema({
          '@context': 'https://schema.org',
          '@graph': wrapper.schemas,
        });
      }
    });
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
