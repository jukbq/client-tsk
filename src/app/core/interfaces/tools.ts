export interface ToolsRequest {
    toolsName: string;
    toolsLink: string;
    image: string;
}
export interface ToolsResponse extends ToolsRequest {
    id: number | string;
}