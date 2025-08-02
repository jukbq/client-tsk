import { Injectable } from '@angular/core';
import { collection, collectionData, CollectionReference, doc, docData, DocumentData, Firestore } from '@angular/fire/firestore';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleTypeService {
  private articleTypeCollection!: CollectionReference<DocumentData>;


  constructor(
    private afs: Firestore,
  ) {
    this.articleTypeCollection = collection(this.afs, 'article-type') as CollectionReference<DocumentData>;
  }

  getAll() {
    return collectionData(this.articleTypeCollection, { idField: 'id' });
  }

  getAllarticleTypeLieght() {
    return collectionData(this.articleTypeCollection, { idField: 'id' }).pipe(
      map((articleType: any[]) =>
        articleType.map((articleType) => ({
          id: articleType.id,
          articleTypeName: articleType.articleTypeName,
          image: articleType.image,
        }))
      )
    );
  }

  getArticleTypesByName(id: any) {
    const articleTypeDocumentReference = doc(this.afs, `article-type/${id}`);
    return docData(articleTypeDocumentReference, { idField: 'id' });
  }

}
