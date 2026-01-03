import { Component, HostListener, inject, Inject, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { Footer } from "./shared/components/footer/footer";

@Component({
  selector: 'app-root',
  imports: [Header, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
// Залежності
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

// Стан (Signals)
  protected readonly title = signal('Таверна Синій кіт');
  hideFooter = signal(false);
  isScrollVisible = signal(false);
  showPatreonPopup = signal(false);

constructor() {
    if (this.isBrowser) {
      this.initNavigationLogic();
      this.initPatreonTimer();
    }
  }

  private initNavigationLogic() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const route = this.router.routerState.snapshot.root.firstChild;
        
        // 1. Керування футером через дані роуту
        this.hideFooter.set(!!route?.data?.['hideFooter']);

                 
      });
  }

  private initPatreonTimer() {
    // Показати через 20 секунд
    setTimeout(() => {
      this.showPatreonPopup.set(true);
      // Закрити автоматично через 45 секунд після відкриття
      setTimeout(() => this.showPatreonPopup.set(false), 45000);
    }, 20000);
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.isBrowser) {
      // Кнопка з'являється після 800px прокрутки
      this.isScrollVisible.set(window.scrollY > 800);
    }
  }

  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  closePatreonPopup(): void {
    this.showPatreonPopup.set(false);
  }


  
}
