import { DishesResponse } from "./dishes";


export interface CategoryFaqItem {
  question: string;
  answer: string;
}

export interface CategoriesDishesRequest {
    dishes: DishesResponse,
    dishesName: DishesResponse,
    dishDescription: DishesResponse;
    seoName: DishesResponse;
    seoDescription: DishesResponse;
    dishesImage: DishesResponse;
    categoryIndex: number,
    categoryName: string,
    categoryDescription: string,
    seoCategoryName: string,
    seoCategoryDescription: string,
    image: string,
    verticalImage: string,

      faq?: CategoryFaqItem[]; 
}

export interface CategoriesDishesResponse extends CategoriesDishesRequest {
    id: number | string;
}