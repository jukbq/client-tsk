import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { collection, collectionData, CollectionReference, DocumentData, Firestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import Fuse from 'fuse.js';
import { isPlatformBrowser } from '@angular/common';

export interface ShortRecipe {
  id: string;
  recipeTitle: string;
  recipeLink: string;
  descriptionRecipe: string;
  mainImage: string;
  createdAt: any;
}


@Injectable({
  providedIn: 'root',
})
export class SearchService {

  private collection: CollectionReference<DocumentData>;
  private isBrowser: boolean;

   constructor(
    private afs: Firestore,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.collection = collection(this.afs, 'short-recipes');
  }

   getAll(): Observable<ShortRecipe[]> {
    return collectionData(this.collection, { idField: 'id' }) as Observable<ShortRecipe[]>;
  }

  searchRecipes(query: string): Observable<ShortRecipe[]> {
    if (!this.isBrowser || !query.trim()) {
      // Якщо SSR або порожній запит — повертаємо порожній масив
      return of([]);
    }

    return this.getAll().pipe(
      map((recipes: ShortRecipe[]) => {
        const fuse = new Fuse(recipes, {
          keys: ['recipeTitle', 'descriptionRecipe'],
          includeScore: true,
          threshold: 0.3,
        });
        const result = fuse.search(query).map(r => r.item);

        // Мапимо тільки потрібні поля
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
