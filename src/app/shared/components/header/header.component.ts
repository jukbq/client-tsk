import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DishesService } from '../../services/dishes/dishes.service';
import { CategoriesService } from '../../services/categories/categories.service';
import { SsrLinkDirective } from '../../directives/ssr-link.directive';


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


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dishesService: DishesService,
    private categoryService: CategoriesService,
    private router: Router
  ) { }

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
    if (isPlatformBrowser(this.platformId)) {
      const offcanvasElement = document.getElementById('offcanvasNavbar');
      if (offcanvasElement) {
        const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
        if (offcanvasInstance) {
          offcanvasInstance.hide();
        }
      }
    }
  }



}
