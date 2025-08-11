import { CommonModule, DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { SsrLinkDirective } from '../../shared/directives/ssr-link.directive';
import { SeoService } from '../../shared/services/seo/seo.service';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-articles-home',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective],
  templateUrl: './articles-home.component.html',
  styleUrl: './articles-home.component.scss'
})
export class ArticlesHomeComponent {
  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;
  fontSize: string = '';
  pageName: string = '';
  isVisible = false;
  isBrowser: boolean = false;
  currentURL = ''
  schema: any;
  articleTypes: any[] = [];

  private ldJsonScript?: HTMLScriptElement;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any,
    private route: ActivatedRoute,
    private seoServices: SeoService,
    private meta: Meta,
    private titleService: Title,
    private viewportScroller: ViewportScroller,
    private renderer: Renderer2,

  ) { this.isBrowser = isPlatformBrowser(this.platformId); }

  ngOnInit(): void {
    this.currentURL = 'https://tsk.in.ua/articlses'

    this.route.data.subscribe((data: any) => {
      this.currentURL = data.articleTypes.url
      this.loadArticlesList();
      this.articleTypes = data.articleTypes.data;


    });

    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.updateFontSize();
    }

  }


  loadArticlesList() {
    const seoTitle = `Байки Синього Кота — смачні історії, легенди та пригоди в стилі таверни`;
    const seoDescription = `Читай байки Синього Кота – кулінарні легенди, веселі історії та загадки зі смаком таверни. Ласкаво просимо до смачного світу казок про їжу!`;
    const keywords = `синій кіт, байки про їжу, кулінарні легенди, казки про їжу, історія страв, кулінарія, таверна, рецепти з історією, кулінарні пригоди, оповідки про страви`;
    const mainImage = '/assets/image/baiky-synoho-kota.webp';

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
      url: 'https://tsk.in.ua/articlses',
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



  updateFontSize() {
    // Задаємо розмір шрифта в залежності від кількості символів та ширини екрану
    const screenWidth = window.innerWidth;
    const textLength = this.pageName.length;

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
