
export interface DishesFaqItem {
  question: string;
  answer: string;
}

export interface DishesRequest {
  dishesindex: number;
  slug: string;
  smallDishesName: string;
  dishesName: string;
  dishDescription: string;
  seoName: string;
  seoDescription: string;
  image: string;
  additionalImage: string;
  numberСategories: number;

  faq?: DishesFaqItem[]; 
}
export interface DishesResponse extends DishesRequest {
  id: number | string;
}