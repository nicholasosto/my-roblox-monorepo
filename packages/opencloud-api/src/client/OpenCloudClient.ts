import axios, { AxiosInstance } from 'axios';
import type { ApiResponse } from '../types/common';

export class OpenCloudClient {
  private http: AxiosInstance;

  constructor(private apiKey: string, private baseUrl = 'https://apis.roblox.com') {
    this.http = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      validateStatus: () => true
    });
  }

  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    const res = await this.http.get(url);
    return {
      data: res.data,
      status: res.status,
      statusText: res.statusText,
      headers: res.headers as Record<string, string>
    };
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const res = await this.http.post(url, data, config);
    return {
      data: res.data,
      status: res.status,
      statusText: res.statusText,
      headers: res.headers as Record<string, string>
    };
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const res = await this.http.patch(url, data, config);
    return {
      data: res.data,
      status: res.status,
      statusText: res.statusText,
      headers: res.headers as Record<string, string>
    };
  }
}
