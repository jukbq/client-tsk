import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-auth',
  imports: [RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
// Використовуємо inject замість конструктора
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  

  // Створюємо сигнали для стану
  loading = signal<boolean>(false);
  error = signal<string | null>(null);


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
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/profile';
    await this.router.navigateByUrl(returnUrl);
  }

  


}
