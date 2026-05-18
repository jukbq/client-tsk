import { Component, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-share-recipe',
  standalone: true,
  imports: [],
  templateUrl: './share-recipe.html',
  styleUrl: './share-recipe.scss',
})

export class ShareRecipe {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signal inputs
  title = input.required<string>();
  currentUrl = input.required<string>();
  image = input<string | undefined>();

  // State for copy feedback
  copied = signal(false);

  shareTelegram(): void {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(this.currentUrl())}&text=${encodeURIComponent(this.title())}`;
    this.openWindow(shareUrl);
  }

  shareFacebook(): void {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.currentUrl())}`;
    this.openWindow(shareUrl);
  }

  shareViber(): void {
    const shareUrl = `viber://forward?text=${encodeURIComponent(this.title() + ' ' + this.currentUrl())}`;
    this.openWindow(shareUrl);
  }

  sharePinterest(): void {
    if (this.image()) {
      const shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(this.currentUrl())}&media=${encodeURIComponent(this.image()!)}&description=${encodeURIComponent(this.title())}`;
      this.openWindow(shareUrl);
    }
  }

  copyLink(): void {
    if (this.isBrowser) {
      navigator.clipboard.writeText(this.currentUrl()).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2500);
      });
    }
  }

  private openWindow(url: string): void {
    if (this.isBrowser) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}


