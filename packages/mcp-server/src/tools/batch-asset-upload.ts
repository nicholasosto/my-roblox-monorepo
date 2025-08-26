import { AssetUploadTool } from './asset-upload';
import { AssetStatusTool } from './asset-status';
import { AssetType } from '@my-roblox-monorepo/opencloud-api';

export interface BatchAssetUploadRequest {
  assets: Array<{
    filePath: string;
    displayName: string;
    description: string;
    assetType?: AssetType;
  }>;
  creator: {
    userId?: string;
    groupId?: string;
  };
  waitForAll?: boolean;
  maxConcurrent?: number;
}

export interface BatchAssetUploadResponse {
  success: boolean;
  results: Array<{
    filePath: string;
    assetId?: string;
    operationId?: string;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export class BatchAssetUploadTool {
  private uploadTool: AssetUploadTool;
  private statusTool: AssetStatusTool;

  constructor(apiKey: string) {
    this.uploadTool = new AssetUploadTool(apiKey);
    this.statusTool = new AssetStatusTool(apiKey);
  }

  async execute(request: BatchAssetUploadRequest): Promise<BatchAssetUploadResponse> {
    const maxConcurrent = request.maxConcurrent || 3;
    const results: BatchAssetUploadResponse['results'] = [];
    
    // Process uploads in batches to respect rate limits
    for (let i = 0; i < request.assets.length; i += maxConcurrent) {
      const batch = request.assets.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (asset) => {
        try {
          const result = await this.uploadTool.execute({
            filePath: asset.filePath,
            displayName: asset.displayName,
            description: asset.description,
            assetType: asset.assetType,
            creator: request.creator,
            waitForCompletion: request.waitForAll
          });

          return {
            filePath: asset.filePath,
            assetId: result.assetId,
            operationId: result.operationId,
            error: result.error
          };
        } catch (error) {
          return {
            filePath: asset.filePath,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to be respectful to the API
      if (i + maxConcurrent < request.assets.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter(r => !r.error).length;
    const failed = results.length - successful;

    return {
      success: failed === 0,
      results,
      summary: {
        total: results.length,
        successful,
        failed
      }
    };
  }
}
