import { Injectable, makeStateKey, TransferState } from '@angular/core';
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  DocumentData,
  Firestore,
  getCountFromServer,
  limit,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import { combineLatest, map, Observable, of } from 'rxjs';
import { ShortRecipesResponse } from '../../interfaces/short-recipes';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private collection: CollectionReference<DocumentData>;

  constructor(private afs: Firestore, private transferState: TransferState) {
    this.collection = collection(this.afs, 'short-recipes');
  }

  getAll(): Observable<ShortRecipesResponse[]> {
    return collectionData(this.collection, { idField: 'id' }) as Observable<ShortRecipesResponse[]>;
  }

   async getRecipeCount(dishesID: string): Promise<number> {
    const q = query(this.collection, where('dishes.id', '==', dishesID));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

    //Отримання улюдениз рецептів крпмстувача
  getRecipesByIds(ids: string[]): Observable<any[]> {
    if (!ids || ids.length === 0) return of([]);

    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 10) {
      chunks.push(ids.slice(i, i + 10));
    }

    const observables = chunks.map((chunk) => {
      const q = query(this.collection, where('id', 'in', chunk));
      return collectionData(q, { idField: 'id' }).pipe(
        map((recipes: any[]) =>
          recipes.map((r) => ({
            id: r.id,
            recipeTitle: r.recipeTitle,
            mainImage: r.mainImage,
            createdAt: r.createdAt,
          }))
        )
      );
    });

    return combineLatest(observables).pipe(map((arrays) => arrays.flat()));
  }


  //отримання останніх рецептів

  getRecentRecipes(limitCount: number = 6): Observable<ShortRecipesResponse[]> {
    const DATA_KEY = makeStateKey<ShortRecipesResponse[]>(
      `recentRecipes-${limitCount}`
    );

    if (this.transferState.hasKey(DATA_KEY)) {
      return of(this.transferState.get(DATA_KEY, []));
    }

    const queryRef = query(
      this.collection,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return collectionData(queryRef, { idField: 'id' }).pipe(
      map((recipes: DocumentData[]) =>
        recipes.map((recipe: any): any => ({
          id: recipe.id,
          recipeTitle: recipe.recipeTitle,
          mainImage: recipe.mainImage,
          createdAt: recipe.createdAt, // Необхідно, якщо потрібно зберігати інформацію про дату
        }))
      )
    );
  }


    getRecipeLightById(categoryId: string): Observable<any[]> {
    const queryRef = query(
      this.collection,
      where('categoriesDishes.id', '==', categoryId)
    );
    return collectionData(queryRef, { idField: 'id' }).pipe(
      map((recipes) =>
        recipes.map((recipe: any) => ({
          id: recipe.id,
          recipeTitle: recipe.recipeTitle,
          mainImage: recipe.mainImage,
          cuisine: recipe.cuisine,
          region: recipe.region,
          ingredients: (recipe.ingredients || []).flatMap((group: any) =>
            (group.group || []).map((item: any) => ({
              name:
                item.selectedProduct?.productsName?.trim() ||
                'Невідомий інгредієнт',
              id: item.selectedProduct?.id || null,
            }))
          ),
        }))
      )
    );
  }


    getRandomRecipesByDishesID(
    dishesid: string,
    count: number
  ): Observable<ShortRecipesResponse[]> {
    const queryRef = query(
      this.collection,
      where('dishes.id', '==', dishesid),
      limit(count)
    );

    return collectionData(queryRef, { idField: 'id' }).pipe(
      map((recipes: DocumentData[]) =>
        recipes.map((recipe: any): any => ({
          id: recipe.id,
          recipeTitle: recipe.recipeTitle,
          recipeLink: recipe.recipeLink,
          mainImage: recipe.mainImage,
        }))
      ),
      map((recipes: ShortRecipesResponse[]) =>
        recipes.sort(() => 0.5 - Math.random()).slice(0, count)
      )
    );
  }

    getRecipeByID(id: string): Observable<any> {
    const docRef = doc(this.afs, `short-recipes/${id}`);
    return docData(docRef, {
      idField: 'id',
    }) as Observable<ShortRecipesResponse>;
  }

    //Конвертор інгридієнтів
  formatIngredients(ingredientsGroup: any[]): any[] {
    return ingredientsGroup.map((group) => {
      return {
        name: group.name || '', // зберігаємо назву групи, якщо є
        group: group.group.map((item: any) => {
          const productsImages = item.selectedProduct.productsImages
            ? `${item.selectedProduct.productsImages}`
            : '';
          const name =
            item.selectedProduct?.productsName?.trim() || 'Інгредієнт';
          const amount = item.amount ? `${item.amount}` : '';
          const unit = item.unitsMeasure ? `${item.unitsMeasure}` : '';
          const notes = item.notes ? `(${item.notes})` : '';

          // Збираємо текстову строку
          const parts = [name, amount, unit, notes].filter(Boolean);
          const text = parts.join(' ');

          return {
            image: productsImages,
            text: text,
            recipeID: item.selectedProduct.recipeID || null,
          };
        }),
      };
    });
  }

    // Приймаємо масив, який складається з об'єктів з групами інгредієнтів
  findRecipesWithIds(
    data: { group: any[]; name: string }[]
  ): { recipeID: string; recipeName: string; recipeImage: string }[] {
    const recipes: {
      recipeID: string;
      recipeName: string;
      recipeImage: string;
    }[] = [];

    data.forEach((item) => {
      item.group.forEach((ingredient) => {
        const prod = ingredient.selectedProduct;
        if (prod && prod.recipeID) {
          recipes.push({
            recipeID: prod.recipeID,
            recipeName: prod.productsName.trim(),
            recipeImage: prod.recipeImage,
          });
        }
      });
    });

    // Видаляємо дублі за recipeID, якщо треба
    const uniqueRecipes = recipes.filter(
      (rec, index, arr) =>
        arr.findIndex((r) => r.recipeID === rec.recipeID) === index
    );

    return uniqueRecipes;
  }

    // Приймаємо масив, який складається з об'єктів з групами інгредієнтів
  findArticlesWithIds(
    data: { group: any[]; name: string }[]
  ): { articleID: string; articleName: string; articleImage: string }[] {
    const recipes: {
      articleID: string;
      articleName: string;
      articleImage: string;
    }[] = [];


    

    data.forEach((item) => {
      item.group.forEach((ingredient) => {
        const prod = ingredient.selectedProduct;
        if (prod && prod.articleID) {
          recipes.push({
            articleID: prod.articleID,
            articleName: prod.articleName.trim(),
            articleImage: prod.articleImage,
          });
        }
      });
    });

    // Видаляємо дублі за articleID, якщо треба
    const uniqueArticle = recipes.filter(
      (rec, index, arr) =>
        arr.findIndex((r) => r.articleID === rec.articleID) === index
    );

    return uniqueArticle;
  }


}
