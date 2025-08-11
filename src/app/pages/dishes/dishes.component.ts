import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../shared/services/seo/seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { SsrLinkDirective } from '../../shared/directives/ssr-link.directive';

@Component({
  selector: 'app-dishes',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective, SsrLinkDirective],
  templateUrl: './dishes.component.html',
  styleUrl: './dishes.component.scss'
})
export class DishesComponent {

  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;
  schema: any;
  isVisible = false;
  dishes: any[] = [];
  currentURL = ''
  fontSize: string = '';
  dishesName: string = '';
  isBrowser: boolean = false;

  private ldJsonScript?: HTMLScriptElement;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any,
    private seoServices: SeoService,
    private route: ActivatedRoute,
    private meta: Meta,
    private titleService: Title,
    private viewportScroller: ViewportScroller,
    private renderer: Renderer2,
    private router: Router
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }
    this.route.data.subscribe((data: any) => {
      this.currentURL = data.dishes.url
      this.loadDishesList();
      this.checkPlatform(data.dishes.data);
    });
  }


  loadDishesList() {
    const seoTitle = `Рецепти Синього Кота – Основні кулінарні категорії для мандрівника`;
    const seoDescription = `Переглянь основні категорії страв у стилі таверни Синій Кіт. Відкрий для себе підкатегорії та улюблені напрямки — від закусок до гарячих страв!.`;
    const keywords = `рецепти по категоріях, головні страви, кулінарні категорії, кухня таверни, синій кіт, кулінарні розділи, салати, гарячі страви, холодні закуски, супи, випічка`;
    const mainImage = '/assets/image/recepty-synoho-kota.webp';

    this.seoServices.setCanonicalUrl(this.currentURL)

    //Meta tags
    this.titleService.setTitle(seoTitle);
    this.meta.updateTag({ property: 'canonical', content: this.currentURL });
    this.meta.updateTag({
      name: 'description',
      content: seoDescription
    });
    this.meta.updateTag({ name: 'author', content: 'Yurii Ohlii' });
    this.meta.updateTag({ name: 'imageUrl', content: mainImage });
    this.meta.updateTag({ property: 'fb:app_id', content: '433617998637385' });
    this.meta.updateTag({ property: 'og:title', content: seoTitle });
    this.meta.updateTag({
      property: 'og:description',
      content: seoDescription,
    });
    this.meta.updateTag({ property: 'og:url', content: this.currentURL });
    this.meta.updateTag({ property: 'og:image', content: mainImage });
    this.meta.updateTag({ property: 'keywords', content: keywords });

    this.schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: seoTitle,
      url: 'https://tsk.in.ua/dishes',
      description: seoDescription,
      image: mainImage,
      publisher: {
        '@type': 'Person',
        name: 'Оглій Юрій',
        url: 'https://tsk.in.ua',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://tsk.in.ua/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    };

    this.setSchema(this.schema);
  }


  setSchema(schema: any): void {

    if (this.ldJsonScript) {
      this.renderer.removeChild(this.document.head, this.ldJsonScript);
    }

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, script);
  }



  checkPlatform(data: Array<any>) {
    this.dishes = data;
    this.dishes.sort((a, b) =>
      a.dishesName.localeCompare(b.dishesName)
    );

  }



  // Відстежування події прокрутки вікна
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (!this.isBrowser) return;

    const scrollPosition = window.scrollY;

    // Паралакс фону
    const bgImage = document.querySelector('.bg_image') as HTMLElement;
    if (bgImage) {
      const parallaxValue = Math.round(scrollPosition * 0.8);
      bgImage.style.transform = `translate3d(0, ${parallaxValue}px, 0)`;
    }

    // Анімація опису
    if (this.textBlocksRef) {
      const elementPosition = this.textBlocksRef.nativeElement.getBoundingClientRect().top + window.scrollY;
      const elementHeight = this.textBlocksRef.nativeElement.offsetHeight;

      if (scrollPosition + window.innerHeight > elementPosition + elementHeight / 2) {
        this.isVisible = true;
      }
    }

    // Анімація карток
    const contents = document.querySelectorAll<HTMLElement>('.content');
    const recipeCards = document.querySelectorAll<HTMLElement>('.dishes_card');


    recipeCards.forEach(card => {
      const elementTop = card.getBoundingClientRect().top + window.scrollY;
      const elementHeight = card.offsetHeight;

      if (scrollPosition + window.innerHeight > elementTop + elementHeight / 2) {
        card.classList.add('show');
      }
    });

    contents.forEach(content => {
      const elementTop = content.getBoundingClientRect().top + window.scrollY;
      const elementHeight = content.offsetHeight;

      if (scrollPosition + window.innerHeight > elementTop + elementHeight / 2) {
        content.classList.add('show');
      }
    });
  }





}
