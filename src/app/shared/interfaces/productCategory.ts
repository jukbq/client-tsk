export interface ProductCategoryRequest {
    productCategoryName: string,
    productCategoryLink: string,
}

export interface ProductCategoryResponse extends ProductCategoryRequest {
    id: number | string;
}