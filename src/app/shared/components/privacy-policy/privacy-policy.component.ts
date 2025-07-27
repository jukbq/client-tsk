import { CommonModule, isPlatformBrowser } from '@angular/common';
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

  cookieAccepted = false;
  currentURL = 'https://tsk.in.ua/privacyy';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seoServices: SeoService
  ) { }

  ngOnInit(): void {



    if (isPlatformBrowser(this.platformId)) {
      this.cookieAccepted = localStorage.getItem('cookieConsent') === 'true';
      this.seoServices.setCanonicalUrl(this.currentURL)
    }
  }

  acceptCookies(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'true');
    }
    this.cookieAccepted = true;
  }

}
