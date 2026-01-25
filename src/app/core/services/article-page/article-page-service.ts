import { inject, Injectable } from '@angular/core';
import { 
  collection, 
  collectionData, 
  CollectionReference, 
  doc, 
  docData, 
  DocumentData, 
  Firestore, 
  query, 
  where,
  Query // Імпортуємо ВСЕ з одного місця
} from '@angular/fire/firestore'; 
import { map, Observable } from 'rxjs';
import { ShortRecipesResponse } from '../../interfaces/short-recipes';

@Injectable({
  providedIn: 'root',
})
export class ArticlePageService {
  private readonly afs = inject(Firestore);
  private readonly articleCollection: CollectionReference<DocumentData>;


  constructor() {
    this.articleCollection = collection(this.afs, 'article-pages');
  }

  getArticleLightById(categoryId: string): Observable<any[]> {
    // 1. Переконуємося, що фільтр йде саме по полю всередині об'єкта articleCategory
    // 2. Використовуємо query та where з головного пакета
    const queryRef = query(
      this.articleCollection, 
      where('articleCategory.id', '==', categoryId)
    );

    return collectionData(queryRef, { idField: 'id' }).pipe(
      map((articles: any[]) => {
        // Додамо лог, щоб побачити, що прилітає з бази (тільки для дебагу)
       
        return articles.map((article) => ({
          id: article.slug || article.id, 
          articleName: article.articleName,
          mainImage: article.mainImage,
        }));
      })
    );
  }

  getRecipeByID(id: string): Observable<any> {
    const docRef = doc(this.afs, `article-pages/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<ShortRecipesResponse>;
  }
}
