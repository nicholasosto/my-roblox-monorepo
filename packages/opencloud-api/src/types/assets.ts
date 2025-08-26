export enum AssetType {
  AUDIO = 'Audio',
  DECAL = 'Decal', 
  MODEL = 'Model',
  VIDEO = 'Video'
}

export interface Creator {
  userId?: string;
  groupId?: string;
}

export interface CreateAssetRequest {
  assetType: AssetType;
  displayName: string;
  description: string;
  creator: Creator;
  fileContent: Buffer | Blob;
  fileName: string;
  contentType: string;
}

export interface UpdateAssetRequest {
  assetType: AssetType;
  fileContent: Buffer | Blob;
  creationContext: {
    creator: Creator;
    expectedPrice?: number;
  };
}

export interface AssetOperationResponse {
  path: string; // Format: "operations/{operationId}"
}

export interface Asset {
  path: string;
  revisionId: string;
  revisionCreateTime: string;
  assetId: string;
  displayName: string;
  description: string;
  assetType: string;
  creationContext: {
    creator: Creator;
  };
  moderationResult: {
    moderationState: 'MODERATION_STATE_APPROVED' | 'MODERATION_STATE_REVIEWING' | 'MODERATION_STATE_REJECTED';
  };
}

export interface AssetError {
  code: string;
  message: string;
  details?: any[];
}

// Content type mappings for different asset types
export const CONTENT_TYPE_MAP = {
  [AssetType.AUDIO]: ['audio/mpeg', 'audio/ogg'],
  [AssetType.DECAL]: ['image/png', 'image/jpeg', 'image/bmp', 'image/tga'],
  [AssetType.MODEL]: ['model/fbx'],
  [AssetType.VIDEO]: ['video/mp4', 'video/mov']
} as const;

// File extension mappings
export const FILE_EXTENSION_MAP = {
  [AssetType.AUDIO]: ['.mp3', '.ogg'],
  [AssetType.DECAL]: ['.png', '.jpeg', '.jpg', '.bmp', '.tga'],
  [AssetType.MODEL]: ['.fbx'],
  [AssetType.VIDEO]: ['.mp4', '.mov']
} as const;

// Asset upload limits
export const ASSET_LIMITS = {
  [AssetType.AUDIO]: {
    maxSizeBytes: 20 * 1024 * 1024, // 20MB
    maxDurationSeconds: 7 * 60, // 7 minutes
    uploadsPerMonth: { verified: 100, unverified: 10 }
  },
  [AssetType.DECAL]: {
    maxSizeBytes: 20 * 1024 * 1024, // 20MB
    maxPixels: 8000 * 8000
  },
  [AssetType.MODEL]: {
    maxSizeBytes: 20 * 1024 * 1024 // 20MB
  },
  [AssetType.VIDEO]: {
    maxSizeBytes: 750 * 1024 * 1024, // 750MB
    maxDurationSeconds: 60,
    maxResolution: { width: 4096, height: 2160 },
    uploadsPerMonth: 10 // Requires 13+ and ID-verified
  }
} as const;
