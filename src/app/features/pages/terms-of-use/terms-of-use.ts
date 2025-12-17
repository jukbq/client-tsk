import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-terms-of-use',
  imports: [SsrLinkDirective],
  templateUrl: './terms-of-use.html',
  styleUrl: './terms-of-use.scss',
})
export class TermsOfUse {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  ngOnInit(): void {
    if (this.isBrowser) {
      this.viewportScroller.scrollToPosition([0, 0]);
    }
    
    this.title.setTitle('Умови користування | Синій Кіт');
    this.meta.updateTag({ name: 'description', content: 'Правила та умови перебування у таверні Синій Кіт. Як готувати, як ділитись контентом і чому не можна викрадати кота.' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
  }

}
