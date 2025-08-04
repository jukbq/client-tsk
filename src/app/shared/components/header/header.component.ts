import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { DishesService } from '../../services/dishes/dishes.service';
import { CategoriesService } from '../../services/categories/categories.service';
import { SsrLinkDirective } from '../../directives/ssr-link.directive';
import { filter } from 'rxjs';
import { ArticleTypeService } from '../../services/article/article-type/article-type.service';
import { ArticleCategoriesService } from '../../services/article/article-categories/article-categories.service';


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
  subarticleType: any[] = [];
  isDropdownOpen = false;
  activeDropdownId: string | null = null;


  // Для меню "Байки"
  articleTypeList: any[] = [];
  articleTypeId: string | null = null;
  subArticleCategories: any[] = [];

  //menu

  activeItem: number | undefined;
  close: boolean = true;
  activeSubSubItem: number | undefined;
  subSubDishes: any[] = [];


  // Для контролю активних пунктів
  activeMenu = '';
  activeSubItem: number | undefined;

  isBrowser = false;
  parallaxEnabled = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dishesService: DishesService,
    private categoryService: CategoriesService,
    private typeService: ArticleTypeService,
    private articleCategoryService: ArticleCategoriesService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        const header = document.querySelector('header') as HTMLElement;

        const isParallaxRoute = !(
          event.urlAfterRedirects.startsWith('/recipe-page') ||
          event.urlAfterRedirects.startsWith('/search') ||
          event.urlAfterRedirects.startsWith('/recipe-filte') ||
          event.urlAfterRedirects.startsWith('/about-us') ||
          event.urlAfterRedirects.startsWith('/kontakty') ||
          event.urlAfterRedirects.startsWith('/umovy-korystuvannya') ||
          event.urlAfterRedirects.startsWith('/privacyy')
        );

        this.parallaxEnabled = isParallaxRoute;

        if (header) {
          if (this.parallaxEnabled) {
            // Увімкнено паралакс — повертаємо позицію до нормальної
            header.style.position = ''; // або 'relative', якщо треба
            header.style.transform = 'translate3d(0, 0, 0)';
          } else {
            // Вимкнено паралакс — скидаємо рух, але не чіпаємо position
            header.style.transform = 'translate3d(0, 0, 0)';
          }
        }
      });
    }

  }

  ngOnInit(): void {
    this.getDishes()
    this.getArticleType()
  }


  getDishes() {
    this.dishesService.getAllLight().subscribe((data: any) => {
      this.dishesList = data;
      this.dishesList.sort((a, b) =>
        a.dishesName.localeCompare(b.dishesName)
      );
    });
  }
  getArticleType() {
    this.typeService.getAll().subscribe((data: any) => {
      this.articleTypeList = data;
      this.articleTypeList.sort((a, b) =>
        a.activeSubItem.localeCompare(b.activeSubItem)
      );
    });
  }

  onSelectItem(menuName: string): void {
    this.activeMenu = this.activeMenu === menuName ? '' : menuName;
    this.activeSubItem = undefined;
    this.subArticleCategories = [];
  }

  onSelectSubItem(j: number): void {
    this.activeSubItem = j;
  }

  loadSubDishes(dishId: string, j: number): void {

    if (this.selectedDishesId !== dishId) {
      this.activeSubItem = j;
      this.subDishes = [];
      this.selectedDishesId = dishId;
      this.categoryService.getLightById(dishId)
        .subscribe((data: any[]) => {
          this.subDishes = data;
          this.subDishes.sort((a, b) =>
            a.categoryName.localeCompare(b.categoryName)
          );
        });


    } else {
      this.selectedDishesId = '';
      this.activeSubItem = undefined;

    }
  }

  loadArticleCategories(typeId: string, index: number) {
    if (this.articleTypeId !== typeId) {
      this.articleTypeId = typeId;
      this.activeSubItem = index;
      this.subArticleCategories = [];

      this.articleCategoryService.getArticleCategoryByTypeID(typeId).subscribe((data: any[]) => {
        this.subArticleCategories = data;
        this.subArticleCategories.sort((a, b) =>
          a.aticleCategoryName.localeCompare(b.aticleCategoryName)
        );
      });
    } else {
      this.articleTypeId = null;
      this.activeSubItem = undefined;
      this.subArticleCategories = [];
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
