import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { SeoService } from '../../services/seo/seo.service';
import { FooyerComponent } from "../fooyer/fooyer.component";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FooyerComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  isBrowser: boolean = false;
  currentURL = 'https://tsk.in.ua/kontakty';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private viewportScroller: ViewportScroller,
    private seoServices: SeoService
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }

  ngOnInit() {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
      this.seoServices.setCanonicalUrl(this.currentURL)
    }
  }

}
