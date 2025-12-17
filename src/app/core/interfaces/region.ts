import { СuisineResponse } from "./cuisine";


export interface RegionRequest {
    country: СuisineResponse;
    regionName: string;
    regionFlag: string;
}
export interface RegionResponse extends RegionRequest {
    id: number | string;
}