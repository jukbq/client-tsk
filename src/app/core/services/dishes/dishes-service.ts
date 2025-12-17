import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, collection, collectionData, doc, docData } from '@angular/fire/firestore';
import { DishesResponse } from '../../interfaces/dishes';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class DishesService {
  private collectionRef: CollectionReference<DishesResponse>;

  constructor(private afs: Firestore) {
    this.collectionRef = collection(this.afs, 'dishes') as CollectionReference<DishesResponse>;
  }


    /**
   * Повертає всі записи з колекції `dishes`
   */
  getAll(): Observable<DishesResponse[]> {
    return collectionData(this.collectionRef, { idField: 'id' }) as Observable<DishesResponse[]>;
  }

  /**
   * Повертає спрощений список для меню або списків (id, назва, картинка, seoName)
   */
  getAllLight(): Observable<Pick<DishesResponse, 'id' | 'dishesName' | 'image' | 'seoName'>[]> {
    return collectionData(this.collectionRef, { idField: 'id' }).pipe(
      map((dishes: DishesResponse[]) =>
        dishes.map(dish => ({
          id: dish.id,
          dishesName: dish.dishesName,
          image: dish.image,
          seoName: dish.seoName
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
