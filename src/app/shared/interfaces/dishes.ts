export interface DishesRequest {
  dishesindex: number;
  slug: string;
  smallDishesName: string;
  dishesName: string;
  dishDescription: string;
  seoName: string;
  seoDescription: string;
  keywords: string;
  image: string;
  additionalImage: string;
  numberСategories: number;
}
export interface DishesResponse extends DishesRequest {
  id: number | string;
}