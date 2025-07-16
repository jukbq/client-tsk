import { DishesResponse } from "./dishes";

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
}

export interface CategoriesDishesResponse extends CategoriesDishesRequest {
    id: number | string;
}