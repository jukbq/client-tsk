import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData
} from '@angular/fire/firestore';
import { ArticleTypeResponse } from '../../interfaces/article-type';
import { map, Observable } from 'rxjs';




@Injectable({
  providedIn: 'root',
})
export class ArticleTypeService {
   private afs = inject(Firestore); // inject замість constructor
  private collectionRef: CollectionReference<ArticleTypeResponse> =
    collection(this.afs, 'article-type') as CollectionReference<ArticleTypeResponse>;

  /** Повертає всі типи статей */
  getAll(): Observable<ArticleTypeResponse[]> {
    return collectionData(this.collectionRef, { idField: 'id' }) as Observable<ArticleTypeResponse[]>;
  }

  /** Легка версія для списку */
  getAllLight(): Observable<Pick<ArticleTypeResponse, 'id' | 'articleTypeName' | 'image'>[]> {
    return collectionData(this.collectionRef, { idField: 'id' }).pipe(
      map(types => types.map(type => ({
        id: type.id,
        articleTypeName: type.articleTypeName,
        image: type.image
      })))
    );
  }

  /** Один об’єкт за ID */
  getById(id: string): Observable<ArticleTypeResponse | undefined> {
    const docRef = doc(this.afs, `article-type/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<ArticleTypeResponse | undefined>;
  }

  /** Для резолвера: по ID повертає Observable */
  getArticleTypesByName(id: string): Observable<ArticleTypeResponse | undefined> {
    const docRef = doc(this.afs, `article-type/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<ArticleTypeResponse | undefined>;
  }
}
