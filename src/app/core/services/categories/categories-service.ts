import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  query,
  where,
  Query,
  getDocs,
} from '@angular/fire/firestore';
import { CategoriesDishesResponse } from '../../interfaces/categories -dishes';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private collectionRef: CollectionReference<CategoriesDishesResponse>;

  constructor(private afs: Firestore) {
    this.collectionRef = collection(
      this.afs,
      'categoriesDishes',
    ) as CollectionReference<CategoriesDishesResponse>;
  }

  /**
   * Повертає спрощену версію категорій для списку
   */
  getLightById(
    dishId: string,
  ): Observable<Pick<CategoriesDishesResponse, 'id' | 'categoryName' | 'image'>[]> {
    const q: Query<CategoriesDishesResponse> = query(
      this.collectionRef,
      where('dishes.id', '==', dishId),
    );

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => {
          const cat = doc.data() as CategoriesDishesResponse;

          return {
            id: doc.id,
            categoryName: cat.categoryName,
            image: cat.image,
          };
        }),
      ),
    );
  }

  /**
   * Повертає об'єкт категорії за ID
   */
  getObjectById(id: string): Observable<CategoriesDishesResponse | undefined> {
    const docRef = doc(this.afs, `categoriesDishes/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<CategoriesDishesResponse | undefined>;
  }
}
