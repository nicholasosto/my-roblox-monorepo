# Game Assets Management System

This document describes the GameAssets folder system integration with OpenCloud Asset API for automated asset management.

See also: [Asset Naming Conventions](./asset-naming.md) for required filename patterns validated by the tools.

## Folder Structure

```text
packages/game/
├── src/
├── assets/                    # Game assets folder
│   ├── .asset-manifest.json   # Asset tracking manifest
│   ├── audio/
│   │   ├── music/
│   │   │   ├── background-music.mp3
│   │   │   └── background-music.asset.json
│   │   └── sfx/
│   │       ├── jump-sound.ogg
│   │       └── jump-sound.asset.json
│   ├── images/
│   │   ├── ui/
│   │   │   ├── button-texture.png
│   │   │   └── button-texture.asset.json
│   │   └── decals/
│   │       ├── team-logo.png
│   │       └── team-logo.asset.json
│   ├── models/
│   │   ├── weapons/
│   │   │   ├── sword.fbx
│   │   │   └── sword.asset.json
│   │   └── environment/
│   │       ├── tree.fbx
│   │       └── tree.asset.json
│   └── videos/
│       ├── intro.mp4
│       └── intro.asset.json
└── default.project.json
```

## Asset Metadata Files

Each asset has a corresponding `.asset.json` file containing:

```json
{
  "assetId": "12345678901",
  "displayName": "Background Music",
  "description": "Main theme music for the game",
  "assetType": "Audio",
  "contentHash": "sha256:abc123...",
  "uploadedAt": "2025-01-01T10:00:00Z",
  "moderationState": "MODERATION_STATE_APPROVED",
  "version": 1,
  "tags": ["music", "background", "theme"],
  "usedIn": ["StarterPlayer", "Workspace.MusicPlayer"],
  "creator": {
    "userId": "123456789"
  }
}
```

## Asset Manifest

The `.asset-manifest.json` tracks all assets in the project:

```json
{
  "version": "1.0.0",
  "lastSync": "2025-01-01T10:00:00Z",
  "assets": {
    "audio/music/background-music.mp3": {
      "assetId": "12345678901",
      "lastModified": "2025-01-01T09:00:00Z",
      "contentHash": "sha256:abc123...",
      "status": "synced"
    }
  },
  "config": {
    "autoSync": true,
    "creator": {
      "userId": "123456789"
    },
    "defaultTags": ["game-asset"],
    "uploadOnBuild": true
  }
}
```

## MCP Tools Integration

### Asset Sync Tool

- `sync-assets` - Sync all changed assets
- `watch-assets` - Watch folder for changes and auto-sync
- `validate-assets` - Check assets before upload
- `generate-constants` - Create TypeScript constants file

### Asset Management Tools  

- `list-assets` - Show all assets and their status
- `update-asset-metadata` - Update descriptions, tags, etc.
- `check-asset-usage` - Find where assets are referenced in code
- `cleanup-unused` - Remove assets not referenced in code

## Workflow Integration

1. **Development**: Add assets to appropriate folders
2. **Auto-detection**: System detects new/changed files
3. **Validation**: Check file types, sizes, naming conventions
4. **Upload**: Automatically upload to Roblox via OpenCloud
5. **Code Generation**: Update TypeScript constants with asset IDs
6. **Rojo Sync**: Include asset references in build output

This system provides a seamless asset management pipeline integrated with your existing development workflow.
