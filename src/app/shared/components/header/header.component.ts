import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { DishesService } from '../../services/dishes/dishes.service';
import { CategoriesService } from '../../services/categories/categories.service';
import { SsrLinkDirective } from '../../directives/ssr-link.directive';
import { filter } from 'rxjs';


declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  dishesList: any[] = [];
  selectedDishesId: string | null = null;
  subDishes: any[] = [];
  isDropdownOpen = false;
  activeDropdownId: string | null = null;

  //menu

  activeItem: number | undefined;
  activeSubItem: number | undefined;
  close: boolean = true;
  activeSubSubItem: number | undefined;
  subSubDishes: any[] = [];
  activeMenu = ''

  isBrowser: boolean = false;
  parallaxEnabled = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dishesService: DishesService,
    private categoryService: CategoriesService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        // Якщо URL починається з /recipe-page — вимикаємо паралакс
        this.parallaxEnabled = !(
          event.urlAfterRedirects.startsWith('/recipe-page') ||
          event.urlAfterRedirects.startsWith('/search') ||
          event.urlAfterRedirects.startsWith('/recipe-filte') ||
          event.urlAfterRedirects.startsWith('/about-us') ||
          event.urlAfterRedirects.startsWith('/kontakty') ||
          event.urlAfterRedirects.startsWith('/umovy-korystuvannya') ||
          event.urlAfterRedirects.startsWith('/privacyy')
        );

        // Опціонально: скидуємо паралакс на 0, якщо вимкнули
        if (!this.parallaxEnabled) {
          const header = document.querySelector('header') as HTMLElement;
          if (header) {
            header.style.transform = 'translate3d(0, 0, 0)';
          }
        }
      });
    }
  }

  ngOnInit(): void {
    this.getDishes()
  }


  getDishes() {
    this.dishesService.getAllLight().subscribe((data: any) => {
      this.dishesList = data;
    });
  }

  onSelectItem(menuName: string): void {
    if (menuName !== this.activeMenu) {
      this.activeMenu = menuName;
    } else {
      this.activeMenu = '';
    }
  }

  onSelectSubItem(j: number): void {
    this.activeSubItem = j;
    this.close = false;
  }

  loadSubDishes(dishId: string, j: number): void {
    if (this.selectedDishesId !== dishId) {
      this.activeSubItem = j;
      this.subDishes = [];
      this.selectedDishesId = dishId;
      this.categoryService.getLightById(dishId)
        .subscribe((data: any[]) => {
          this.subDishes = data;
        });
    } else {
      this.selectedDishesId = '';
      this.activeSubItem = undefined;

    }
  }

  closeMenu() {
    this.isDropdownOpen = false;
    this.subDishes = [];
    this.selectedDishesId = '';
  }

  mobileMenu(item: string) {
    if (item === 'isDropdownOpen') {
      this.isDropdownOpen = !this.isDropdownOpen;
    } else {
      this.activeDropdownId = this.activeDropdownId === item ? '' : item;
      /*    this.loadSubDishes(item); */
    }
  }

  closeOffcanvas() {
    if (!this.isBrowser) return;
    const offcanvasElement = document.getElementById('offcanvasNavbar');
    if (offcanvasElement) {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
    }

  }



  // Відстежування події прокрутки вікна
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (!this.isBrowser || !this.parallaxEnabled) return;
    const scrollPosition = window.scrollY;
    //паралакс фонового зображення
    const header = document.querySelector('header') as HTMLElement;
    const parallaxValue = Math.max(0, Math.round(scrollPosition * 0.8));
    header.style.transform = `translate3d(0, ${parallaxValue}px, 0)`;
  }



}
