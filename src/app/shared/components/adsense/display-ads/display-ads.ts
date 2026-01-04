import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, Inject, OnDestroy, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-display-ads',
  imports: [],
  templateUrl: './display-ads.html',
  styleUrl: './display-ads.scss',
})
export class DisplayAds implements AfterViewInit, OnDestroy{
  
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('adHost')
  private adHost!: ElementRef<HTMLElement>;

  /** 🔥 signal: чи реклама вже почала вантажитись */
  readonly loading = signal(false);

  private observer?: IntersectionObserver;
  private loaded = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.loaded) {
            this.loaded = true;
            this.startLoadingAd();
            this.observer?.disconnect();
            break;
          }
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    this.observer.observe(this.adHost.nativeElement);
  }

  private startLoadingAd(): void {
    try {
      // 👉 тут ключове: ТІЛЬКИ ЗАРАЗ резервуємо місце
      this.loading.set(true);

      const w = window as any;
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch (err) {
      console.warn('AdSense error:', err);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
