import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FooyerComponent } from "../fooyer/fooyer.component";
import { SeoService } from '../../services/seo/seo.service';
import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { SsrLinkDirective } from '../../directives/ssr-link.directive';

@Component({
  selector: 'app-terms-of-use',
  standalone: true,
  imports: [SsrLinkDirective, FooyerComponent],
  templateUrl: './terms-of-use.component.html',
  styleUrl: './terms-of-use.component.scss'
})
export class TermsOfUseComponent {
  currentURL = 'https://tsk.in.ua/umovy-korystuvannya';
  isBrowser: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private viewportScroller: ViewportScroller,
    private seoServices: SeoService
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.seoServices.setCanonicalUrl(this.currentURL)
    }
  }
}
