import { Injectable } from '@angular/core';
import { collection, collectionData, CollectionReference, doc, docData, DocumentData, Firestore, query, where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArticleCategoriesService {
   private articleCategoriesCollection!: CollectionReference<DocumentData>;


  constructor(
    private afs: Firestore,
  ) {
    this.articleCategoriesCollection = collection(this.afs, 'article-category');
  }


  getAll() {
    return collectionData(this.articleCategoriesCollection, { idField: 'id' });
  }

  getArticleCategoryByTypeID(TypeID: string) {
    const queryRef = query(
      this.articleCategoriesCollection,
      where('articleType.id', '==', TypeID)
    );
    return collectionData(queryRef, { idField: 'id' }).pipe(
      map((articlesCategory: any[]) =>
        articlesCategory.map((articlesCategory) => ({
          id: articlesCategory.id,
          aticleCategoryName: articlesCategory.aticleCategoryName,
          image: articlesCategory.image,
        }))
      )
    );
  }


  getObjectById(id: string): Observable<any | undefined> {

    const docRef = doc(this.afs, `article-category/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<any | undefined>;
  }
  
}
