import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FooyerComponent } from "./shared/components/fooyer/fooyer.component";
import { AdsensePopupComponent } from "./shared/adsense/adsense-popup/adsense-popup.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooyerComponent, AdsensePopupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Таверна Синій кіт';

  isScrollVisible: boolean = false;

  showPatreonPopup: boolean = false;

  constructor(
       @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router) {}

  // Відстежування події прокрутки вікна
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.isScrollVisible = window.scrollY > 800;
  }

  // Метод для прокручування нагору
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Плавна прокрутка
    });
  }

  showFooter(): boolean {
    const noFooterRoutes = ['/auth', '/profile']; // сторінки, де футер не потрібен
    return !noFooterRoutes.includes(this.router.url);
  }

  ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)) {
    // Показати попап через 25 секунд
    setTimeout(() => {
      this.showPatreonPopup = true;

      // Автоматичне закриття через 15 секунд
      setTimeout(() => {
        this.showPatreonPopup = false;
      }, 45000);
    }, 20000);
  }
  }

  closePatreonPopup(): void {
    this.showPatreonPopup = false;
  }
}
