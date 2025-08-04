import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { СuisineResponse } from '../../shared/interfaces/cuisine';
import { RegionResponse } from '../../shared/interfaces/region';
import { ProductsRequest } from '../../shared/interfaces/products';
import { CommonModule, DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { FooyerComponent } from '../../shared/components/fooyer/fooyer.component';
import { SeoService } from '../../shared/services/seo/seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { RecipeStateService } from '../../shared/services/recipe/recipe-state.service';
import { RecipeService } from '../../shared/services/recipe/recipe.service';
import { SsrLinkDirective } from '../../shared/directives/ssr-link.directive';


interface RecipeLight {
  id: string;
  recipeTitle: string;
  mainImage: string;
  cuisine: СuisineResponse;
  region: RegionResponse;
  ingredients: ProductsRequest;
}


@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss'
})
export class RecipeListComponent {
  @ViewChild('textBlocks') textBlocksRef!: ElementRef<HTMLDivElement>;
  fontSize: string = '';
  recipes: RecipeLight[] = [];
  recipesFilter: RecipeLight[] = [];
  countries: Array<any> = [];
  countriesRecipe: any[] = [];
  filteredRegions: Array<any> = [];
  filyerIngredients: Array<any> = [];
  selectedProducts: string[] = [];


  image = '';
  additionalImage = '';
  categoryId = '';
  categoryName = '';
  categoryDescription = '';
  dishesName = '';
  dishesID = '';
  isCollapsed = false;
  schema: any;
  currentURL = '';
  isVisible = false;
  isBrowser: boolean = false;

  wasTextVisible = false;
  private ldJsonScript?: HTMLScriptElement;



  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any,
    private renderer: Renderer2,
    private router: Router,
    private seoServices: SeoService,
    private meta: Meta,
    private titleService: Title,
    private viewportScroller: ViewportScroller,
    private recipeStateService: RecipeStateService,
    private recipeService: RecipeService,
    private route: ActivatedRoute,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }


  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const categoryId = params.get('categoryid');
      this.categoryId = categoryId as string
      this.recipeStateService.setCategoryId(this.categoryId)
      this.loadRecipes();
    });

    this.route.data.subscribe({
      next: (data: any) => {
        const wrapper = data?.category;
        const category = wrapper?.data;

        if (!category || !category.dishes || !category.dishes.dishesName) {
          this.router.navigate(['/404']);
          return;
        }

        this.currentURL = wrapper.url;
        this.dataLoad(data);
      },

    });


  }


  loadRecipes() {
    const savedRecipes = this.recipeStateService.getRecipes();

    if (savedRecipes.length) {
      this.recipes = savedRecipes;

      this.recipesFilter = this.recipes
      this.recipesFilter.sort((a, b) =>
        a.recipeTitle.localeCompare(b.recipeTitle)
      );
      this.getFiltr()
      this.route.data.subscribe((data: any) => {
        this.checkPlatform(data);
      });

    } else {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.recipeService.getRecipeLightById(this.categoryId).subscribe((data: any) => {
        this.recipes = data
        this.recipesFilter = this.recipes
        this.recipesFilter.sort((a, b) =>
          a.recipeTitle.localeCompare(b.recipeTitle)
        );
        this.getFiltr()
        this.recipeStateService.setRecipes(this.recipes);
      });

    }
  };


  getFiltr() {
    this.countriesRecipe = [];
    this.filteredRegions = [];
    this.filyerIngredients = [];
    const country = new Map<any, { id: number | string, cuisineName: string }>();
    const product = new Map<any, { id: number | string, name: string }>();
    this.recipes.forEach(r => {
      const c = r.cuisine;
      if (c && !country.has(c.id)) {
        country.set(c.id, { id: c.id, cuisineName: c.cuisineName });
      }
    });
    this.recipes.forEach(r => {
      const ingredients = r.ingredients;
      if (ingredients && Array.isArray(ingredients)) {
        ingredients.forEach(p => {
          if (p && !product.has(p.id)) {
            product.set(p.id, { id: p.id, name: p.name });
          }
        });
      }
    });

    this.countries = Array.from(country.values());
    this.countries.sort((a, b) =>
      a.cuisineName.localeCompare(b.cuisineName)
    );
    this.filyerIngredients = Array.from(product.values());
    this.filyerIngredients.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }


  dataLoad(data: any) {
    function stripHtml(html: string): string {
      return html.replace(/<\/?[^>]+(>|$)/g, '');
    }
    this.seoServices.setCanonicalUrl(this.currentURL)
    const category = data.category.data;



    if (
      !category ||
      !category.seoCategoryName ||
      !category.seoCategoryDescription ||
      !category.categoryName ||
      !category.categoryDescription ||
      !category.dishes ||
      !category.dishes.dishesName
    ) {
      console.warn('❗ Missing or invalid category data:', data);
      return;
    }

    const seoName = category.seoCategoryName;
    const seoDescription = category.seoCategoryDescription;
    const keywords = category.keywords;
    const image = category.image;
    this.currentURL = `${this.document.location.origin}${this.router.url}`;

    this.seoServices.setCanonicalUrl(this.currentURL)

    this.titleService.setTitle(seoName);
    this.meta.updateTag({ property: 'canonical', content: this.currentURL });
    this.meta.updateTag({ name: 'description', content: seoDescription });
    this.meta.updateTag({ name: 'author', content: 'Yurii Ohlii' });
    this.meta.updateTag({ name: 'imageUrl', content: image });
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
    this.meta.updateTag({ property: 'og:image', content: image });

    this.schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: stripHtml(category.categoryName),
      url: this.currentURL,
      description: stripHtml(category.categoryDescription),
      image: image,
      publisher: {
        '@type': 'Person',
        name: 'Оглій Юрій',
        url: 'https://tsk.in.ua',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target:
          'https://tsk.in.ua/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    };

    this.setSchema(this.schema);
    this.checkPlatform(data);

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



  checkPlatform(data: any) {
    if (this.isBrowser) {
      this.image = data.category.data.image
      this.categoryDescription = data.category.data.categoryDescription
      this.additionalImage = data.category.data.additionalImage
      this.dishesName = data.category.data.dishes.dishesName;
      this.dishesID = data.category.data.dishes.id;
      this.updateFontSize(data.category.data.categoryName); // Встановлюємо при початковому завантаженні
    }
  }

  updateFontSize(categoryName: string) {
    // Задаємо розмір шрифта в залежності від кількості символів та ширини екрану
    const screenWidth = window.innerWidth;
    const textLength = categoryName.length;

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
    this.categoryName = categoryName

  }


  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }



  // Відстежування події прокрутки вікна
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (!this.isBrowser) return;
    const scrollPosition = window.scrollY;

    // Паралакс фонового зображення
    const bgImage = document.querySelector('.bg_image') as HTMLElement;
    const parallaxValue = Math.round(scrollPosition * 0.8);
    if (bgImage) {
      bgImage.style.transform = `translate3d(0, ${parallaxValue}px, 0)`;
    }

    // Анімація опису (лише раз)
    if (this.textBlocksRef && !this.wasTextVisible) {
      const element = this.textBlocksRef.nativeElement;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const elementHeight = element.offsetHeight;

      if (scrollPosition + window.innerHeight > elementTop + elementHeight / 2) {
        this.isVisible = true;
        this.wasTextVisible = true;
      }
    }

    // Анімація карток (лише раз)
    const recipeCards = document.querySelectorAll('.dishes_card:not(.show)');
    recipeCards.forEach((card: Element) => {
      const htmlCard = card as HTMLElement;
      const elementTop = htmlCard.getBoundingClientRect().top + window.scrollY;
      const elementHeight = htmlCard.offsetHeight;

      if (scrollPosition + window.innerHeight > elementTop + elementHeight / 2) {
        htmlCard.classList.add('show');
      }
    });
  }


  onCountriSelection(id: string) {
    const unique = new Map<any, { id: number | string, regionName: string }>();
    /*  const selectElement = event.target as HTMLSelectElement; 
     const selectedCuisineId = selectElement.value; */
    if (id !== 'all') {
      this.recipesFilter = this.recipes.filter(r => r.cuisine.id === id);
      this.countriesRecipe = this.recipesFilter;
      this.recipesFilter.forEach(r => {
        const c = r.region;
        if (c && !unique.has(c.id)) {
          unique.set(c.id, { id: c.id, regionName: c.regionName });
        }
      });
      this.filteredRegions = Array.from(unique.values());
      window.scrollBy(0, 1);

    } else {
      this.recipesFilter = this.recipes
      this.recipesFilter.sort((a, b) =>
        a.recipeTitle.localeCompare(b.recipeTitle)
      );
      window.scrollBy(0, 1);
    }


  }

  onRegionSelection(id: string) {

    if (id !== 'all') {
      this.recipesFilter = this.countriesRecipe.filter(r =>
        r.region?.id === id
      );
    } else {
      this.recipesFilter = this.countriesRecipe
      this.recipesFilter.sort((a, b) =>
        a.recipeTitle.localeCompare(b.recipeTitle)
      );
    }
    window.scrollBy(0, 1);
  }


  resetProducts() {
    this.selectedProducts = [];
    this.recipesFilter = this.countriesRecipe.length ? this.countriesRecipe : this.recipes;
    this.recipesFilter.sort((a, b) =>
      a.recipeTitle.localeCompare(b.recipeTitle)
    );
  }


  onProductToggle(productId: string) {
    const index = this.selectedProducts.indexOf(productId);
    if (index > -1) {
      this.selectedProducts.splice(index, 1); // Зняли чекбокс — видалили з масиву
    } else {
      this.selectedProducts.push(productId); // Додали до масиву
    }

    if (this.selectedProducts.length === 0) {
      // Якщо нічого не вибрано — показуємо всі рецепти
      this.recipesFilter = this.countriesRecipe.length ? this.countriesRecipe : this.recipes;
      this.recipesFilter.sort((a, b) =>
        a.recipeTitle.localeCompare(b.recipeTitle)
      );
    } else {
      // Фільтруємо тільки за обраними інгредієнтами
      this.recipesFilter = (this.countriesRecipe.length ? this.countriesRecipe : this.recipes).filter(recipe =>
        recipe.ingredients?.some((i: { id: string; }) => this.selectedProducts.includes(i.id))
      );
      this.recipesFilter.sort((a, b) =>
        a.recipeTitle.localeCompare(b.recipeTitle)
      );
    }

    window.scrollBy(0, 1);
  }


  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.onScroll(null));
    }
  }

}
