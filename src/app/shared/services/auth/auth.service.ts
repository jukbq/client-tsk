import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';


export interface AppUser {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  createdAt?: any;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user$ = new BehaviorSubject<User | null>(null);
  user$ = this._user$.asObservable();

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    // слідкуємо за зміною auth
    onAuthStateChanged(this.auth, (u) => {
      this._user$.next(u);
    });
  }


  // --- Social logins ---
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    await this.saveUserData(credential.user);
    return credential;
  }

  async loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    await this.saveUserData(credential.user);
    return credential;
  }

  // --- Logout ---
  async logout() {
    await signOut(this.auth);
    // після логауту відправляємо на головну
    await this.router.navigateByUrl('/');
  }

  // --- Save basic user data to Firestore if not exists ---
  async saveUserData(user: User) {
    if (!user || !user.uid) return;
    const ref = doc(this.firestore, `users/${user.uid}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const data: AppUser = {
        uid: user.uid,
        displayName: user.displayName || null,
        email: user.email || null,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp()
      };
      await setDoc(ref, data);
    } else {
      // опціонально: можна оновити photo/email якщо змінились
      // await setDoc(ref, { ... }, { merge: true });
    }
  }

  // корисний синхронний геттер на поточного користувача (може бути null)
  get currentUser() {
    return this._user$.value;
  }

  // якийсь раз — отримати поточного користувача один раз (проміс)
  async getCurrentUserOnce(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;
    // дочекаємось першого значущого emission
    return firstValueFrom(this.user$);
  }
}
