import { Component, ElementRef, Inject, Input, PLATFORM_ID, ViewChild } from '@angular/core';
import { RecipeService } from '../../../../shared/services/recipe/recipe.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SsrLinkDirective } from '../../../../shared/directives/ssr-link.directive';

@Component({
  selector: 'app-auto-scroll-carousel',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective],
  templateUrl: './auto-scroll-carousel.component.html',
  styleUrl: './auto-scroll-carousel.component.scss'
})
export class AutoScrollCarouselComponent {
  @Input() dishesID = '';
  @Input() recipeID = '';
  @Input() currentURL = '';
  recipes: any[] = [];


  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  scrollSpeed = 1;
  scrollInterval: any;
  startX = 0;
  isDragging = false;
  scrollLeftStart = 0;

  isBrowser: boolean = false;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private recipeService: RecipeService
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }



  ngOnInit() {
    if (this.isBrowser) {
      this.getRandomRecipes();
      setTimeout(() => {
        this.startAutoScroll();
      }, 500);


    }
  }



  //Отриаення рандомних рецептів
  getRandomRecipes() {
    this.recipeService
      .getRandomRecipesByDishesID(this.dishesID, 30)
      .subscribe((data) => {
        const uniqueRecipes = data.filter(
          (newRecipe) =>
            newRecipe.id !== this.recipeID &&
            !this.recipes.some((existingRecipe) => existingRecipe.id === newRecipe.id) /// Виключаємо дублікати
        );

        // Додаємо тільки унікальні рецепти
        this.recipes = [...this.recipes, ...uniqueRecipes];
      });

  }

  ngAfterViewInit() {
    this.startAutoScroll();
  }

  startAutoScroll() {
    this.stopAutoScroll();
    this.scrollInterval = setInterval(() => {
      const container = this.scrollContainer.nativeElement;
      container.scrollLeft += this.scrollSpeed;
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0;
      }
    }, 16);
  }

  stopAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  // Drag mouse
  onDragStart(event: MouseEvent) {
    this.isDragging = true;
    this.stopAutoScroll();
    this.startX = event.pageX - this.scrollContainer.nativeElement.offsetLeft;
    this.scrollLeftStart = this.scrollContainer.nativeElement.scrollLeft;
  }


  onDragMove(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();
    const x = event.pageX - this.scrollContainer.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.scrollContainer.nativeElement.scrollLeft = this.scrollLeftStart - walk;
  }

  onDragEnd() {
    this.isDragging = false;
    this.startAutoScroll();
  }

  // Touch
  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.stopAutoScroll();
    this.startX = event.touches[0].pageX - this.scrollContainer.nativeElement.offsetLeft;
    this.scrollLeftStart = this.scrollContainer.nativeElement.scrollLeft;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    const x = event.touches[0].pageX - this.scrollContainer.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.scrollContainer.nativeElement.scrollLeft = this.scrollLeftStart - walk;
  }

  onTouchEnd() {
    this.isDragging = false;
    this.startAutoScroll();
  }

  scrollLeft() {
    const container = this.scrollContainer.nativeElement;
    if (container.scrollLeft <= 0) {
      // Якщо дійшли до початку — скидаємо в кінець (максимальна позиція)
      container.scrollLeft = container.scrollWidth - container.clientWidth;
    } else {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }



  scrollRight() {
    const container = this.scrollContainer.nativeElement;
    if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
      // Якщо дійшли правого краю, скидаємо в початок
      container.scrollLeft = 0;
    } else {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }

  onMouseEnter() {
    this.stopAutoScroll();
  }


  onMouseLeave() {
    this.startAutoScroll();
  }


}
