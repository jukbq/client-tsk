import { Injectable, TransferState } from '@angular/core';
import { collection, collectionData, CollectionReference, doc, docData, DocumentData, Firestore, query, where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { ShortRecipesResponse } from '../../../interfaces/short-recipes';

@Injectable({
  providedIn: 'root'
})
export class ArticlePageService {
  private collection: CollectionReference<DocumentData>;

  constructor(private afs: Firestore, private transferState: TransferState) {
    this.collection = collection(this.afs, 'article-pages');
  }

  getAll(): Observable<ShortRecipesResponse[]> {
    return collectionData(this.collection, { idField: 'id' }) as Observable<ShortRecipesResponse[]>;
  }


  getArticleLightById(categoryId: string): Observable<any[]> {
    const queryRef = query(this.collection, where('articleCategory.id', '==', categoryId));
    return collectionData(queryRef, { idField: 'id' }).pipe(
      map(article =>
        article.map((article: any) => ({
          id: article.slug,
          articleName: article.articleName,
          mainImage: article.mainImage,
        }))
      )
    );
  }


  getRecipeByID(id: string): Observable<any> {
    const docRef = doc(this.afs, `article-pages/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<ShortRecipesResponse>;

  }

}
