import { CategoriesDishesResponse } from "./categories -dishes";
import { СuisineResponse } from "./cuisine";
import { DishesResponse } from "./dishes";
import { ProductsRequest } from "./products";

export interface RecipeStep {
    setepNumber: number;
    stepName: string;
    stepDescription: string;
    image: string;
    stepVideo: string;
    stepNotes: string;
}

export interface MethodCooking {
    methodCookingName: string;
}

export interface DifficultyPreparation {
    list: string;
    linamest: string;
}

export interface RecipesRequest {
    //Сторінка 1
    dishes: DishesResponse;
    categoriesDishes: CategoriesDishesResponse;
    recipeKeys: CategoriesDishesResponse;
    cuisine: СuisineResponse;
    autor: string;
    methodCooking: MethodCooking[];
    tools: string[];
    difficultyPreparation: DifficultyPreparation[];
    bestSeason: string;
    

    //Сторінка 2
    recipeTitle: string;
    recipeSubtitles: string;
    descriptionRecipe: string;
    mainImage: string;
    focusKeyword: string;
  
    //Сторінка 3
    numberServings: number;
    quantityIngredients: number;
    unitsMeasure: number | string;
    ingredients: ProductsRequest;
    notes: string;

    //Сторінка 4
    steps: RecipeStep[];

}
export interface RecipesResponse extends RecipesRequest {
    id: number | string;
}