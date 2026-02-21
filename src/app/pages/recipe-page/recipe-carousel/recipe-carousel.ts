import { 
  Component, 
  ElementRef, 
  inject, 
  input, 
  PLATFORM_ID, 
  ViewChild, 
  signal, 
  effect, 
  OnDestroy, 
  AfterViewInit 
} from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { RecipeService } from '../../../core/services/recipe/recipe-service';

@Component({
  selector: 'app-recipe-carousel',
  standalone: true,
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './recipe-carousel.html',
  styleUrl: './recipe-carousel.scss',
})
export class RecipeCarousel implements AfterViewInit, OnDestroy {
  // Inputs
  dishesID = input<string>('');
  recipeID = input<string>('');
  
  // State
  recipes = signal<any[]>([]);
  isDragging = false;
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private recipeService = inject(RecipeService);
  
  private animationId?: number;
  private isPaused = false;
  private startX = 0;
  private scrollLeftStart = 0;

  constructor() {
    effect(() => {
      const id = this.dishesID();
      if (id) this.loadRecipes(id);
    });
  }

  

  private loadRecipes(id: string) {
    this.recipeService.getRandomRecipesByDishesID(id, 10).subscribe((data) => {
      const filtered = data.filter(r => r.id !== this.recipeID());
      this.recipes.set(filtered);
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.startAutoScroll();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  // ---------- AUTO SCROLL ----------

  private startAutoScroll(): void {
    if (!this.isBrowser || this.animationId) return;

    const step = () => {
      if (!this.isPaused && !this.isDragging && this.scrollContainer) {
        const el = this.scrollContainer.nativeElement;
        el.scrollLeft += 1;

        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      this.animationId = requestAnimationFrame(step);
    };
    this.animationId = requestAnimationFrame(step);
  }

  private stopAutoScroll(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  // ---------- EVENTS ----------

  onMouseEnter() { this.isPaused = true; }
  onMouseLeave() { if (!this.isDragging) this.isPaused = false; }

  onDragStart(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    this.isPaused = true;
    const pageX = event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;
    this.startX = pageX - this.scrollContainer.nativeElement.offsetLeft;
    this.scrollLeftStart = this.scrollContainer.nativeElement.scrollLeft;
  }

  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    const pageX = event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;
    const x = pageX - this.scrollContainer.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.scrollContainer.nativeElement.scrollLeft = this.scrollLeftStart - walk;
  }

  onDragEnd(): void {
    this.isDragging = false;
    this.isPaused = false;
  }

  scroll(direction: 'left' | 'right'): void {
    if (!this.scrollContainer) return;
    const el = this.scrollContainer.nativeElement;
    const step = 350;
    const target = direction === 'left' ? el.scrollLeft - step : el.scrollLeft + step;

    this.isPaused = true;
    el.scrollTo({ left: target, behavior: 'smooth' });

    // Повертаємо автоскрол після завершення анімації
    setTimeout(() => {
      if (!this.isDragging) this.isPaused = false;
    }, 1000);
  }
}