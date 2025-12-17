import { ArticleCategoriesResponse } from "./article-categories";
import { ArticleTypeResponse } from "./article-type";
import { ProductCategoryResponse } from "./productCategory";
import { ProductsRequest, ProductsResponse } from "./products";

export interface ArticlePAgesResponse {
    slug: string | number;
    articleType: ArticleTypeResponse;
    articleCategory: ArticleCategoriesResponse
    products: ProductsResponse
    articleName: string;
    mainImage: string;
    seoName: string;
    seoDescription: string;
    keywords: string;
    articleContent: [];
}

export interface ArticlePAgesRequest extends ArticlePAgesResponse {
    id: number | string;
}