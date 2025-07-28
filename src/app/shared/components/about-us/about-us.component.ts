import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FooyerComponent } from "../fooyer/fooyer.component";
import { CommonModule, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { SeoService } from '../../services/seo/seo.service';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [FooyerComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  isBrowser: boolean = false;
  currentURL = 'https://tsk.in.ua/about-us';


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private viewportScroller: ViewportScroller,
    private seoServices: SeoService
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }


  ngOnInit() {
    this.seoServices.setCanonicalUrl(this.currentURL)
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);

    }
  }

}
