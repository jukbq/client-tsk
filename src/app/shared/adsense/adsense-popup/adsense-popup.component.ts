import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';


@Component({
  selector: 'app-adsense-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adsense-popup.component.html',
  styleUrl: './adsense-popup.component.scss',
})
export class AdsensePopupComponent {
  showAd = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAd();

      // Оновлюємо рекламу при зміні маршруту
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          this.loadAd();
        });
    }
  }

  private loadAd() {
    this.showAd = false; // скидаємо показ
    setTimeout(() => {
      this.showAd = true;
      try {
        // TypeScript вже не буде скаржитись
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }, 500); // невелика затримка, щоб DOM встиг відрендеритись
  }
}
