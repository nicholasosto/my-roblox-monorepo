export interface OperationStatus {
    path: string;
    done: boolean;
    response?: {
        '@type': string;
        [key: string]: any;
    };
    error?: {
        code: number;
        message: string;
        details?: any[];
    };
}
export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any[];
}
export interface PaginationOptions {
    pageToken?: string;
    maxPageSize?: number;
}
export interface PaginatedResponse<T> {
    items: T[];
    nextPageToken?: string;
}
//# sourceMappingURL=common.d.ts.map