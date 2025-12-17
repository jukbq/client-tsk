import { Component, DOCUMENT, ElementRef, HostListener, inject, PLATFORM_ID, Renderer2, signal, ViewChild } from '@angular/core';
import { SsrLinkDirective } from '../../shared/SsrLinkDirective/ssr-link.directive';
import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '../../core/services/seo/seo-service';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dishes',
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './dishes.html',
  styleUrl: './dishes.scss',
})
export class Dishes {
  // Нова ін'єкція залежностей
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);
  private readonly route = inject(ActivatedRoute);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly seoService = inject(SeoService);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);

  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;

  dishes = signal<any[]>([]);
  isVisible = signal(false);
  
  readonly isBrowser = isPlatformBrowser(this.platformId);
  private currentURL = '';
  private ldJsonScript?: HTMLScriptElement;

  ngOnInit(): void {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }

    this.route.data.subscribe((data: any) => {
      this.currentURL = data?.dishes?.url || '/dishes';
      this.loadDishesList(data?.dishes?.data || []);
    });
  }

  loadDishesList(data: any[]): void {
    const seoTitle = 'Рецепти Синього Кота – Основні кулінарні категорії';
    const seoDescription = 'Переглянь основні категорії страв у стилі таверни Синій Кіт.';
    const mainImage = 'https://tsk.in.ua/assets/image/recepty-synoho-kota.webp';

    this.seoService.setCanonicalUrl(this.currentURL);
    this.titleService.setTitle(seoTitle);

    // Виправлення помилки типізації MetaDefinition
    const tags: MetaDefinition[] = [
      { name: 'description', content: seoDescription },
      { property: 'og:title', content: seoTitle },
      { property: 'og:description', content: seoDescription },
      { property: 'og:url', content: this.currentURL },
      { property: 'og:image', content: mainImage },
      { name: 'keywords', content: 'рецепти, страви, кулінарія, таверна, салати' },
      { name: 'author', content: 'Yurii Ohlii' }
    ];

    tags.forEach(tag => this.meta.updateTag(tag));

    this.dishes.set([...data].sort((a, b) => a.dishesName.localeCompare(b.dishesName)));

    this.setSchema({
      '@context': 'https://schema.org',
      '@type': 'WebSite', // Можна змінити на Guide або CollectionPage
      name: seoTitle,
      url: 'https://tsk.in.ua/dishes',
      description: seoDescription,
      image: mainImage,
      publisher: { '@type': 'Person', name: 'Оглій Юрій' }
    });
  }

  setSchema(schema: any): void {
    if (this.ldJsonScript) {
      this.renderer.removeChild(this.document.head, this.ldJsonScript);
    }
    this.ldJsonScript = this.renderer.createElement('script');
    if (this.ldJsonScript) {
      this.ldJsonScript.type = 'application/ld+json';
      this.ldJsonScript.text = JSON.stringify(schema);
      this.renderer.appendChild(this.document.head, this.ldJsonScript);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) return;

    // Анімація появи опису (Signals запобігає зайвим циклам перевірки)
    if (!this.isVisible() && this.textBlocksRef) {
      const rect = this.textBlocksRef.nativeElement.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        this.isVisible.set(true);
      }
    }

    // Анімація карток через Renderer2 (більш продуктивно для DOM)
    this.document.querySelectorAll('.dishes_card').forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        this.renderer.addClass(card, 'show');
      }
    });
  }
}
