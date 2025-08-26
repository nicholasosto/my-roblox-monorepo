import { OpenCloudClient } from '../client/OpenCloudClient';
import { CreateAssetRequest, UpdateAssetRequest, AssetOperationResponse } from '../types/assets';
import { OperationStatus } from '../types/common';
export declare class AssetsAPI {
    private client;
    constructor(client: OpenCloudClient);
    /**
     * Upload a new asset to Roblox
     */
    createAsset(request: CreateAssetRequest): Promise<AssetOperationResponse>;
    /**
     * Update an existing asset
     */
    updateAsset(assetId: string, request: UpdateAssetRequest): Promise<AssetOperationResponse>;
    /**
     * Check the status of an asset operation
     */
    getOperationStatus(operationId: string): Promise<OperationStatus>;
    /**
     * Wait for an operation to complete with polling
     */
    waitForOperation(operationId: string, pollInterval?: number, maxAttempts?: number): Promise<OperationStatus>;
    /**
     * Helper method to upload and wait for completion
     */
    uploadAssetAndWait(request: CreateAssetRequest): Promise<OperationStatus>;
}
//# sourceMappingURL=assets.d.ts.map