import { Component, DOCUMENT, effect, inject, OnInit, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../../core/services/seo/seo-service';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { DisplayAds } from "../../../shared/components/adsense/display-ads/display-ads";

@Component({
  selector: 'app-article-page',
  imports: [SsrLinkDirective, NgOptimizedImage, DisplayAds],
  templateUrl: './article-page.html',
  styleUrl: './article-page.scss',
  
})
export class ArticlePage implements OnInit {
// --- Dependency Injection ---
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seoServices = inject(SeoService);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly renderer = inject(Renderer2);

  // --- Signals ---
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly currentURL = signal('');
  readonly articleName = signal('');
  readonly image = signal('');
  readonly articleTypeID = signal('');
  readonly articleTypeName = signal('');
  readonly aticleCategoryID = signal('');
  readonly aticleCategoryName = signal('');
  readonly articleContent = signal<any[]>([]);
  readonly activeItem = signal(0);
  
  private ldJsonScript?: HTMLScriptElement;
  private menuOffset = 100;

  // Перетворюємо Observable в сигнал
  private readonly routeData = toSignal(this.route.data);

  // Ефект замість конструктора — чистенько і сучасно
  private readonly dataUpdateEffect = effect(() => {
    const data = this.routeData();
    // Виправляємо помилку ts(4111) через квадратні дужки
    const wrapper = data?.['article'];
    
    if (wrapper) {
      this.processArticleData(wrapper);
    }
  });

  ngOnInit(): void {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      // Невелика затримка, щоб DOM встиг відрендеритись для заміру висоти
      setTimeout(() => {
        const menuElement = this.document.querySelector('.recipe_menu') as HTMLElement;
        this.menuOffset = menuElement ? menuElement.offsetHeight + 20 : 100;
      }, 0);
    }
  }

  private processArticleData(wrapper: any) {
    const article = wrapper.data;
    
    if (!article || (Array.isArray(article) && article.length === 0)) {
      this.router.navigate(['/404']);
      return;
    }

    // Оновлюємо сигнали
    this.currentURL.set(wrapper.url || '');
    this.articleName.set(article.articleName);
    this.image.set(article.mainImage);
    this.articleTypeID.set(article.articleCategory?.articleTypeID);
    this.articleTypeName.set(article.articleCategory?.articleTypeName);
    this.aticleCategoryID.set(article.articleCategory?.id);
    this.aticleCategoryName.set(article.articleCategory?.aticleCategoryName);
    this.articleContent.set(article.articleContent || []);

    this.setupSeo(article);
  }

  private setupSeo(article: any) {
    const stripHtml = (html: string) => html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
    
    this.seoServices.setCanonicalUrl(this.currentURL());
    this.titleService.setTitle(article.seoName);

    const tags: MetaDefinition[] = [
      { name: 'description', content: article.seoDescription },
      { name: 'author', content: 'Yurii Ohlii' },
      { property: 'og:title', content: article.seoName },
      { property: 'og:description', content: article.seoDescription },
      { property: 'og:image', content: article.mainImage },
      { property: 'og:url', content: this.currentURL() },
      { property: 'og:type', content: 'article' }
    ];

    tags.forEach(tag => this.meta.updateTag(tag));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.articleName,
      image: article.mainImage,
      description: stripHtml(article.seoDescription),
      author: {
        '@type': 'Person',
        name: 'Оглій Юрій',
        url: 'https://tsk.in.ua'
      }
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

  scroll(id: string, index: number) {
    this.activeItem.set(index);
    if (!this.isBrowser) return;

    const el = this.document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - this.menuOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  openModal(imageSrc: string) {
    if (this.isBrowser) {
      // Тут твоя логіка відкриття модалки
      console.log('Open image:', imageSrc);
    }
  }
}