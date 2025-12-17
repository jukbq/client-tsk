export interface СuisineRequest {
    cuisineName: string;
    cuisineLink: string;
    image: string;
}
export interface СuisineResponse extends СuisineRequest {
    id: number | string;
}