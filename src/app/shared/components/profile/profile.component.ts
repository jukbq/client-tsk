import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { switchMap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '@angular/fire/auth';


interface MenuItem {
  id: string;
  name: string;
  subItems?: MenuItem[];
}

const LIST: MenuItem[] = [
  { id: 'user-data', name: 'Моя комора' },
/*   { id: 'favorites', name: 'Смаколики до душі' },
  { id: 'drafts', name: 'Недоварені записи' },
  { id: 'settings', name: 'Скриня налаштувань' }, */
];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  list: MenuItem[] = LIST;
  activeItem: number | undefined = 0;

  user$: Observable<User | null>;
  userDoc$: any;

  constructor(private auth: AuthService, private firestore: Firestore) {
    this.user$ = this.auth.user$;

    this.userDoc$ = this.auth.user$.pipe(
      switchMap((u) => {
        if (!u) return of(null);
        const ref = doc(this.firestore, `users/${u.uid}`);
        return from(getDoc(ref)).pipe(
          switchMap((snap) => of(snap.exists() ? snap.data() : null))
        );
      })
    );
  }
  ngOnInit() {
    console.log(this.userDoc$);
  }

  onSelectItem(i: number): void {
    // Якщо клікнули на активний пункт — закриваємо, інакше відкриваємо його
    this.activeItem = this.activeItem === i ? undefined : i;
  }
  async logout() {
    await this.auth.logout();
  }
}
