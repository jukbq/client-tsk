import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { SeoService } from '../../../core/services/seo/seo-service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
private readonly platformId = inject(PLATFORM_ID);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly seoServices = inject(SeoService);
  private readonly titleService = inject(Title);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly currentURL = 'https://tsk.in.ua/kontakty';

  ngOnInit() {
    this.titleService.setTitle('Контакти таверни «Синій Кіт» — Напишіть Сиволапу');
    this.seoServices.setCanonicalUrl(this.currentURL);
    
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }
  }
}
