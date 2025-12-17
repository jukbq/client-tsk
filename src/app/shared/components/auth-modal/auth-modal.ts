import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { ModalPayload, ModalService } from '../../../core/services/modal/modal.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';



@Component({
  selector: 'app-auth-modal',
  imports: [],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.scss',
})
export class AuthModal {
    open = false;
  payload: ModalPayload | null = null;
  private sub: Subscription | null = null;
  private previouslyFocused: HTMLElement | null = null;
  isBrowser: boolean = false;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public modal: ModalService,
    private elRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); 
  }

    ngOnInit() {
    this.sub = this.modal.state$.subscribe((state) => {
      if (state.open) this.show(state.payload ?? null);
      else this.hide();
    });
  }

   ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private show(payload: ModalPayload | null) {
    this.payload = payload;
    if (this.isBrowser) {
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      this.open = true;
      this.renderer.addClass(document.body, 'no-scroll');
    }
  }

  private hide() {
    this.open = false;
    this.payload = null;
     if (this.isBrowser) {
    this.renderer.removeClass(document.body, 'no-scroll');
    setTimeout(() => this.previouslyFocused?.focus(), 0);
  }
  }

  backdropClick(event: MouseEvent) {
    if (
      (event.target as HTMLElement).classList.contains('auth-modal-backdrop')
    ) {
      this.modal.close();
    }
  }

  goLogin() {
    const returnUrl = this.payload?.data?.returnUrl || this.router.url;
    this.modal.close();
    this.router.navigate(['/auth'], { queryParams: { returnUrl } });
  }

  goRegister() {
    this.modal.close();
    this.router.navigate(['/auth'], {
      queryParams: {
        returnUrl: this.payload?.data?.returnUrl || this.router.url,
        register: true,
      },
    });
  }

  continueAsGuest() {
    this.modal.close();
    // можеш сюди додати логіку тимчасового гостя
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: Event) {
    const ev = event as KeyboardEvent; // приводимо до KeyboardEvent
    if (this.open) {
      ev.preventDefault();
      this.modal.close();
    }
  }

}
