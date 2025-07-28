import { CommonModule, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { SeoService } from '../../services/seo/seo.service';
import { FooyerComponent } from "../fooyer/fooyer.component";

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, FooyerComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  isBrowser: boolean = false;
  cookieAccepted = false;
  currentURL = 'https://tsk.in.ua/privacyy';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private viewportScroller: ViewportScroller,
    private seoServices: SeoService
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }

  ngOnInit(): void {
    this.seoServices.setCanonicalUrl(this.currentURL)
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
