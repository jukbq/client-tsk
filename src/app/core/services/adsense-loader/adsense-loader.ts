import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdsenseLoaderService {
  private loaded = false;

  load() {
    if (typeof window === 'undefined') return;
    if (this.loaded) return;

    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      this.loaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0683376676562440';
    script.async = true;
    script.crossOrigin = 'anonymous';

    document.body.appendChild(script);

    this.loaded = true;
  }
}