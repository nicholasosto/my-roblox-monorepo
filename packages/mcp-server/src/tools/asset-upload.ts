import { OpenCloudClient, AssetsAPI, AssetType, CreateAssetRequest } from '@my-roblox-monorepo/opencloud-api';
import { readFile } from 'fs/promises';
import { extname, basename } from 'path';

export interface AssetUploadToolRequest {
  filePath: string;
  displayName: string;
  description: string;
  assetType?: AssetType;
  creator: {
    userId?: string;
    groupId?: string;
  };
  waitForCompletion?: boolean;
}

export interface AssetUploadToolResponse {
  success: boolean;
  assetId?: string;
  operationId?: string;
  moderationState?: string;
  error?: string;
}

export class AssetUploadTool {
  private assetsAPI: AssetsAPI;

  constructor(private apiKey: string) {
    const client = new OpenCloudClient(apiKey);
    this.assetsAPI = new AssetsAPI(client);
  }

  async execute(request: AssetUploadToolRequest): Promise<AssetUploadToolResponse> {
    try {
      // Validate inputs
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Read file
      const fileBuffer = await readFile(request.filePath);
      const fileName = basename(request.filePath);
      const assetType = request.assetType || this.detectAssetType(request.filePath);
      const contentType = this.getContentType(assetType, request.filePath);

      // Create upload request
      const uploadRequest: CreateAssetRequest = {
        assetType,
        displayName: request.displayName,
        description: request.description,
        creator: request.creator,
        fileContent: fileBuffer,
        fileName,
        contentType
      };

      // Upload asset
      if (request.waitForCompletion) {
        const result = await this.assetsAPI.uploadAssetAndWait(uploadRequest);
        
        if (result.error) {
          return {
            success: false,
            error: `Upload failed: ${result.error.message}`
          };
        }

        const asset = result.response;
        return {
          success: true,
          assetId: asset?.assetId,
          moderationState: asset?.moderationResult?.moderationState
        };
      } else {
        const operation = await this.assetsAPI.createAsset(uploadRequest);
        const operationId = operation.path.split('/').pop();
        
        return {
          success: true,
          operationId
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private validateRequest(request: AssetUploadToolRequest): { valid: boolean; error?: string } {
    if (!request.filePath) {
      return { valid: false, error: 'File path is required' };
    }

    if (!request.displayName) {
      return { valid: false, error: 'Display name is required' };
    }

    if (!request.creator.userId && !request.creator.groupId) {
      return { valid: false, error: 'Either userId or groupId must be specified' };
    }

    if (request.creator.userId && request.creator.groupId) {
      return { valid: false, error: 'Specify either userId or groupId, not both' };
    }

    return { valid: true };
  }

  private detectAssetType(filePath: string): AssetType {
    const ext = extname(filePath).toLowerCase();
    
    if (['.mp3', '.ogg'].includes(ext)) return AssetType.AUDIO;
    if (['.png', '.jpg', '.jpeg', '.bmp', '.tga'].includes(ext)) return AssetType.DECAL;
    if (['.fbx'].includes(ext)) return AssetType.MODEL;
    if (['.mp4', '.mov'].includes(ext)) return AssetType.VIDEO;
    
    throw new Error(`Unsupported file type: ${ext}`);
  }

  private getContentType(assetType: AssetType, filePath: string): string {
    const ext = extname(filePath).toLowerCase();
    
    switch (assetType) {
      case AssetType.AUDIO:
        return ext === '.mp3' ? 'audio/mpeg' : 'audio/ogg';
      case AssetType.DECAL:
        switch (ext) {
          case '.png': return 'image/png';
          case '.jpg':
          case '.jpeg': return 'image/jpeg';
          case '.bmp': return 'image/bmp';
          case '.tga': return 'image/tga';
          default: return 'image/png';
        }
      case AssetType.MODEL:
        return 'model/fbx';
      case AssetType.VIDEO:
        return ext === '.mp4' ? 'video/mp4' : 'video/mov';
      default:
        throw new Error(`Unknown asset type: ${assetType}`);
    }
  }
}
