export interface MethodCookinRequest {
    methodCookinName: string;
    methodCookinLink: string;

}
export interface MethodCookinResponse extends MethodCookinRequest {
    id: number | string;
}