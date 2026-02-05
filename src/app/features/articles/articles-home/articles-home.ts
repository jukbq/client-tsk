import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
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
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '../../../core/services/seo/seo-service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-articles-home',
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './articles-home.html',
  styleUrl: './articles-home.scss',
})
export class ArticlesHome {
  // Injectors
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly seoServices = inject(SeoService);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly scroller = inject(ViewportScroller);
  private readonly renderer = inject(Renderer2);

  // ViewChild
  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;

  // Signals
  articleTypes = signal<any[]>([]);
  fontSize = signal<string>('');
  isVisible = signal<boolean>(false);

  isBrowser = isPlatformBrowser(this.platformId);
  currentURL = 'https://tsk.in.ua/articlses';

  ngOnInit(): void {
    // Отримання даних з резолвера через Signal
    this.route.data.subscribe((data: any) => {
      if (data.articleTypes) {
        this.currentURL = data.articleTypes.url || this.currentURL;
        this.articleTypes.set(data.articleTypes.data);
        this.loadSeoAndSchema();
      }
    });

    if (this.isBrowser) {
      this.scroller.scrollToPosition([0, 0]);
      this.updateFontSize();
    }
  }

  private loadSeoAndSchema() {
    const seoTitle = `Байки Синього Кота — смачні історії, легенди та пригоди в стилі таверни`;
    const seoDescription = `Читай байки Синього Кота – кулінарні легенди, веселі історії та загадки зі смаком таверни.`;
    const keywords = `синій кіт, байки про їжу, кулінарні легенди, таверна`;
    const mainImage = '/assets/image/baiky-synoho-kota.webp';

    this.seoServices.setCanonicalUrl(this.currentURL);
    this.titleService.setTitle(seoTitle);

    this.meta.updateTag({ name: 'description', content: seoDescription });
    this.meta.updateTag({ property: 'og:title', content: seoTitle });
    this.meta.updateTag({ property: 'og:image', content: mainImage });
 

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: seoTitle,
      description: seoDescription,
      url: this.currentURL,
      hasPart: this.articleTypes().map((cat: any) => ({
        '@type': 'CollectionPage',
        name: cat.name,
        url: cat.url,
      })),
      publisher: { '@type': 'Person', name: 'Оглій Юрій' },
      mainEntityOfPage: this.currentURL,
    };

    this.setSchema(schema);
  }

  private setSchema(schema: any): void {
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, script);
  }

  @HostListener('window:resize')
  updateFontSize() {
    if (!this.isBrowser) return;
    const width = window.innerWidth;
    // Логіка розрахунку (спрощено для прикладу)
    this.fontSize.set(width < 576 ? '5vh' : '12vh');
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.isBrowser) return;

    const scrollY = window.scrollY;

    // Паралакс через Renderer2 (безпечніше для SSR/DOM)
    const bgImage = this.document.querySelector('.bg_image') as HTMLElement;
    if (bgImage) {
      this.renderer.setStyle(bgImage, 'transform', `translate3d(0, ${scrollY * 0.8}px, 0)`);
    }

    // Перевірка видимості через Signal
    if (this.textBlocksRef) {
      const rect = this.textBlocksRef.nativeElement.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        this.isVisible.set(true);
      }
    }

    // Анімація карток через класи (можна переробити на Intersection Observer для перфомансу)
    const cards = this.document.querySelectorAll('.dishes_card');
    cards.forEach((card) => {
      if (card.getBoundingClientRect().top < window.innerHeight * 0.9) {
        card.classList.add('show');
      }
    });
  }
}
