import { inject, Injectable, makeStateKey, TransferState } from '@angular/core';
import { collection, Firestore, getDocs, query, QueryConstraint, where } from '@angular/fire/firestore';

// Типізація для покращення стабільності
interface RecipeFilter {
  sesonList?: string;
  tagObject?: 'difficultyPreparation' | 'cuisine' | 'region' | 'holiday' | 'recipeType';
  id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilterSearch {
  
private readonly firestore = inject(Firestore);
  private readonly transferState = inject(TransferState);
  private readonly recipesCollection = collection(this.firestore, 'short-recipes');

  /**
   * Універсальний метод для отримання даних з кешуванням для SSR
   */
  private async getWithTransferState<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const STATE_KEY = makeStateKey<T>(key);
    
    // Якщо дані вже є в TransferState (прийшли з сервера на клієнт)
    if (this.transferState.hasKey(STATE_KEY)) {
      const data = this.transferState.get(STATE_KEY, null as T);
      this.transferState.remove(STATE_KEY); // Очищуємо після використання
      return data as T;
    }

    // Якщо даних немає, робимо запит
    const result = await fetcher();

    // Зберігаємо в TransferState, якщо ми на сервері
    this.transferState.set(STATE_KEY, result);
    return result;
  }

  /**
   * Отримання рецептів за сезоном
   * Оптимізовано: Firestore вміє шукати в масивах через array-contains-any або за полем
   */
  async getRecipesByFilter(filter: { sesonList?: string }): Promise<any[]> {
    const cacheKey = `recipes-season-${filter.sesonList}`;

    return this.getWithTransferState(cacheKey, async () => {
      // ПРИМІТКА: Якщо структура в БД дозволяє, краще використовувати where()
      // Якщо bestSeason — це масив об'єктів [{list: 'winter'}], Firestore запит буде складним.
      // Залишаю логіку фільтрації, але через getDocs
      const q = query(this.recipesCollection);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(recipe => 
          filter.sesonList && 
          Array.isArray(recipe.bestSeason) && 
          recipe.bestSeason.some((s: any) => s.list === filter.sesonList)
        )
        .map(recipe => ({
          id: recipe.id,
          recipeTitle: recipe.recipeTitle,
          mainImage: recipe.mainImage,
          bestSeason: recipe.bestSeason
        }));
    });
  }

  /**
   * Отримання рецептів за тегами (Кухня, Складність тощо)
   */
  async getRecipesByTagFilter(filter: RecipeFilter): Promise<any[]> {
    if (!filter.tagObject || !filter.id) return [];
    
    const cacheKey = `recipes-tag-${filter.tagObject}-${filter.id}`;

    return this.getWithTransferState(cacheKey, async () => {
      const constraints: QueryConstraint[] = [];

      // Оптимізація: Використовуємо потужність Firestore замість фільтрації в пам'яті
      if (filter.tagObject === 'difficultyPreparation') {
        constraints.push(where('difficultyPreparation.list', '==', filter.id));
      } else if (filter.tagObject === 'cuisine') {
        constraints.push(where('cuisine.slug', '==', filter.id));
      } else if (filter.tagObject === 'region') {
        constraints.push(where('region.slug', '==', filter.id));
      }
      // Для масивів (holiday/recipeType) використовуємо array-contains (якщо в БД масив slug-ів)
      // Або вичитуємо все, якщо структура занадто вкладена

      const q = query(this.recipesCollection, ...constraints);
      const querySnapshot = await getDocs(q);

      let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      // Додаткова фільтрація для складних масивів об'єктів, які не бере index Firestore
      if (filter.tagObject === 'holiday' || filter.tagObject === 'recipeType') {
        results = results.filter(data => 
          Array.isArray(data[filter.tagObject!]) && 
          data[filter.tagObject!].some((item: any) => item.slug === filter.id)
        );
      }

      return results.map(recipe => ({
        id: recipe.id,
        recipeTitle: recipe.recipeTitle,
        mainImage: recipe.mainImage,
        bestSeason: recipe.bestSeason
      }));
    });
  }

  /**
   * Універсальний метод для отримання мета-даних категорій
   */
  async getCategoryMetadata(collectionName: string, slug: string, mapping: Record<string, string>) {
    const cacheKey = `meta-${collectionName}-${slug}`;

    return this.getWithTransferState(cacheKey, async () => {
      const colRef = collection(this.firestore, collectionName);
      const q = query(colRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return null;

      const data = querySnapshot.docs[0].data();
      return {
        title: data[mapping['title']] || '',
        description: data[mapping['description']] || '',
        metaTitle: data['metaTtile'] || '', // збережено ваш typo metaTtile
        metaDescription: data['metaDescription'] || '',
        image: data[mapping['image']] || '',
      };
    });
  }

  // Спрощені виклики мета-даних
  async getCountryTagFilter(slug: string) {
    return this.getCategoryMetadata('cuisine', slug, {
      title: 'cuisineName', description: 'cusineDescription', image: 'image'
    });
  }

  async getRegionTagFilter(slug: string) {
    return this.getCategoryMetadata('region', slug, {
      title: 'regionName', description: 'regionDescription', image: 'regionFlag'
    });
  }

  async getHolidayTagFilter(slug: string) {
    return this.getCategoryMetadata('holidays', slug, {
      title: 'holidayName', description: 'holidayDescription', image: 'image'
    });
  }

  async getrecipeTypeTagFilter(slug: string) {
    return this.getCategoryMetadata('recipe-type', slug, {
      title: 'recipeTypeName', description: 'recipeTypeDescription', image: 'image'
    });
  }
}