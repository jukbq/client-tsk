import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AdsenseLoaderService } from '../../../../core/services/adsense-loader/adsense-loader';

const MOBILE_QUERY = '(max-width: 1024px)';
const EXPANDED_HEIGHT = '90px';
const COLLAPSED_HEIGHT = '24px';

@Component({
  selector: 'app-mobile-sticky-ads',
  imports: [],
  templateUrl: './mobile-sticky-ads.html',
  styleUrl: './mobile-sticky-ads.scss',
})
export class MobileStickyAds implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adsenseLoader = inject(AdsenseLoaderService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('adSlot')
  private adSlot?: ElementRef<HTMLElement>;

  protected readonly isCollapsed = signal(false);
  protected readonly isMobileViewport = signal(false);

  private mediaQuery?: MediaQueryList;
  private removeMediaListener?: () => void;
  private adRequested = false;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.mediaQuery = window.matchMedia(MOBILE_QUERY);
    this.syncViewportState(this.mediaQuery.matches);
    this.initRouteReset();

    const onMediaChange = (event: MediaQueryListEvent) => {
      this.syncViewportState(event.matches);
    };

    if (typeof this.mediaQuery.addEventListener === 'function') {
      this.mediaQuery.addEventListener('change', onMediaChange);
      this.removeMediaListener = () => this.mediaQuery?.removeEventListener('change', onMediaChange);
    } else {
      this.mediaQuery.addListener(onMediaChange);
      this.removeMediaListener = () => this.mediaQuery?.removeListener(onMediaChange);
    }

    this.destroyRef.onDestroy(() => {
      this.removeMediaListener?.();
      this.clearBodyOffset();
    });
  }

  protected toggleCollapsed(): void {
    this.isCollapsed.update((value) => !value);
    this.syncBodyOffset();
  }

  private initRouteReset(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.isCollapsed.set(false);
        this.syncBodyOffset();
      });
  }

  private syncViewportState(matchesMobile: boolean): void {
    this.isMobileViewport.set(matchesMobile);
    this.syncBodyOffset();

    if (matchesMobile) {
      this.requestAd();
    }
  }

  private syncBodyOffset(): void {
    if (!this.isMobileViewport()) {
      this.clearBodyOffset();
      return;
    }

    const height = this.isCollapsed() ? COLLAPSED_HEIGHT : EXPANDED_HEIGHT;
    this.renderer.addClass(this.document.body, 'has-mobile-sticky-ads');
    this.renderer.setStyle(this.document.body, '--mobile-sticky-ads-current-height', height);
  }

  private clearBodyOffset(): void {
    this.renderer.removeClass(this.document.body, 'has-mobile-sticky-ads');
    this.renderer.removeStyle(this.document.body, '--mobile-sticky-ads-current-height');
  }

  private requestAd(): void {
    if (this.adRequested || !this.adSlot?.nativeElement) return;

    this.adRequested = true;
    this.adsenseLoader.load();

    window.setTimeout(() => {
      try {
        const browserWindow = window as typeof window & {
          adsbygoogle?: unknown[];
        };
        browserWindow.adsbygoogle = browserWindow.adsbygoogle || [];
        browserWindow.adsbygoogle.push({});
      } catch (error) {
        console.warn('Mobile sticky AdSense error:', error);
      }
    });
  }
}
