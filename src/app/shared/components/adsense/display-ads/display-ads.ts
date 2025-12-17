import { isPlatformBrowser } from '@angular/common';
import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-display-ads',
  imports: [],
  templateUrl: './display-ads.html',
  styleUrl: './display-ads.scss',
})
export class DisplayAds {
private readonly platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.pushAd();
    }
  }

  private pushAd() {
    try {
      // Додаємо невелику затримку, щоб переконатися, що Angular завершив рендеринг DOM
      setTimeout(() => {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      }, 200);
    } catch (e) {
      console.warn('AdSense error:', e);
    }
  }
}
