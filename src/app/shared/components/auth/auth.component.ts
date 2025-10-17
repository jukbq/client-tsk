import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  loading = false;
  error: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }


  // клік по Google
  async loginWithGoogle() {
    this.error = null;
    this.loading = true;
    try {
      await this.auth.loginWithGoogle();
      await this.afterLoginRedirect();
    } catch (err: any) {
      console.error('Google login error', err);
      this.error = err?.message || 'Помилка входу через Google';
    } finally {
      this.loading = false;
    }
  }



  // редирект після успішного логіну
  private async afterLoginRedirect() {
    // якщо був returnUrl -> туди, інакше /profile
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/profile';
    await this.router.navigateByUrl(returnUrl);
  }
}
