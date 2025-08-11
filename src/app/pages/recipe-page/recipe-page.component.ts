import { CommonModule, DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FooyerComponent } from '../../shared/components/fooyer/fooyer.component';
import { SeoService } from '../../shared/services/seo/seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { RecipeService } from '../../shared/services/recipe/recipe.service';
import { SsrLinkDirective } from '../../shared/directives/ssr-link.directive';
import { RecipeInfoComponent } from "./components/recipe-info/recipe-info.component";
import { RecipeDescriptionComponent } from "./components/recipe-description/recipe-description.component";
import { RecipeIngredientsComponent } from "./components/recipe-ingredients/recipe-ingredients.component";
import { RecipeInstructionsComponent } from "./components/recipe-instructions/recipe-instructions.component";
import { AutoScrollCarouselComponent } from "./components/auto-scroll-carousel/auto-scroll-carousel.component";
declare var bootstrap: any;


@Component({
  selector: 'app-recipe-page',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective, RecipeInfoComponent, RecipeDescriptionComponent, RecipeIngredientsComponent, RecipeInstructionsComponent, AutoScrollCarouselComponent],
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss'
})

export class RecipePageComponent {
  isBrowser: boolean = false;

  //Меню
  activeItem = 0;
  activeBlock = '';
  menuOffset!: number;



  //дані рецепта
  currentURL = '';
  recipeTitle = '';
  mainImage = '';
  recipeSubtitles = '';
  descriptionRecipe = '';
  dishesID = '';
  dishesName = '';
  categoryID = '';
  categoryName = '';
  seasons: any = [];
  info: any = [];
  ingredients: any = [];
  accompanyingRecipes: any = [];
  instructions: any = [];
  advice = '';
  completion = '';





  recipeID = '';

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
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }



  ngOnInit() {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.route.data.subscribe((data: any) => {

      if (this.isBrowser) {
        window.scrollTo(0, 0);
      }


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

      this.processRecipeData(recipeSSR);
      this.info = info
    });

    if (this.isBrowser) {
      window.scrollTo(0, 0);
      const header = document.querySelector('header') as HTMLElement | null;
      const menu = document.querySelector('.menu_block') as HTMLElement | null;
      const content = document.querySelector('.recipe_block') as HTMLElement | null;


      if (header && menu && content) {
        this.menuOffset = menu.offsetHeight;
        header.style.position = `fixed`;
        content.style.marginTop = `${this.menuOffset}px`;
      }

    }
  }




  // Викликаємо сервіс для отримання даних рецепта на стороні сервера
  processRecipeData(recipe: any) {
    if (recipe) {
      this.currentURL = recipe.currentURL
      this.seoServices.setCanonicalUrl(this.currentURL)

      this.recipeTitle = recipe.recipeTitle
      this.mainImage = recipe.mainImage
      this.recipeSubtitles = recipe.recipeSubtitles
      this.descriptionRecipe = recipe.descriptionRecipe


      this.dishesID = recipe.dishesID
      this.dishesName = recipe.dishesName
      this.categoryID = recipe.categoryID
      this.recipeID = recipe.recipeID
      this.categoryName = recipe.categoryName

      const seoName = recipe.seoName
      const seoDescription = recipe.seoDescription;
      const keywords = recipe.keywords;
      this.seasons = recipe.bestSeason || [];


      this.ingredients = recipe.ingredients
      this.accompanyingRecipes = recipe.accompanyingRecipes


      this.instructions = recipe.instructions
      this.advice = recipe.advice;
      this.completion = recipe.completion;

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



  }


  scroll(id: string, index: number) {
    this.activeItem = index;
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - this.menuOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

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



  reloadMenu() {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.activeItem = 0;
    }
  }

}




