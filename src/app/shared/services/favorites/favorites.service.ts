import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, arrayUnion, arrayRemove, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  constructor(private firestore: Firestore) { }

  addFavorite(uid: string, recipeId: string) {
    const ref = doc(this.firestore, `users/${uid}`);
    return updateDoc(ref, { favorites: arrayUnion(recipeId) });
  }

  removeFavorite(uid: string, recipeId: string) {
    const ref = doc(this.firestore, `users/${uid}`);
    return updateDoc(ref, { favorites: arrayRemove(recipeId) });
  }

  getFavorites(uid: string): Observable<string[]> {
    const ref = doc(this.firestore, `users/${uid}`);
    return docData(ref).pipe(
      map((data: any) => data?.favorites || [])
    );
  }
}
