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
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadAd();

    // Показ реклами після переходу між сторінками
    this.router.events
      .pipe(filter((ev) => ev instanceof NavigationEnd))
      .subscribe(() => this.loadAd());
  }

  close() {
    this.showAd = false;
  }

  private loadAd() {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      this.showAd = true;

      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }

      // Додатково оновлюємо при зміні розміру
      window.addEventListener('resize', () => {
        try {
          (window as any).adsbygoogle.push({});
        } catch {}
      });
    }, 1000); // 1 секунда, щоб DOM відрендерився
  }
}
