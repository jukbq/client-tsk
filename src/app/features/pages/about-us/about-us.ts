import { isPlatformBrowser, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { SeoService } from '../../../core/services/seo/seo-service';

@Component({
  selector: 'app-about-us',
 imports: [ NgOptimizedImage],
  templateUrl: './about-us.html',
  styleUrl: './about-us.scss',
})
export class AboutUs {
 private readonly platformId = inject(PLATFORM_ID);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly seoServices = inject(SeoService);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly currentURL = 'https://tsk.in.ua/about-us';

  ngOnInit() {
    this.seoServices.setCanonicalUrl(this.currentURL);
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }
  }

}
