import FormData from 'form-data';
export class AssetsAPI {
    constructor(client) {
        this.client = client;
    }
    /**
     * Upload a new asset to Roblox
     */
    async createAsset(request) {
        const formData = new FormData();
        // Add request metadata
        formData.append('request', JSON.stringify({
            assetType: request.assetType,
            displayName: request.displayName,
            description: request.description,
            creationContext: {
                creator: request.creator
            }
        }));
        // Add file content
        formData.append('fileContent', request.fileContent, {
            filename: request.fileName,
            contentType: request.contentType
        });
        const response = await this.client.post('/assets/v1/assets', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
    /**
     * Update an existing asset
     */
    async updateAsset(assetId, request) {
        const formData = new FormData();
        formData.append('request', JSON.stringify({
            assetType: request.assetType,
            assetId: assetId,
            creationContext: request.creationContext
        }));
        formData.append('fileContent', request.fileContent);
        const response = await this.client.patch(`/assets/v1/assets/${assetId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
    /**
     * Check the status of an asset operation
     */
    async getOperationStatus(operationId) {
        const response = await this.client.get(`/assets/v1/operations/${operationId}`);
        return response.data;
    }
    /**
     * Wait for an operation to complete with polling
     */
    async waitForOperation(operationId, pollInterval = 2000, maxAttempts = 30) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const status = await this.getOperationStatus(operationId);
            if (status.done) {
                return status;
            }
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        throw new Error(`Operation ${operationId} did not complete within ${maxAttempts} attempts`);
    }
    /**
     * Helper method to upload and wait for completion
     */
    async uploadAssetAndWait(request) {
        const operation = await this.createAsset(request);
        const operationId = operation.path.split('/').pop();
        if (!operationId) {
            throw new Error('Invalid operation response');
        }
        return this.waitForOperation(operationId);
    }
}
