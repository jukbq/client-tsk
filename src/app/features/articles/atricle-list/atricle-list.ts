import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import {
  Component,
  DOCUMENT,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../../core/services/seo/seo-service';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-atricle-list',
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './atricle-list.html',
  styleUrl: './atricle-list.scss',
})
export class AtricleList implements OnInit {
  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;

  // --- Dependency Injection ---
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly seoServices = inject(SeoService);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);

  // --- Signals ---
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly articles = signal<any[]>([]);
  readonly categoryName = signal('');
  readonly categoryDescription = signal('');
  readonly image = signal('');
  readonly additionalImage = signal('');
  readonly fontSize = signal('');
  readonly articleTypeName = signal('');
  readonly articleTypeID = signal('');
  readonly isVisible = signal(false);
  readonly currentURL = signal('');

  private ldJsonScript?: HTMLScriptElement;
  private readonly routeData = toSignal(this.route.data);

  // Ефект для обробки даних роута (замість конструктора/subscribe)
  private readonly dataEffect = effect(() => {
    const data = this.routeData();
    const wrapper = data?.['category'];
    const articlesData = data?.['articles'];
    const category = wrapper?.data;

    if (!category || !articlesData) {
      if (this.isBrowser) this.router.navigate(['/404']);
      return;
    }

    this.currentURL.set(wrapper.url || '');
    this.articles.set(articlesData.data || []);
    this.categoryName.set(category.aticleCategoryName);
    this.categoryDescription.set(category.aticleCategoryDescription);
    this.image.set(category.image);
    this.additionalImage.set(category.additionalImage);
    this.articleTypeName.set(category.articleType?.articleTypeName || ''); // Припустимо таку структуру
    this.articleTypeID.set(category.articleTypeID);

    this.setupSeo(category);

    if (this.isBrowser) {
      this.updateFontSize(this.articleTypeName());
    }
  });

  ngOnInit(): void {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }
  }

  private setupSeo(category: any) {
    const stripHtml = (html: string) => (html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '');
    const seoName = category.seoAticleCategoryName;
    const seoDesc = category.seoAticleCategoryDescription;

    this.titleService.setTitle(seoName);
    this.seoServices.setCanonicalUrl(this.currentURL());

    const tags: MetaDefinition[] = [
      { name: 'description', content: seoDesc },
      { property: 'og:title', content: seoName },
      { property: 'og:description', content: seoDesc },
      { property: 'og:image', content: this.image() },
      { property: 'og:url', content: this.currentURL() },
      { property: 'og:type', content: 'website' },
      ];
    tags.forEach((tag) => this.meta.updateTag(tag));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: this.categoryName(),
      description: stripHtml(this.categoryDescription()),
      url: this.currentURL(),
      image: this.image(),
      itemListElement: this.articles().map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: article.url,
      })),
      mainEntityOfPage: this.currentURL(),
      publisher: {
        '@type': 'Person',
        name: 'Оглій Юрій',
        url: 'https://tsk.in.ua',
      },
    };

    this.setSchema(schema);
  }

  private setSchema(schema: any): void {
    if (this.ldJsonScript) {
      this.renderer.removeChild(this.document.head, this.ldJsonScript);
    }
    this.ldJsonScript = this.renderer.createElement('script');
    this.ldJsonScript!.type = 'application/ld+json';
    this.ldJsonScript!.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, this.ldJsonScript);
  }

  private updateFontSize(name: string) {
    if (!this.isBrowser) return;
    const width = window.innerWidth;
    const len = name.length;
    let size = '18vh';

    if (width < 576) size = '5vh';
    else if (width < 789) size = len <= 10 ? '11vh' : '8vh';
    else if (width < 992) size = len <= 10 ? '15vh' : '10vh';
    else size = len <= 10 ? '18vh' : '12vh';

    this.fontSize.set(size);
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.isBrowser) return;
    const scrollY = window.scrollY;

    // Паралакс (через renderer для безпеки)
    const bgImage = this.document.querySelector('.bg_image') as HTMLElement;
    if (bgImage) {
      this.renderer.setStyle(bgImage, 'transform', `translate3d(0, ${scrollY * 0.8}px, 0)`);
    }

    // Анімація опису
    if (this.textBlocksRef) {
      const rect = this.textBlocksRef.nativeElement.getBoundingClientRect();
      if (window.innerHeight > rect.top + rect.height / 2) {
        this.isVisible.set(true);
      }
    }

    // Анімація карток
    const cards = this.document.querySelectorAll('.dishes_card:not(.show)');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (window.innerHeight > rect.top + rect.height / 4) {
        this.renderer.addClass(card, 'show');
      }
    });
  }
}
