import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { FooyerComponent } from '../../shared/components/fooyer/fooyer.component';
import { CommonModule, DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../shared/services/seo/seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { SsrLinkDirective } from '../../shared/directives/ssr-link.directive';

@Component({
  selector: 'app-dishes',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective, FooyerComponent, SsrLinkDirective],
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
    this.viewportScroller.scrollToPosition([0, 0]);
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
        target: 'https://tsk.in.ua/recipe-filter?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    };

    this.setSchema(this.schema);
  }


  setSchema(schema: any): void {
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, script);
  }



  checkPlatform(data: Array<any>) {
    this.dishes = data;
    console.log(this.dishes);

    if (this.isBrowser) {
      this.updateFontSize();
    }
  }



  // Відстежування події прокрутки вікна
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    const scrollPosition = window.scrollY;
    //паралакс фонового зображення
    const bgImage = document.querySelector('.bg_image') as HTMLElement;
    const parallaxValue = Math.round(scrollPosition * 0.8);
    bgImage.style.transform = `translate3d(0, ${parallaxValue}px, 0)`;

    //анімація опису
    const elementPosition =
      this.textBlocksRef?.nativeElement.getBoundingClientRect().top +
      window.scrollY;
    const elementHeight = this.textBlocksRef?.nativeElement.offsetHeight;
    if (
      scrollPosition + window.innerHeight >
      elementPosition + elementHeight / 2
    ) {
      this.isVisible = true;
    }



    //анімація карток
    const recipeCards = document.querySelectorAll('.dishes_card');
    recipeCards.forEach((card: Element) => {
      const htmlCard = card as HTMLElement;
      const elementPosition =
        htmlCard.getBoundingClientRect().top + window.scrollY;
      const elementHeight = htmlCard.offsetHeight; // Висота елемента
      // Перевірка, чи елемент потрапляє в видиму область (екран)
      if (
        scrollPosition + window.innerHeight >
        elementPosition + elementHeight / 2
      ) {
        htmlCard.classList.add('show');
      }
    });
  }


  updateFontSize() {
    // Задаємо розмір шрифта в залежності від кількості символів та ширини екрану
    const screenWidth = window.innerWidth;
    const textLength = this.dishesName.length;

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

  }

}
