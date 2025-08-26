import { OpenCloudClient, AssetsAPI } from '@my-roblox-monorepo/opencloud-api';

export interface AssetStatusToolRequest {
  operationId: string;
}

export interface AssetStatusToolResponse {
  success: boolean;
  done: boolean;
  assetId?: string;
  moderationState?: string;
  error?: string;
  progress?: string;
}

export class AssetStatusTool {
  private assetsAPI: AssetsAPI;

  constructor(private apiKey: string) {
    const client = new OpenCloudClient(apiKey);
    this.assetsAPI = new AssetsAPI(client);
  }

  async execute(request: AssetStatusToolRequest): Promise<AssetStatusToolResponse> {
    try {
      const status = await this.assetsAPI.getOperationStatus(request.operationId);

      if (status.error) {
        return {
          success: false,
          done: true,
          error: status.error.message
        };
      }

      if (status.done && status.response) {
        const asset = status.response;
        return {
          success: true,
          done: true,
          assetId: asset.assetId,
          moderationState: asset.moderationResult?.moderationState
        };
      }

      return {
        success: true,
        done: false,
        progress: 'Upload in progress...'
      };

    } catch (error) {
      return {
        success: false,
        done: true,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
