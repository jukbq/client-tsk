import { Component, DOCUMENT, effect, ElementRef, HostListener, inject, OnInit, PLATFORM_ID, Renderer2, signal, ViewChild } from '@angular/core';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { isPlatformBrowser, NgOptimizedImage, NgStyle, ViewportScroller } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo/seo-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-article-categories',
  imports: [SsrLinkDirective, NgStyle, NgOptimizedImage],
  templateUrl: './article-categories.html',
  styleUrl: './article-categories.scss',
})
export class ArticleCategories implements OnInit {
  // Injectors
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seoServices = inject(SeoService);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);

  // ViewChild
  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;

  // Signals
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly image = signal('');
  readonly additionalImage = signal('');
  readonly fontSize = signal('');
  readonly articleTypeName = signal('');
  readonly articleTypeDescription = signal('');
  readonly aticleCategryList = signal<any[]>([]);
  readonly isVisible = signal(false);
  readonly currentURL = signal('');
  
  private ldJsonScript?: HTMLScriptElement;

  // Отримуємо дані з роута як сигнал
  private routeData = toSignal(this.route.data);

  constructor() {
    // Ефект для автоматичного оновлення SEO при зміні даних
    effect(() => {
      const data = this.routeData();
      if (data) {
        this.processRouteData(data);
      }
    });
  }

  ngOnInit() {
    // В Angular 20 ініціалізація логіки залишається в ngOnInit або constructor ефектах
  }

  private processRouteData(data: any) {


    const wrapper = data?.articleTypes;
    const categoryList = data?.aticleCategryList;
  const type = wrapper?.data;


    if (!type || !categoryList?.data?.length) {
      this.router.navigate(['/404']);
      return;
    }

    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.updateFontSize(type.articleTypeName);
    }

    this.currentURL.set(wrapper.url);
    this.aticleCategryList.set(categoryList.data);
    this.articleTypeName.set(type.articleTypeName);
   
    this.articleTypeDescription.set(type.articleTypeDescription);
    this.image.set(type.image);
   
    
    this.additionalImage.set(type.additionalImage);

    this.setupSeo(type);
  }

  private setupSeo(type: any) {
    const stripHtml = (html: string) => html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
    
    this.seoServices.setCanonicalUrl(this.currentURL());
    this.titleService.setTitle(type.seoName);

    const metaTags: MetaDefinition[] = [
  { name: 'description', content: type.seoDescription },
  { name: 'keywords', content: type.keywords },
  { property: 'og:title', content: type.seoName },
  { property: 'og:description', content: type.seoDescription },
  { property: 'og:url', content: this.currentURL() },
  { property: 'og:image', content: this.image() },
  { property: 'og:type', content: 'website' }
];

metaTags.forEach(tag => this.meta.updateTag(tag));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: type.articleTypeName,
      url: this.currentURL(),
      description: stripHtml(type.articleTypeDescription),
      image: this.image(),
      publisher: {
        '@type': 'Person',
        name: 'Оглій Юрій',
        url: 'https://tsk.in.ua',
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

 private updateFontSize(name: string | undefined | null) {
  // Якщо назва не прийшла, використовуємо порожній рядок, щоб .length не видав помилку
  const safeName = name ?? ''; 
  const width = window.innerWidth;
  const len = safeName.length;
  
  let size = '12vh';

  if (width < 576) {
    size = '5vh';
  } else if (width < 789) {
    size = len <= 10 ? '11vh' : len <= 20 ? '10vh' : '8vh';
  } else if (width < 992) {
    size = len <= 10 ? '15vh' : len <= 20 ? '12vh' : '10vh';
  } else {
    size = len <= 10 ? '18vh' : len <= 20 ? '15vh' : '12vh';
  }

  this.fontSize.set(size);
}

  @HostListener('window:scroll')
  onScroll() {
    if (!this.isBrowser) return;

    const scrollY = window.scrollY;
    
    // Parallax Signal-friendly
    const bgImage = this.document.querySelector('.bg_image') as HTMLElement;
    if (bgImage) {
      bgImage.style.transform = `translate3d(0, ${Math.round(scrollY * 0.8)}px, 0)`;
    }

    // Visibility Logic
    if (this.textBlocksRef) {
      const rect = this.textBlocksRef.nativeElement.getBoundingClientRect();
      if (window.innerHeight > rect.top + rect.height / 2) {
        this.isVisible.set(true);
      }
    }

    // Cards Animation
    this.document.querySelectorAll('.dishes_card').forEach(card => {
      const rect = card.getBoundingClientRect();
      if (window.innerHeight > rect.top + rect.height / 2) {
        card.classList.add('show');
      }
    });
  }
}