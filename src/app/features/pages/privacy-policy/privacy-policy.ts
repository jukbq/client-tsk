import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo/seo-service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly seoService = inject(SeoService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly currentURL = 'https://tsk.in.ua/privacyy';

  cookieAccepted = false;

  ngOnInit(): void {
    // 🔴 КЛЮЧОВЕ: Privacy = NOINDEX
    this.meta.updateTag({
      name: 'robots',
      content: 'noindex, follow',
    });

    // Title + description — для UX і соцмереж
    this.title.setTitle('Політика конфіденційності | Синій Кіт');
    this.meta.updateTag({
      name: 'description',
      content:
        'Політика конфіденційності сайту Синій Кіт: які дані ми збираємо, як зберігаємо та як використовуємо cookies.',
    });

    // Canonical (self, опціонально)
    this.seoService.setCanonicalUrl(this.currentURL);

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
