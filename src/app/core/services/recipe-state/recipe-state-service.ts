import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RecipeStateService {
   private recipes: any[] = [];
  private categoryId!: string | null;

  setRecipes(recipes: any[]) {
    this.recipes = recipes;
  }

  getRecipes(): any[] {
    return this.recipes;
  }

  setCategoryId(categoryId: any) {
    if (this.categoryId !== categoryId) {
      this.categoryId = categoryId;
      this.clearRecipes()
    }
  }

  getCategoryId(): any {
    return this.categoryId
  }


  clearRecipes() {
    this.recipes = [];
  }
  
}
