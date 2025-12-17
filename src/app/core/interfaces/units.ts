export interface UnitRequest {
    unitName: string;
    unitLink: string;
}
export interface UnitResponse extends UnitRequest {
    id: number | string;
}