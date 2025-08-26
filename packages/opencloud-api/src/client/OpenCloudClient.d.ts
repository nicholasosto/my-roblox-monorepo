import type { ApiResponse } from '../types/common';
export declare class OpenCloudClient {
    private apiKey;
    private baseUrl;
    private http;
    constructor(apiKey: string, baseUrl?: string);
    get<T = any>(url: string): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
}
//# sourceMappingURL=OpenCloudClient.d.ts.map