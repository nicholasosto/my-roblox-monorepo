export declare enum AssetType {
    AUDIO = "Audio",
    DECAL = "Decal",
    MODEL = "Model",
    VIDEO = "Video"
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
    path: string;
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
export declare const CONTENT_TYPE_MAP: {
    readonly Audio: readonly ["audio/mpeg", "audio/ogg"];
    readonly Decal: readonly ["image/png", "image/jpeg", "image/bmp", "image/tga"];
    readonly Model: readonly ["model/fbx"];
    readonly Video: readonly ["video/mp4", "video/mov"];
};
export declare const FILE_EXTENSION_MAP: {
    readonly Audio: readonly [".mp3", ".ogg"];
    readonly Decal: readonly [".png", ".jpeg", ".jpg", ".bmp", ".tga"];
    readonly Model: readonly [".fbx"];
    readonly Video: readonly [".mp4", ".mov"];
};
export declare const ASSET_LIMITS: {
    readonly Audio: {
        readonly maxSizeBytes: number;
        readonly maxDurationSeconds: number;
        readonly uploadsPerMonth: {
            readonly verified: 100;
            readonly unverified: 10;
        };
    };
    readonly Decal: {
        readonly maxSizeBytes: number;
        readonly maxPixels: number;
    };
    readonly Model: {
        readonly maxSizeBytes: number;
    };
    readonly Video: {
        readonly maxSizeBytes: number;
        readonly maxDurationSeconds: 60;
        readonly maxResolution: {
            readonly width: 4096;
            readonly height: 2160;
        };
        readonly uploadsPerMonth: 10;
    };
};
//# sourceMappingURL=assets.d.ts.map