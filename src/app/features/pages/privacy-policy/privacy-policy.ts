import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { SeoService } from '../../../core/services/seo/seo-service';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {
private readonly platformId = inject(PLATFORM_ID);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly seoServices = inject(SeoService);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly currentURL = 'https://tsk.in.ua/privacyy';
  
  cookieAccepted = false;

  ngOnInit(): void {
    this.seoServices.setCanonicalUrl(this.currentURL);
    
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.cookieAccepted = localStorage.getItem('cookieConsent') === 'true';
    }
  }

  acceptCookies(): void {
    if (this.isBrowser) {
      localStorage.setItem('cookieConsent', 'true');
    }
    this.cookieAccepted = true;
  }
}
