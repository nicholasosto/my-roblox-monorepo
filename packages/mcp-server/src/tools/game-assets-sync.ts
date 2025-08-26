import { readFile, writeFile, stat, readdir } from 'fs/promises';
import { join, relative, extname, basename } from 'path';
import { createHash } from 'crypto';
import { AssetUploadTool } from './asset-upload';
import { AssetType } from '@my-roblox-monorepo/opencloud-api';

export interface AssetManifest {
  version: string;
  lastSync: string | null;
  assets: Record<string, AssetEntry>;
  config: ManifestConfig;
}

export interface AssetEntry {
  assetId: string | null;
  lastModified: string;
  contentHash: string;
  status: 'new' | 'synced' | 'modified' | 'error' | 'pending';
  error?: string;
}

export interface ManifestConfig {
  autoSync: boolean;
  creator: { userId?: string; groupId?: string };
  defaultTags: string[];
  uploadOnBuild: boolean;
  watchMode: boolean;
  assetNamingConvention: string;
  requiredMetadata: string[];
  syncRules: Record<string, SyncRule>;
}

export interface SyncRule {
  maxSizeBytes: number;
  allowedExtensions: string[];
  defaultDescription: string;
}

export interface AssetMetadata {
  assetId?: string;
  displayName: string;
  description: string;
  assetType: AssetType;
  contentHash: string;
  uploadedAt?: string;
  moderationState?: string;
  version: number;
  tags: string[];
  usedIn: string[];
  creator: { userId?: string; groupId?: string };
}

export interface GameAssetsSyncRequest {
  assetsPath: string;
  dryRun?: boolean;
  forceSync?: boolean;
  pattern?: string;
}

export interface GameAssetsSyncResponse {
  success: boolean;
  summary: {
    scanned: number;
    new: number;
    modified: number;
    uploaded: number;
    errors: number;
  };
  results: Array<{
    filePath: string;
    status: 'uploaded' | 'skipped' | 'error';
    assetId?: string;
    error?: string;
  }>;
  error?: string;
}

export class GameAssetsSyncTool {
  private uploadTool: AssetUploadTool;

  constructor(private apiKey: string) {
    this.uploadTool = new AssetUploadTool(apiKey);
  }

  async execute(request: GameAssetsSyncRequest): Promise<GameAssetsSyncResponse> {
    try {
      const manifestPath = join(request.assetsPath, '.asset-manifest.json');
      const manifest = await this.loadManifest(manifestPath);
      
      // Scan for assets
      const assetFiles = await this.scanAssets(request.assetsPath, request.pattern);
      
      // Check for changes
      const changes = await this.detectChanges(assetFiles, manifest, request.assetsPath);
      
      const results: GameAssetsSyncResponse['results'] = [];
      
      if (request.dryRun) {
        // Just return what would be synced
        for (const file of changes.new.concat(changes.modified)) {
          results.push({
            filePath: file,
            status: 'skipped'
          });
        }
      } else {
        // Actually sync the assets
        for (const filePath of changes.new.concat(changes.modified)) {
          try {
            const result = await this.syncAsset(filePath, manifest, request.assetsPath);
            results.push(result);
          } catch (error) {
            results.push({
              filePath,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
        
        // Update manifest
        manifest.lastSync = new Date().toISOString();
        await this.saveManifest(manifestPath, manifest);
      }

      const summary = {
        scanned: assetFiles.length,
        new: changes.new.length,
        modified: changes.modified.length,
        uploaded: results.filter(r => r.status === 'uploaded').length,
        errors: results.filter(r => r.status === 'error').length
      };

      return {
        success: summary.errors === 0,
        summary,
        results
      };

    } catch (error) {
      return {
        success: false,
        summary: { scanned: 0, new: 0, modified: 0, uploaded: 0, errors: 1 },
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async loadManifest(manifestPath: string): Promise<AssetManifest> {
    try {
      const content = await readFile(manifestPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Create default manifest if it doesn't exist
      return {
        version: '1.0.0',
        lastSync: null,
        assets: {},
        config: {
          autoSync: true,
          creator: { userId: process.env.ROBLOX_USER_ID },
          defaultTags: ['game-asset'],
          uploadOnBuild: true,
          watchMode: false,
          assetNamingConvention: 'kebab-case',
          requiredMetadata: ['displayName', 'description'],
          syncRules: {}
        }
      };
    }
  }

  private async saveManifest(manifestPath: string, manifest: AssetManifest): Promise<void> {
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }

  private async scanAssets(assetsPath: string, pattern?: string): Promise<string[]> {
    const assets: string[] = [];
    
    const scanDirectory = async (dir: string): Promise<void> => {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && this.isAssetFile(entry.name)) {
          const relativePath = relative(assetsPath, fullPath);
          if (!pattern || relativePath.match(new RegExp(pattern))) {
            assets.push(relativePath);
          }
        }
      }
    };

    await scanDirectory(assetsPath);
    return assets;
  }

  private isAssetFile(filename: string): boolean {
    const ext = extname(filename).toLowerCase();
    const assetExtensions = ['.mp3', '.ogg', '.png', '.jpg', '.jpeg', '.bmp', '.tga', '.fbx', '.mp4', '.mov'];
    return assetExtensions.includes(ext) && !filename.endsWith('.asset.json');
  }

  private async detectChanges(assetFiles: string[], manifest: AssetManifest, assetsPath: string) {
    const changes = {
      new: [] as string[],
      modified: [] as string[],
      unchanged: [] as string[]
    };

    for (const filePath of assetFiles) {
      const fullPath = join(assetsPath, filePath);
      const stats = await stat(fullPath);
      const fileContent = await readFile(fullPath);
      const contentHash = createHash('sha256').update(fileContent).digest('hex');

      const existing = manifest.assets[filePath];

      if (!existing) {
        changes.new.push(filePath);
      } else if (existing.contentHash !== contentHash) {
        changes.modified.push(filePath);
      } else {
        changes.unchanged.push(filePath);
      }

      // Update manifest entry
      manifest.assets[filePath] = {
        assetId: existing?.assetId || null,
        lastModified: stats.mtime.toISOString(),
        contentHash,
        status: existing ? (existing.contentHash !== contentHash ? 'modified' : 'synced') : 'new'
      };
    }

    return changes;
  }

  private async syncAsset(relativePath: string, manifest: AssetManifest, assetsPath: string): Promise<GameAssetsSyncResponse['results'][0]> {
    const fullPath = join(assetsPath, relativePath);
    const assetType = this.detectAssetType(fullPath);
    
    // Try to load existing metadata
    let metadata: Partial<AssetMetadata> = {};
    try {
      const metadataPath = fullPath.replace(extname(fullPath), '.asset.json');
      const metadataContent = await readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(metadataContent);
    } catch {
      // Use defaults if no metadata file exists
      metadata = {
        displayName: this.generateDisplayName(relativePath),
        description: this.generateDescription(relativePath, assetType),
        tags: manifest.config.defaultTags
      };
    }

    const uploadResult = await this.uploadTool.execute({
      filePath: fullPath,
      displayName: metadata.displayName || basename(relativePath),
      description: metadata.description || 'Game asset',
      assetType,
      creator: manifest.config.creator,
      waitForCompletion: true
    });

    if (uploadResult.success && uploadResult.assetId) {
      // Update manifest
      manifest.assets[relativePath].assetId = uploadResult.assetId;
      manifest.assets[relativePath].status = 'synced';
      
      // Create/update metadata file
      const metadataPath = fullPath.replace(extname(fullPath), '.asset.json');
      const updatedMetadata: AssetMetadata = {
        ...metadata,
        assetId: uploadResult.assetId,
        assetType,
        uploadedAt: new Date().toISOString(),
        moderationState: uploadResult.moderationState,
        version: (metadata.version || 0) + 1,
        creator: manifest.config.creator
      } as AssetMetadata;
      
      await writeFile(metadataPath, JSON.stringify(updatedMetadata, null, 2));

      return {
        filePath: relativePath,
        status: 'uploaded',
        assetId: uploadResult.assetId
      };
    } else {
      manifest.assets[relativePath].status = 'error';
      manifest.assets[relativePath].error = uploadResult.error;
      
      return {
        filePath: relativePath,
        status: 'error',
        error: uploadResult.error
      };
    }
  }

  private detectAssetType(filePath: string): AssetType {
    const ext = extname(filePath).toLowerCase();
    
    if (['.mp3', '.ogg'].includes(ext)) return AssetType.AUDIO;
    if (['.png', '.jpg', '.jpeg', '.bmp', '.tga'].includes(ext)) return AssetType.DECAL;
    if (['.fbx'].includes(ext)) return AssetType.MODEL;
    if (['.mp4', '.mov'].includes(ext)) return AssetType.VIDEO;
    
    throw new Error(`Unsupported asset type for file: ${filePath}`);
  }

  private generateDisplayName(filePath: string): string {
    return basename(filePath, extname(filePath))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private generateDescription(filePath: string, assetType: AssetType): string {
    const category = filePath.split('/')[0];
    return `${assetType} asset for ${category} - ${this.generateDisplayName(filePath)}`;
  }
}
