import {
  Firestore,
  doc,
  docData
} from '@angular/fire/firestore';

import {
  collection as fsCollection,
  query,
  where,
  CollectionReference,
  DocumentData,
  Query
} from 'firebase/firestore';

import { DishesResponse } from '../../interfaces/dishes';
import { map, Observable } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { collectionData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DishesService {
  private collectionRef: CollectionReference<DishesResponse>;

  constructor(@Inject(Firestore) private afs: Firestore) {
    // Використовуємо collection з firebase/firestore — не @angular/fire
    this.collectionRef = fsCollection(this.afs, 'dishes') as CollectionReference<DishesResponse>;
  }

  /**
   * Повертає всі записи з колекції `dishes`
   */
  getAll(): Observable<DishesResponse[]> {
    const q: Query<DishesResponse> = query(this.collectionRef);
    return collectionData(q, { idField: 'id' }) as Observable<DishesResponse[]>;
  }

  /**
   * Повертає всі записи, але тільки частину даних (оптимізований варіант для списків)
   */
  getAllLight(): Observable<Pick<DishesResponse, 'id' | 'dishesName' | 'image'>[]> {
    const q: Query<DishesResponse> = query(this.collectionRef);
    return collectionData(q, { idField: 'id' }).pipe(
      map((dishes: DishesResponse[]) =>
        dishes.map(dish => ({
          id: dish.id,
          dishesName: dish.dishesName,
          image: dish.image
        }))
      )
    );
  }

  /**
   * Повертає один об'єкт за ID
   */
  getObjectById(id: string): Observable<DishesResponse | undefined> {
    const docRef = doc(this.afs, `dishes/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<DishesResponse | undefined>;
  }



}
