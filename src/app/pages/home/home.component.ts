import { CommonModule, DOCUMENT, isPlatformBrowser, PlatformLocation, ViewportScroller } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../shared/services/seo/seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { DishesService } from '../../shared/services/dishes/dishes.service';
import { RecipeService } from '../../shared/services/recipe/recipe.service';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { SsrLinkDirective } from '../../shared/directives/ssr-link.directive';
import { log } from 'node:console';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;
  recipes: any = [];
  selectedIndex = 0;
  underIds = new Set<string>();

  isVisible = false;

  currentURL = '';
  dishesList: any[] = [];
  recipeCounts: { [key: string]: number } = {};
  dishCategories: { [key: string]: any[] } = {};
  isBrowser: boolean = false;



  //contennt
  homeTite = '';
  mainImage = 'https://firebasestorage.googleapis.com/v0/b/synikit-12dee.appspot.com/o/home%2Fbackground.webp?alt=media&token=fd797c35-8b8c-4c3e-a51c-c64679a02814';
  schema: any;

  private ldJsonScript?: HTMLScriptElement;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private seoServices: SeoService,
    private route: ActivatedRoute,
    private meta: Meta,
    private viewportScroller: ViewportScroller,
    private titleService: Title,
    private renderer: Renderer2,
    private router: Router,
    private dishesService: DishesService,
    private categoryService: CategoriesService,
    private recipeService: RecipeService
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }
    this.route.data.subscribe((data: any) => {
      const wrapper = data.dishes
      const dishes = wrapper.data;
      this.currentURL = wrapper.url;
      this.loadData();
      this.dishesList = dishes
      this.dishesList.sort((a, b) => a.dishesName.localeCompare(b.dishesName));
      this.recipeCountLoad()
      this.recipes = data.recentRecipe

    });
  }

  loadData() {
    this.homeTite = 'Таверна "Синій Кіт" – перевірені рецепти та поради'
    this.seoServices.setCanonicalUrl(this.currentURL)
    this.titleService.setTitle(this.homeTite);
    this.meta.updateTag({ property: 'canonical', content: this.currentURL });
    this.meta.updateTag({
      name: 'description',
      content: `Таверна "Синій Кіт" — це прості рецепти, смачні ідеї, соковите м'ясо, овочі, випічка, супи й поради, що зроблять тебе кулінаром.
`,
    });
    this.meta.updateTag({ name: 'imageUrl', content: this.mainImage });
    this.meta.updateTag({ name: 'author', content: 'Yurii Ohlii' });
    this.meta.updateTag({
      property: 'fb:app_id',
      content: '433617998637385',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: `Таверна Синій Кіт — кулінарні рецепти для гурманів: м'ясо, риба, салати, випічка, десерти`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Таверна 'Синій Кіт' — ваш путівник у світі кулінарії! Широкий вибір рецептів: м’ясо, риба, овочі, пасти, салати, супи, випічка, десерти. Ідеї для кожного гостя і кожного столу!`,
    });
    this.meta.updateTag({
      property: 'keywords',
      content: `рецепти, таверна Синій Кіт, кулінарні рецепти, страви, м'ясо, риба, овочі, пасти, салати, супи, соуси, десерти, випічка, домашня кухня, кулінарні поради, гастрономія`,
    });
    this.meta.updateTag({ property: 'og:image', content: this.mainImage });
    this.meta.updateTag({ property: 'og:url', content: this.currentURL });

    this.schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.homeTite,
      url: 'https://tsk.in.ua',
      description: `У нашій колекції рецептів ви знайдете страви на будь-який смак і випадок: соковите м’ясо, ніжну рибу, легкі овочеві страви, різноманітні соуси, ароматні супи, домашню випічку, десерти й багато іншого. Усе продумано, щоб зробити процес приготування максимально простим і приємним.
Перегляньте наші основні категорії й оберіть те, що підійде для вашого столу. Таверна "Синій Кіт" пропонує як класичні рецепти, так і сучасні ідеї для кулінарних експериментів.
`,
      image: this.mainImage,
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

  selectRecipe(i: number) {
    this.selectedIndex = i;
  }

  isUnder(categoryId: string): boolean {
    return this.underIds.has(categoryId);
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


  async recipeCountLoad() {
    for (let dish of this.dishesList) {
      this.recipeCounts[dish.id] = await this.recipeService.getRecipeCount(dish.id);

      this.categoryService.getLightById(dish.id).subscribe(categories => {
        this.dishCategories[dish.id] = categories;
        this.dishCategories[dish.id].sort((a, b) => a.categoryName.localeCompare(b.categoryName));
      });
    }
  }

  // Відстежування події прокрутки вікна
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (!this.isBrowser) return;
    const scrollPosition = window.scrollY;

    //анімація опису
    const elementPosition =
      this.textBlocksRef?.nativeElement.getBoundingClientRect().top +
      window.scrollY;
    const elementHeight = this.textBlocksRef?.nativeElement.offsetHeight;
    if (
      scrollPosition + window.innerHeight >
      elementPosition + elementHeight / 6
    ) {
      this.isVisible = true;
    }

    //анімація карток
    const dishesBlock = document.querySelectorAll('.dishes_block');
    dishesBlock.forEach((card: Element) => {
      const htmlCard = card as HTMLElement;
      const elementPosition =
        htmlCard.getBoundingClientRect().top + window.scrollY;

      const elementHeight = htmlCard.offsetHeight; // Висота елемента
      // Перевірка, чи елемент потрапляє в видиму область (екран)
      if (
        scrollPosition + window.innerHeight >
        elementPosition + elementHeight / 2
      ) {
        // Додаємо клас для активації анімації чи зміни стилю
        htmlCard.classList.add('show');
      }
    });
  }




}
