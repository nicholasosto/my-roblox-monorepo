import { watch } from 'fs';
import { GameAssetsSyncTool } from './game-assets-sync';
import { AssetConstantsGeneratorTool } from './asset-constants-generator';

export interface AssetWatcherRequest {
  assetsPath: string;
  autoSync?: boolean;
  generateConstants?: boolean;
  constantsOutputPath?: string;
  debounceMs?: number;
}

export interface AssetWatcherResponse {
  success: boolean;
  watcherActive: boolean;
  message: string;
}

export class AssetWatcherTool {
  private syncTool: GameAssetsSyncTool;
  private constantsGenerator: AssetConstantsGeneratorTool;
  private watchers: Map<string, any> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(apiKey: string) {
    this.syncTool = new GameAssetsSyncTool(apiKey);
    this.constantsGenerator = new AssetConstantsGeneratorTool();
  }

  async execute(request: AssetWatcherRequest): Promise<AssetWatcherResponse> {
    try {
      const watchKey = request.assetsPath;
      
      if (this.watchers.has(watchKey)) {
        return {
          success: false,
          watcherActive: true,
          message: `Watcher already active for ${request.assetsPath}`
        };
      }

      const watcher = watch(
        request.assetsPath,
        { recursive: true },
        (eventType, filename) => {
          if (filename && this.isAssetFile(filename)) {
            this.handleFileChange(
              eventType,
              filename,
              request
            );
          }
        }
      );

      this.watchers.set(watchKey, watcher);

      return {
        success: true,
        watcherActive: true,
        message: `Asset watcher started for ${request.assetsPath}`
      };

    } catch (error) {
      return {
        success: false,
        watcherActive: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async stopWatcher(assetsPath: string): Promise<boolean> {
    const watcher = this.watchers.get(assetsPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(assetsPath);
      
      // Clear any pending debounce timer
      const timer = this.debounceTimers.get(assetsPath);
      if (timer) {
        clearTimeout(timer);
        this.debounceTimers.delete(assetsPath);
      }
      
      return true;
    }
    return false;
  }

  private handleFileChange(eventType: string, filename: string, request: AssetWatcherRequest) {
    console.log(`Asset ${eventType}: ${filename}`);
    
    // Debounce file changes to avoid excessive processing
    const debounceKey = `${request.assetsPath}:${filename}`;
    const existingTimer = this.debounceTimers.get(debounceKey);
    
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      this.debounceTimers.delete(debounceKey);
      
      if (request.autoSync) {
        try {
          // Sync only the changed file
          const result = await this.syncTool.execute({
            assetsPath: request.assetsPath,
            pattern: filename.replace(/\\/g, '/') // Normalize path separators
          });

          if (result.success) {
            console.log(`✅ Synced ${filename}:`, result.summary);
            
            if (request.generateConstants && request.constantsOutputPath) {
              await this.constantsGenerator.execute({
                assetsPath: request.assetsPath,
                outputPath: request.constantsOutputPath
              });
              console.log(`✅ Updated asset constants`);
            }
          } else {
            console.error(`❌ Failed to sync ${filename}:`, result.error);
          }
        } catch (error) {
          console.error(`❌ Error syncing ${filename}:`, error);
        }
      }
    }, request.debounceMs || 1000);

    this.debounceTimers.set(debounceKey, timer);
  }

  private isAssetFile(filename: string): boolean {
    const assetExtensions = ['.mp3', '.ogg', '.png', '.jpg', '.jpeg', '.bmp', '.tga', '.fbx', '.mp4', '.mov'];
    return assetExtensions.some(ext => filename.toLowerCase().endsWith(ext)) 
      && !filename.endsWith('.asset.json');
  }

  async stopAllWatchers(): Promise<number> {
    const count = this.watchers.size;
    
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      const timer = this.debounceTimers.get(path);
      if (timer) {
        clearTimeout(timer);
      }
    }
    
    this.watchers.clear();
    this.debounceTimers.clear();
    
    return count;
  }
}
