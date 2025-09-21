import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  user$: Observable<User | null>;
  userDoc$: any;  // те саме для userDoc$

  constructor(private auth: AuthService, private firestore: Firestore) {
    // ініціалізація вже після того як Angular «вколов» сервіси
    this.user$ = this.auth.user$;



    this.userDoc$ = this.auth.user$.pipe(
      switchMap(u => {
        if (!u) return of(null);
        const ref = doc(this.firestore, `users/${u.uid}`);
        return getDoc(ref).then(snap => snap.exists() ? snap.data() : null);
      })
    );
  }

  async logout() {
    await this.auth.logout();
  }
}
