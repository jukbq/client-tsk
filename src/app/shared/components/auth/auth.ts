import { Component, inject, signal, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth-service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // 🔴 КЛЮЧОВЕ: auth сторінка не для індексу
    this.meta.updateTag({
      name: 'robots',
      content: 'noindex, nofollow',
    });

    // Title — чисто для UX
    this.title.setTitle('Вхід | Синій Кіт');
  }

  async loginWithGoogle() {
    this.error.set(null);
    this.loading.set(true);

    try {
      await this.auth.loginWithGoogle();
      await this.afterLoginRedirect();
    } catch (err: any) {
      console.error('Google login error', err);
      this.error.set(err?.message || 'Помилка входу через Google');
    } finally {
      this.loading.set(false);
    }
  }

  private async afterLoginRedirect() {
    const returnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl') || '/profile';

    await this.router.navigateByUrl(returnUrl);
  }
}
