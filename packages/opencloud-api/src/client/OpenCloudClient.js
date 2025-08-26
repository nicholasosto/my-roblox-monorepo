import axios from 'axios';
export class OpenCloudClient {
    constructor(apiKey, baseUrl = 'https://apis.roblox.com') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.http = axios.create({
            baseURL: baseUrl,
            headers: {
                Authorization: `Bearer ${apiKey}`
            },
            validateStatus: () => true
        });
    }
    async get(url) {
        const res = await this.http.get(url);
        return {
            data: res.data,
            status: res.status,
            statusText: res.statusText,
            headers: res.headers
        };
    }
    async post(url, data, config) {
        const res = await this.http.post(url, data, config);
        return {
            data: res.data,
            status: res.status,
            statusText: res.statusText,
            headers: res.headers
        };
    }
    async patch(url, data, config) {
        const res = await this.http.patch(url, data, config);
        return {
            data: res.data,
            status: res.status,
            statusText: res.statusText,
            headers: res.headers
        };
    }
}
