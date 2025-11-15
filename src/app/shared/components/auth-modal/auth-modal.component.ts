import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { ModalPayload, ModalService } from '../../services/modal/modal.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss',
})
export class AuthModalComponent {
  open = false;
  payload: ModalPayload | null = null;
  private sub: Subscription | null = null;
  private previouslyFocused: HTMLElement | null = null;

  constructor(
    public modal: ModalService,
    private elRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private router: Router
  ) {}

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
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    this.open = true;
    this.renderer.addClass(document.body, 'no-scroll');
  }

  private hide() {
    this.open = false;
    this.payload = null;
    this.renderer.removeClass(document.body, 'no-scroll');
    setTimeout(() => this.previouslyFocused?.focus(), 0);
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
