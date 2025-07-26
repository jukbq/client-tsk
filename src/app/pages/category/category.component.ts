import { CommonModule, DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FooyerComponent } from '../../shared/components/fooyer/fooyer.component';
import { SeoService } from '../../shared/services/seo/seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { CategoriesDishesResponse } from '../../shared/interfaces/categories -dishes';
import { SsrLinkDirective } from '../../shared/directives/ssr-link.directive';
import { DishesResponse } from '../../shared/interfaces/dishes';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective, FooyerComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;
  image = '';
  additionalImage = '';
  fontSize: string = '';
  dishesName: string = '';
  dishDescription = '';
  dishesID: any = '';
  categryList: CategoriesDishesResponse[] = [];
  isCollapsed: boolean = false;
  currentURL = '';
  schema: any;
  isVisible = false;
  isBrowser: boolean = false;

  private ldJsonScript?: HTMLScriptElement;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any,
    private renderer: Renderer2,
    private viewportScroller: ViewportScroller,
    private route: ActivatedRoute,
    private seoServices: SeoService,
    private meta: Meta,
    private titleService: Title,
    private router: Router
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }



  ngOnInit() {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }
    this.route.data.subscribe((data: any) => {
      const wrapper = data?.dishes;
      const categryList = data?.categryList;
      const dishes = wrapper?.data;

      if (!dishes || !categryList || (Array.isArray(categryList) && categryList.length === 0)) {
        this.router.navigate(['/404']);
        ;
      }

      this.currentURL = wrapper.url;
      this.categryList = categryList;

      this.setupSeo(dishes);
    });
  }


  setupSeo(dishes: DishesResponse) {
    function stripHtml(html: string | undefined | null): string {
      return html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
    }

    if (dishes) {
      const seoName = dishes.seoName;
      const seoDescription = dishes.seoDescription;
      const keywords = dishes.keywords;
      this.dishesID = dishes.id;

      this.seoServices.setCanonicalUrl(this.currentURL)

      this.titleService.setTitle(seoName);
      this.meta.updateTag({ name: 'description', content: seoDescription });
      this.meta.updateTag({ name: 'author', content: 'Yurii Ohlii' });
      this.meta.updateTag({ name: 'imageUrl', content: this.image });
      this.meta.updateTag({
        property: 'fb:app_id',
        content: '433617998637385',
      });
      this.meta.updateTag({ property: 'fb:url', content: this.currentURL });
      this.meta.updateTag({ property: 'og:title', content: seoName });
      this.meta.updateTag({
        property: 'og:description',
        content: seoDescription,
      });
      this.meta.updateTag({ property: 'keywords', content: keywords });
      this.meta.updateTag({ property: 'og:url', content: this.currentURL });
      this.meta.updateTag({ property: 'og:type', content: 'website' });
      this.meta.updateTag({ property: 'og:image', content: this.image });


      this.dishesName = dishes.dishesName
      this.dishDescription = dishes.dishDescription
      this.image = dishes.image
      this.additionalImage = dishes.additionalImage


      this.schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: this.dishesName,
        url: this.currentURL,
        description: stripHtml(dishes.dishDescription),
        image: this.image,
        publisher: {
          '@type': 'Person',
          name: 'Оглій Юрій',
          url: 'https://tsk.in.ua',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://tsk.in.ua/searchr?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      };

      this.setSchema(this.schema);
    }



    if (this.isBrowser) {
      this.updateFontSize(this.dishesName);
    }
  }


  setSchema(schema: any): void {
    if (this.ldJsonScript) {
      this.renderer.removeChild(this.document.head, this.ldJsonScript);
    }
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, script);
    this.ldJsonScript = script;
  }



  updateFontSize(dishesName: string) {
    // Задаємо розмір шрифта в залежності від кількості символів та ширини екрану
    const screenWidth = window.innerWidth;
    const textLength = dishesName.length;

    if (screenWidth < 576) {
      // Для мобільних пристроїв
      this.fontSize = '5vh';
    } else if (screenWidth < 789) {
      // Для маленьких планшетів
      this.fontSize = textLength <= 10 ? '11vh' : textLength <= 20 ? '10vh' : '8vh';
    } else if (screenWidth < 992) {
      // Для планшетів
      this.fontSize = textLength <= 10 ? '15vh' : textLength <= 20 ? '12vh' : '10vh';
    } else {
      // Для десктопів
      this.fontSize = textLength <= 10 ? '18vh' : textLength <= 20 ? '15vh' : '12vh';
    }
    this.dishesName = dishesName

  }


  // Відстежування події прокрутки вікна
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (!this.isBrowser) return;
    const scrollPosition = window.scrollY;
    //паралакс фонового зображення
    const bgImage = document.querySelector('.bg_image') as HTMLElement;
    const parallaxValue = Math.round(scrollPosition * 0.8);
    bgImage.style.transform = `translate3d(0, ${parallaxValue}px, 0)`;

    //анімація опису
    const elementPosition = this.textBlocksRef?.nativeElement.getBoundingClientRect().top + window.scrollY;
    const elementHeight = this.textBlocksRef?.nativeElement.offsetHeight;
    if (scrollPosition + window.innerHeight > elementPosition + elementHeight / 2) {
      this.isVisible = true;
    }


    //анімація карток
    const recipeCards = document.querySelectorAll('.dishes_card');
    recipeCards.forEach((card: Element) => {
      const htmlCard = card as HTMLElement;
      const elementPosition = htmlCard.getBoundingClientRect().top + window.scrollY;

      const elementHeight = htmlCard.offsetHeight; // Висота елемента
      // Перевірка, чи елемент потрапляє в видиму область (екран)
      if (scrollPosition + window.innerHeight > elementPosition + elementHeight / 2) {
        // Додаємо клас для активації анімації чи зміни стилю
        htmlCard.classList.add('show');
      }
    });
  }

  // В компоненті вашого Angular
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }



}
