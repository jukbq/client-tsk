import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { CommonModule } from '@angular/common';
import { FooyerComponent } from "./shared/components/fooyer/fooyer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooyerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Таверна Синій кіт';

  isScrollVisible: boolean = false;

  constructor(private router: Router) {}

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
}
