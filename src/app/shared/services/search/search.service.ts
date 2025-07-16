import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { collection, collectionData, CollectionReference, DocumentData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Fuse from 'fuse.js';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private collection!: CollectionReference<DocumentData>;

  constructor(private afs: Firestore) {
    this.collection = collection(this.afs, 'short-recipes');
  }

  getAll(): Observable<any[]> {
    return collectionData(this.collection, { idField: 'id' });
  }

  searchRecipes(query: string): Observable<any[]> {

    const platformId = inject(PLATFORM_ID);
    if (!isPlatformBrowser(platformId)) {
      return new Observable((observer) => {
        observer.next([]); // або можна throwError(() => new Error('SSR can’t search'));
        observer.complete();
      });
    }

    return this.getAll().pipe(
      map((recipes: any[]) => {
        const fuse = new Fuse(recipes, {
          keys: ['recipeTitle', 'descriptionRecipe'],
          includeScore: true,
          threshold: 0.3,
        });
        const result = fuse.search(query).map(r => r.item);
        return result.map(recipe => ({
          id: recipe.id,
          recipeTitle: recipe.recipeTitle,
          recipeLink: recipe.recipeLink,
          descriptionRecipe: recipe.descriptionRecipe,
          mainImage: recipe.mainImage,
          createdAt: recipe.createdAt,
        }));
      })
    );
  }
}
