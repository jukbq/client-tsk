import { Injectable, TransferState } from '@angular/core';
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  query,
  where
} from '@angular/fire/firestore';
import { from, of, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterServiceService {
  private collection: CollectionReference<DocumentData>;

  constructor(private afs: Firestore, private transferState: TransferState) {
    this.collection = collection(this.afs, 'short-recipes');
  }


  async getRecipesByFilter(filter: { sesonList?: string }): Promise<any[]> {
    const q = query(this.collection);
    const querySnapshot = await getDocs(q);
    const matchedRecipes: any[] = [];

    querySnapshot.forEach((document) => {
      const recipeData = document.data();
      const recipeId = document.id;

      let matchesSeasonse = false;

      if (filter.sesonList && Array.isArray(recipeData['bestSeason'])) {
        for (const season of recipeData['bestSeason']) {
          if (season.list === filter.sesonList) {
            matchesSeasonse = true;
            break;
          }
        }
      }

      if (matchesSeasonse) {
        matchedRecipes.push({ id: recipeId, ...recipeData });
      }
    });


    return matchedRecipes.map(recipe => ({
      id: recipe.id,
      recipeTitle: recipe.recipeTitle,
      mainImage: recipe.mainImage,
      bestSeason: recipe.bestSeason
    }));
  }


  async getRecipesByTagFilter(filter: { tagObject?: string, id: string }): Promise<any[]> {
    if (!filter.tagObject) return [];

    const q = query(this.collection);
    const querySnapshot = await getDocs(q);
    const matchedRecipes: any[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();

      let isMatch = false;
      switch (filter.tagObject) {
        case 'difficultyPreparation':
          isMatch = data['difficultyPreparation']?.list === filter.id;
          break;

        case 'cuisine':
          isMatch = data['cuisine']?.slug === filter.id;
          break;

        case 'region':
          isMatch = data['region']?.slug === filter.id;
          break;

        case 'holiday':
          isMatch = Array.isArray(data['holiday']) && data['holiday'].some(h => h.slug === filter.id);
          break;

        case 'recipeType':
          isMatch = Array.isArray(data['recipeType']) && data['recipeType'].some(r => r.slug === filter.id);
          break;

        default:
          isMatch = false;
      }

      if (isMatch) {
        matchedRecipes.push({ id: doc.id, ...data });
      }
    });

    return matchedRecipes.map(recipe => ({
      id: recipe.id,
      recipeTitle: recipe.recipeTitle,
      mainImage: recipe.mainImage,
      bestSeason: recipe.bestSeason
    }));
  }



  async getCountryTagFilter(slug: string) {
    const cuisineCollection = collection(this.afs, 'cuisine');
    const q = query(cuisineCollection, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Якщо немає документів — повертаємо пустий об'єкт з дефолтами
      return {
        title: '',
        description: '',
        metaTitle: '',
        metaDescription: '',
        image: '',
      };
    }


    const docData = querySnapshot.docs[0].data();

    const descriptionCountry = {
      title: docData['cuisineName'] || '',
      description: docData['cusineDescription'] || '',
      metaTitle: docData['metaTtile'] || '',
      metaDescription: docData['metaDescription'] || '',
      image: docData['image'] || '',
    };

    return descriptionCountry;


  }


  async getRegionTagFilter(slug: string) {
    const cuisineCollection = collection(this.afs, 'region');
    const q = query(cuisineCollection, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Якщо немає документів — повертаємо пустий об'єкт з дефолтами
      return {
        title: '',
        description: '',
        metaTitle: '',
        metaDescription: '',
        image: '',
      };
    }

    const docData = querySnapshot.docs[0].data();

    const descriptionCountry = {
      title: docData['regionName'] || '',
      description: docData['regionDescription'] || '',
      metaTitle: docData['metaTtile'] || '',
      metaDescription: docData['metaDescription'] || '',
      image: docData['regionFlag'] || '',
    };

    return descriptionCountry;


  }

  async getHolidayTagFilter(slug: string) {
    const cuisineCollection = collection(this.afs, 'holidays');
    const q = query(cuisineCollection, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Якщо немає документів — повертаємо пустий об'єкт з дефолтами
      return {
        title: '',
        description: '',
        metaTitle: '',
        metaDescription: '',
        image: '',
      };
    }

    const docData = querySnapshot.docs[0].data();

    const descriptionCountry = {
      title: docData['holidayName'] || '',
      description: docData['holidayDescription'] || '',
      metaTitle: docData['metaTtile'] || '',
      metaDescription: docData['metaDescription'] || '',
      image: docData['image'] || '',
    };

    return descriptionCountry;


  }
  async getrecipeTypeTagFilter(slug: string) {
    const cuisineCollection = collection(this.afs, 'recipe-type');
    const q = query(cuisineCollection, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Якщо немає документів — повертаємо пустий об'єкт з дефолтами
      return {
        title: '',
        description: '',
        metaTitle: '',
        metaDescription: '',
        image: '',
      };
    }

    const docData = querySnapshot.docs[0].data();

    const descriptionCountry = {
      title: docData['recipeTypeName'] || '',
      description: docData['recipeTypeDescription'] || '',
      metaTitle: docData['metaTtile'] || '',
      metaDescription: docData['metaDescription'] || '',
      image: docData['image'] || '',
    };

    return descriptionCountry;


  }



}
