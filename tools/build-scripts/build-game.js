#!/usr/bin/env node

/**
 * Game Build Script with Asset Pipeline Integration
 * 
 * This script orchestrates the complete build process:
 * 1. Syncs game assets to Roblox via OpenCloud
 * 2. Generates TypeScript constants for asset IDs
 * 3. Compiles TypeScript to Lua
 * 4. Builds Roblox place file with Rojo
 */

const { GameAssetsSyncTool, AssetConstantsGeneratorTool } = require('@my-roblox-monorepo/mcp-server');
const { join } = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

class GameBuildPipeline {
  constructor() {
    this.assetsPath = join(__dirname, '..', '..', 'packages', 'game', 'assets');
    this.srcPath = join(__dirname, '..', '..', 'packages', 'game', 'src');
    this.outputPath = join(__dirname, '..', '..', 'packages', 'game', 'out');
    
    this.apiKey = process.env.ROBLOX_API_KEY;
    if (!this.apiKey) {
      throw new Error('ROBLOX_API_KEY environment variable is required');
    }
  }

  async build(options = {}) {
    console.log('🚀 Starting game build pipeline...');
    
    try {
      // Step 1: Sync Assets
      if (!options.skipAssets) {
        await this.syncAssets(options.dryRun);
      }

      // Step 2: Generate Asset Constants
      await this.generateAssetConstants();

      // Step 3: Compile TypeScript
      await this.compileTypeScript();

      // Step 4: Build Roblox Place
      await this.buildRobloxPlace(options.production);

      // Step 5: Upload to Roblox (if requested)
      if (options.uploadPlace) {
        await this.uploadPlace();
      }

      console.log('✅ Build pipeline completed successfully!');

    } catch (error) {
      console.error('❌ Build pipeline failed:', error);
      process.exit(1);
    }
  }

  async syncAssets(dryRun = false) {
    console.log('📦 Syncing game assets...');
    
    const syncTool = new GameAssetsSyncTool(this.apiKey);
    const result = await syncTool.execute({
      assetsPath: this.assetsPath,
      dryRun
    });

    if (!result.success) {
      throw new Error(`Asset sync failed: ${result.error}`);
    }

    console.log(`✅ Asset sync completed:`, result.summary);
    
    if (result.summary.errors > 0) {
      console.warn('⚠️  Some assets failed to sync:');
      result.results
        .filter(r => r.status === 'error')
        .forEach(r => console.warn(`  - ${r.filePath}: ${r.error}`));
    }
  }

  async generateAssetConstants() {
    console.log('📝 Generating asset constants...');
    
    const constantsGenerator = new AssetConstantsGeneratorTool();
    const result = await constantsGenerator.execute({
      assetsPath: this.assetsPath,
      outputPath: join(this.srcPath, 'shared', 'GameAssets.ts'),
      namespace: 'GameAssets',
      format: 'typescript'
    });

    if (!result.success) {
      throw new Error(`Constants generation failed: ${result.error}`);
    }

    console.log(`✅ Generated constants for ${result.assetCount} assets`);
  }

  async compileTypeScript() {
    console.log('🔧 Compiling TypeScript to Lua...');
    
    return new Promise((resolve, reject) => {
  const rbxtsc = spawn('npx', ['rbxtsc', '--verbose'], {
        cwd: join(__dirname, '..', '..', 'packages', 'game'),
        stdio: 'inherit'
      });

      rbxtsc.on('close', (code) => {
        if (code === 0) {
          console.log('✅ TypeScript compilation completed');
          resolve();
        } else {
          reject(new Error(`TypeScript compilation failed with code ${code}`));
        }
      });

      rbxtsc.on('error', (error) => {
        reject(new Error(`Failed to start rbxtsc: ${error.message}`));
      });
    });
  }

  async buildRobloxPlace(production = false) {
    console.log('🏗️  Building Roblox place file...');
    
    const outputFile = join(this.outputPath, production ? 'game-production.rbxl' : 'game-dev.rbxl');
    
    return new Promise((resolve, reject) => {
  const rojo = spawn('rojo', ['build', '--output', outputFile], {
        cwd: join(__dirname, '..', '..', 'packages', 'game'),
        stdio: 'inherit'
      });

      rojo.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Place file built: ${outputFile}`);
          resolve();
        } else {
          reject(new Error(`Rojo build failed with code ${code}`));
        }
      });

      rojo.on('error', (error) => {
        reject(new Error(`Failed to start rojo: ${error.message}`));
      });
    });
  }

  async uploadPlace() {
    console.log('⬆️  Uploading place to Roblox...');
    
    // This would use OpenCloud Places API when available
    // For now, we'll just log that this step would happen
    console.log('🚧 Place upload not implemented yet (waiting for OpenCloud Places API)');
    console.log('   Manual upload required through Roblox Studio or Creator Dashboard');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  if (args.includes('--skip-assets')) options.skipAssets = true;
  if (args.includes('--dry-run')) options.dryRun = true;
  if (args.includes('--production')) options.production = true;
  if (args.includes('--upload')) options.uploadPlace = true;

  if (args.includes('--help')) {
    console.log(`
Game Build Pipeline

Usage: npm run build [options]

Options:
  --skip-assets    Skip asset synchronization step
  --dry-run        Show what would be synced without actually uploading
  --production     Build for production (optimized)
  --upload         Upload place file to Roblox (requires Places API)
  --help           Show this help message

Environment Variables:
  ROBLOX_API_KEY   Required: Your Roblox OpenCloud API key
  ROBLOX_USER_ID   Your Roblox user ID (for asset uploads)
  UNIVERSE_ID      Target universe ID (for place uploads)
  PLACE_ID         Target place ID (for place uploads)
`);
    return;
  }

  const pipeline = new GameBuildPipeline();
  await pipeline.build(options);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { GameBuildPipeline };
