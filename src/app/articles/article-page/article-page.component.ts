import { CommonModule, DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../shared/services/seo/seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { SsrLinkDirective } from '../../shared/directives/ssr-link.directive';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.scss'
})
export class ArticlePageComponent {

  currentURL = '';
  isBrowser: boolean = false;
  articleID: any = '';
  image = '';
  articleName = '';
  schema: any;
  imageModal: any;

  articleTypeID = '';
  articleTypeName = '';

  aticleCategoryID = '';
  aticleCategoryName = '';

  articleContent: any = [];

  activeItem = 0;
  menuOffset!: number

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
    private router: Router,
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }

  ngOnInit(): void {

    this.route.data.subscribe((data: any) => {
         const wrapper = data?.article;
      const article = wrapper?.data;
      this.currentURL = wrapper?.url

      if (!article || (Array.isArray(article) && article.length === 0)) {
        this.router.navigate(['/404']);
        ;
      }

      this.setupSeo(article);

      this.articleName = article.articleName
      this.articleTypeID = article.articleCategory.articleTypeID
      this.articleTypeName = article.articleCategory.articleTypeName
      this.aticleCategoryID = article.articleCategory.id
      this.aticleCategoryName = article.articleCategory.aticleCategoryName
      this.articleContent = article.articleContent

    });

    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      const menuElement = this.document.querySelector('.recipe_menu') as HTMLElement;
      this.menuOffset = menuElement ? menuElement.offsetHeight + 20 : 100; // 20 — запас
    }

  }



  setupSeo(article: any) {
    function stripHtml(html: string | undefined | null): string {
      return html ? html.replace(/<\/?[^>]+(>|$)/g, '') : '';
    }
    if (article) {
      const seoName = article.seoName;
      const seoDescription = article.seoDescription;
      const keywords = article.keywords;
      this.articleID = article.id;
      this.image = article.mainImage;

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


      this.schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: this.articleName,
        url: this.currentURL,
        description: stripHtml(seoDescription),
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




  openModal(imageSrc: string) {
    const modalImage = document.getElementById('modalImage') as HTMLImageElement;
    modalImage.src = imageSrc;
    this.imageModal.show();
  }


  scroll(id: string, index: number) {
    this.activeItem = index;

    const el = document.getElementById(id);
    const offset = this.menuOffset || document.querySelector('header')?.clientHeight || 100;

    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }






}
