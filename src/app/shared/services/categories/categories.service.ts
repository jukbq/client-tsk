import { Injectable } from '@angular/core';
import { collection, collectionData, CollectionReference, doc, docData, DocumentData, Firestore, query, where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { CategoriesDishesResponse } from '../../interfaces/categories -dishes';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private collection: CollectionReference<DocumentData>;


  constructor(private afs: Firestore) {
    this.collection = collection(this.afs, 'categoriesDishes')
  }


  getLightById(id: string): Observable<any[]> {
    const queryRef = query(
      this.collection,
      where('dishes.id', '==', id)
    );

    return collectionData(queryRef, { idField: 'id' }).pipe(
      map((categories: any[]) =>
        categories.map((categories) => ({
          id: categories.id,
          categoryName: categories.categoryName,
          image: categories.image
        }))
      )
    );
  }


  getObjectById(id: string): Observable<CategoriesDishesResponse | undefined> {
    const docRef = doc(this.afs, `categoriesDishes/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<CategoriesDishesResponse | undefined>;
  }

}
