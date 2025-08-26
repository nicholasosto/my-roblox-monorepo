import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { GameAssetsSyncTool, AssetManifest } from './game-assets-sync';

export interface AssetConstantsRequest {
  assetsPath: string;
  outputPath: string;
  namespace?: string;
  format?: 'typescript' | 'lua';
}

export interface AssetConstantsResponse {
  success: boolean;
  generatedFile: string;
  assetCount: number;
  error?: string;
}

export class AssetConstantsGeneratorTool {
  async execute(request: AssetConstantsRequest): Promise<AssetConstantsResponse> {
    try {
      const manifestPath = join(request.assetsPath, '.asset-manifest.json');
      const manifestContent = await readFile(manifestPath, 'utf-8');
      const manifest: AssetManifest = JSON.parse(manifestContent);

      // Filter only synced assets with asset IDs
      const syncedAssets = Object.entries(manifest.assets)
        .filter(([_, entry]) => entry.status === 'synced' && entry.assetId)
        .reduce((acc, [path, entry]) => {
          acc[path] = entry.assetId!;
          return acc;
        }, {} as Record<string, string>);

      const content = request.format === 'lua' 
        ? this.generateLuaConstants(syncedAssets, request.namespace)
        : this.generateTypeScriptConstants(syncedAssets, request.namespace);

      await writeFile(request.outputPath, content);

      return {
        success: true,
        generatedFile: request.outputPath,
        assetCount: Object.keys(syncedAssets).length
      };

    } catch (error) {
      return {
        success: false,
        generatedFile: '',
        assetCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateTypeScriptConstants(assets: Record<string, string>, namespace?: string): string {
    const constantName = namespace || 'GameAssets';
    const entries = Object.entries(assets).map(([path, assetId]) => {
      const constantKey = this.pathToConstantName(path);
      return `  ${constantKey}: '${assetId}' as const`;
    }).join(',\n');

    return `// Generated asset constants - DO NOT EDIT MANUALLY
// Generated at: ${new Date().toISOString()}

export const ${constantName} = {
${entries}
} as const;

export type AssetId = typeof ${constantName}[keyof typeof ${constantName}];

// Helper type for asset categories
export const AssetCategories = {
  AUDIO: Object.keys(${constantName}).filter(key => key.startsWith('AUDIO_')),
  IMAGES: Object.keys(${constantName}).filter(key => key.startsWith('IMAGES_')),
  MODELS: Object.keys(${constantName}).filter(key => key.startsWith('MODELS_')),
  VIDEOS: Object.keys(${constantName}).filter(key => key.startsWith('VIDEOS_'))
} as const;
`;
  }

  private generateLuaConstants(assets: Record<string, string>, namespace?: string): string {
    const moduleName = namespace || 'GameAssets';
    const entries = Object.entries(assets).map(([path, assetId]) => {
      const constantKey = this.pathToConstantName(path);
      return `\t${constantKey} = "${assetId}"`;
    }).join(',\n');

    return `-- Generated asset constants - DO NOT EDIT MANUALLY
-- Generated at: ${new Date().toISOString()}

local ${moduleName} = {
${entries}
}

return ${moduleName}
`;
  }

  private pathToConstantName(path: string): string {
    // Convert path like "audio/music/background-music.mp3" to "AUDIO_MUSIC_BACKGROUND_MUSIC"
    return path
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace non-alphanumeric with underscore
      .toUpperCase();
  }
}
