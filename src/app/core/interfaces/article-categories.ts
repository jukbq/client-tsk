import { ArticleTypeResponse } from './article-type';


export interface ArticleCategoriesRequest {
    articleType: ArticleTypeResponse;
    aticleCategoryIndex: number;
    aticleCategoryName: string;
    aticleCategoryDescription: string;
    seoAticleCategoryName: string;
    seoAticleCategoryDescription: string;
    keywords: string;
    image: string;
    additionalImage: string;

}

export interface ArticleCategoriesResponse extends ArticleCategoriesRequest {
    id: number | string;
}
