import { Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { Footer } from "./shared/components/footer/footer";

@Component({
  selector: 'app-root',
  imports: [Header, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('client-tsk');

  hideFooter = signal(false);

constructor(
  private router: Router,
  @Inject(PLATFORM_ID) private platformId: Object
) {
  if (isPlatformBrowser(this.platformId)) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {

        const route = this.router.routerState.snapshot.root.firstChild;
        this.hideFooter.set(!!route?.data?.['hideFooter']);

        const header = document.querySelector('header') as HTMLElement | null;
        if (!header) return;

        const url = event.urlAfterRedirects;

        if (
          url.startsWith('/recipe-page') ||
                   url.startsWith('/search')
        ) {
          header.classList.add('fixed-header');
        } else {
          header.classList.remove('fixed-header');
        }
      });
  }
}


  
}
