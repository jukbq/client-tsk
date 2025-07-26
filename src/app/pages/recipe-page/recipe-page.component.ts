import { CommonModule, DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FooyerComponent } from '../../shared/components/fooyer/fooyer.component';
import { SeoService } from '../../shared/services/seo/seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { RecipeService } from '../../shared/services/recipe/recipe.service';
import { SsrLinkDirective } from '../../shared/directives/ssr-link.directive';
declare var bootstrap: any;


@Component({
  selector: 'app-recipe-page',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective, FooyerComponent],
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss'
})

export class RecipePageComponent {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  scrollSpeed = 0.5; // пікселів за тік
  scrollInterval: any;

  imageModal: any;

  isDragging = false;
  startX = 0;
  scrollLeft = 0;

  //Меню рецепта
  activeItem = 0;
  activeBlock = '';
  deviceType!: string;
  isActive = false;
  touchStartX = 0;
  touchEndX = 0;
  menuOffset!: number



  //Шапка
  categoryImg = '';
  mainImage = '';
  recipeTitle = '';
  fontSize: string = '';


  //Інформація про рецепт
  seasons: any = [];

  info: any = [];

  blockedFilters = ['totalTime', 'numberCalories', 'someOtherShit'];

  //Рецепт
  recipeSubtitles = '';
  descriptionRecipe = '';
  ingredients: any = [];
  instructions: any = [];
  accompanyingRecipes: any = [];

  //Додаткова інформація
  holiday: any = [];
  recipeType: any = [];
  methodCooking = '';
  tools = '';


  //хлібні крихти
  dishesLink = '';
  dishesID = '';
  dishesName = '';
  categoryLink = '';
  categoryID = '';
  categoryName = '';

  author = '';

  fbShareUrl: string | undefined;
  piShareUrl: string | undefined;
  waShareUrl: string | undefined;
  tgShareUrl: string | undefined;
  vbShareUrl: string | undefined;
  recipes: any[] = [];
  randomRecipes: any[] = [];
  page!: number;

  recipeID: string | null = null;
  recipeLink: string | null = null;

  modalImageOpen = false;
  modalImage = '';
  advice = '';
  completion = '';
  difficultyPreparation = '';

  currentURL = '';
  accompanying: any;

  recipeSchema: any;

  isBrowser: boolean = false;

  numberServings!: number
  numberCalories!: number




  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private renderer: Renderer2,
    private router: Router,
    private seoServices: SeoService,
    private meta: Meta,
    private titleService: Title,
    private viewportScroller: ViewportScroller,
    private route: ActivatedRoute,
    private recipeService: RecipeService

  ) { this.isBrowser = isPlatformBrowser(this.platformId); }




  ngOnInit() {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.route.data.subscribe((data: any) => {

      if (data === null) {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex';
        document.head.appendChild(meta);
      }

      const wrapper = data?.recipe;
      const info = wrapper?.info;
      const recipeSSR = wrapper?.recipeSSR;
      const schema = wrapper?.recipeSchema;

      if (!info || !recipeSSR || !schema) {
        this.router.navigate(['/404']);
        return;
      }

      const recipeSchema = data.recipe.recipeSchema;
      this.seoServices.setSchema(recipeSchema);
      this.activeBlock = 'recipe-about';
      this.processRecipeData(data.recipe);




    });

    if (this.isBrowser) {
      const header = document.querySelector('header') as HTMLElement | null;
      const menu = document.querySelector('.menu_block') as HTMLElement | null;
      const content = document.querySelector('.recipe_block') as HTMLElement | null;


      if (header && menu && content) {
        this.menuOffset = menu.offsetHeight;
        header.style.position = `fixed`;
        content.style.marginTop = `${this.menuOffset}px`;
      }

      this.getRandomRecipes();

      setTimeout(() => {
        this.startAutoScroll();
      }, 500);

    }
  }


  ngAfterViewInit() {
    if (!this.scrollContainer || !this.isBrowser) return;

    const container = this.scrollContainer.nativeElement as HTMLElement;

    container.addEventListener('mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      container.classList.add('dragging');
      this.startX = e.pageX - container.offsetLeft;
      this.scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
      this.isDragging = false;
      container.classList.remove('dragging');
    });

    container.addEventListener('mouseup', () => {
      this.isDragging = false;
      container.classList.remove('dragging');
    });

    container.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - this.startX) * 1.5; // множник швидкості
      container.scrollLeft = this.scrollLeft - walk;
    });


    const modalElement = document.getElementById('imageModal');
    this.imageModal = new bootstrap.Modal(modalElement);
  }

  openModal(imageSrc: string) {
    const modalImage = document.getElementById('modalImage') as HTMLImageElement;
    modalImage.src = imageSrc;
    this.imageModal.show();
  }


  // Викликаємо сервіс для отримання даних рецепта на стороні сервера
  processRecipeData(recipe: any) {
    if (recipe) {
      this.currentURL = recipe.recipeSSR.currentURL
      this.seoServices.setCanonicalUrl(this.currentURL)

      this.recipeTitle = recipe.recipeSSR.recipeTitle
      this.mainImage = recipe.recipeSSR.mainImage
      this.recipeSubtitles = recipe.recipeSSR.recipeSubtitles
      this.descriptionRecipe = recipe.recipeSSR.descriptionRecipe


      this.dishesID = recipe.recipeSSR.dishesID
      this.dishesName = recipe.recipeSSR.dishesName
      this.categoryID = recipe.recipeSSR.categoryID
      this.categoryName = recipe.recipeSSR.categoryName

      const seoName = recipe.recipeSSR.seoName
      const seoDescription = recipe.recipeSSR.seoDescription;
      const keywords = recipe.recipeSSR.keywords;
      this.seasons = recipe.recipeSSR.bestSeason || [];

      this.info = recipe.info
      this.ingredients = recipe.recipeSSR.ingredients
      this.accompanyingRecipes = recipe.recipeSSR.accompanyingRecipes
      this.instructions = recipe.recipeSSR.instructions
      this.advice = recipe.recipeSSR.advice;
      this.completion = recipe.recipeSSR.completion;

      // Оновлюємо мета-теги після того, як дані рецепта були отримані
      this.titleService.setTitle(seoName);
      this.meta.updateTag({ property: 'canonical', content: this.currentURL });
      this.meta.updateTag({ name: 'description', content: seoDescription });
      this.meta.updateTag({ name: 'keywords', content: keywords });
      this.meta.updateTag({ name: 'author', content: 'Yurii Ohlii' });
      this.meta.updateTag({ name: 'imageUrl', content: this.mainImage });
      this.meta.updateTag({
        property: 'fb:app_id',
        content: '433617998637385',
      });
      this.meta.updateTag({ property: 'og:title', content: seoName });
      this.meta.updateTag({
        property: 'og:description',
        content: seoDescription,
      });
      this.meta.updateTag({ property: 'og:type', content: 'website' });
      this.meta.updateTag({ property: 'og:image', content: this.mainImage });
      this.meta.updateTag({ property: 'og:url', content: this.currentURL });

    }
    this.fbShareUrl =
      `https://www.facebook.com/sharer.php?u=` + this.currentURL;
    this.piShareUrl =
      `https://pinterest.com/pin/create/button/?url=` + this.currentURL;
    this.waShareUrl = `ttps://wa.me/?text=` + this.currentURL;
    this.tgShareUrl = `https://t.me/share/url?url=` + this.currentURL;
    this.vbShareUrl = `viber://forward?text=` + this.currentURL;


  }






  scroll(id: string, index: number) {
    this.activeItem = index;
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - this.menuOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }






  /***************************************** */
  //Відбправка списку інгридієнтів в Вайбер
  saveToViber() {
    const list = this.generateIngredientList();
    const viberUrl = `viber://forward?text=${encodeURIComponent(list)}`;
    window.open(viberUrl, '_blank');
  }

  //Відбправка списку інгридієнтів в телеграм
  saveToTelegram() {
    const list = this.generateIngredientList();
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
      list
    )}`;
    window.open(telegramUrl, '_blank');
  }

  //Створення списку інеридієнтів дял зебереження
  private generateIngredientList(): string {
    return this.ingredients
      .map((product: { group: any[] }) => {
        return product.group
          .map((group) => {
            return `${group.text} `;
          })
          .join('\n');
      })
      .join('\n');
  }
  /******************************************* */


  // Відстежування події прокрутки вікна
  @HostListener('window:scroll', [])
  onScroll() {
    const sections = [
      { id: 'recipe-about', index: 0 },
      { id: 'ingredients', index: 1 },
      { id: 'instruction', index: 2 },
      { id: 'council', index: 3 }
    ];

    const middleScreen = window.innerHeight / 2;
    let currentSectionIndex = 0;

    for (const section of sections) {
      const el = document.querySelector(`#${section.id}`) as HTMLElement;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= middleScreen && rect.bottom >= middleScreen) {
          currentSectionIndex = section.index;
          break;
        }
      }
    }

    this.activeItem = currentSectionIndex;
  }



  //Отриаення рандомних рецептів
  getRandomRecipes() {

    this.recipeService
      .getRandomRecipesByCategoryID(this.categoryID, 10)
      .subscribe((data) => {
        const uniqueRecipes = data.filter(
          (newRecipe) =>
            newRecipe.id !== this.recipeID && // Виключаємо поточний рецепт
            !this.recipes.some((existingRecipe) => existingRecipe.id === newRecipe.id) // Виключаємо дублікати
        );

        // Додаємо тільки унікальні рецепти
        this.recipes = [...this.recipes, ...uniqueRecipes];
      });

  }


  reloadMenu() {
    if (isPlatformBrowser(this.platformId)) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.activeItem = 0;
    }
  }


  startAutoScroll() {
    if (!this.scrollContainer) return;

    const container: HTMLElement = this.scrollContainer.nativeElement;

    this.scrollInterval = setInterval(() => {
      // Зсуваємо скрол
      container.scrollLeft += this.scrollSpeed;

      // Якщо дійшли до самого краю — скидаємо в нуль
      if (container.scrollLeft + container.offsetWidth >= container.scrollWidth) {
        container.scrollLeft = 0;
      }
    }, 30); // швидкість — можна змінити
  }


  stopAutoScroll() {
    clearInterval(this.scrollInterval);
  }

  isBlockedFilter(item: string): boolean {
    return this.blockedFilters.includes(item);
  }


  getTagFilterType(tag: string): string {


    const map: Record<string, string> = {
      recipeType: 'recipeType',
      cuisine: 'cuisine',
      region: 'region',
      holiday: 'holiday',
      difficultyPreparation: 'difficulty'
    };
    return map[tag] || 'unknown';
  }

}




