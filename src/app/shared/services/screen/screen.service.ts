import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  private isMobileSubject = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.checkScreenSize();
      window.addEventListener('resize', () => this.checkScreenSize());
    }
  }

  private checkScreenSize(): void {
    if (this.isBrowser) {
      this.isMobileSubject.next(window.innerWidth <= 768);
    }
  }


  get isMobile$() {
    return this.isMobileSubject.asObservable();
  }
}
