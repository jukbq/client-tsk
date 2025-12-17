import { ProductCategoryResponse } from "./productCategory";

export interface ProductsRequest {
    productsCategory: ProductCategoryResponse;
    productsName: string;
    productsLink: string;
    productsCalories: number;
    productsImages: string;
}
export interface ProductsResponse extends ProductsRequest {
    id: number | string;
}