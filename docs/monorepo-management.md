# Monorepo Project Management Strategy

## Script Execution Flow

### Root Level Scripts (package.json)
```json
{
  "scripts": {
  "build:game": "pnpm --filter @my-roblox-monorepo/game build",
  "dev:game": "pnpm --filter @my-roblox-monorepo/game dev",
    "build": "turbo run build"
  }
}
```

### Game Package Scripts (packages/game/package.json)
```json
{
  "scripts": {
    "build": "rbxtsc",
    "dev": "rbxtsc --watch",
    "serve": "rojo serve",
    "clean": "rm -rf out dist"
  }
}
```

## Execution Paths

### Option 1: Root Orchestration (Recommended)
```
monorepo root → pnpm filter → packages/game → rbxtsc/rojo
```

### Option 2: Direct Package Control
```
packages/game → npm run build → rbxtsc
```

### Option 3: Turbo Orchestration (All Packages)
```
monorepo root → turbo run build → parallel execution of all package builds
```

## Build Output Locations

Each package manages its own output:

```
packages/game/
├── src/                    # TypeScript source
├── assets/                 # Game assets
├── out/                    # rbxtsc Lua output
├── dist/                   # Final Roblox place files
└── default.project.json    # Rojo configuration

packages/rbxts-utils/
├── src/                    # TypeScript source
└── dist/                   # npm package build

packages/opencloud-api/
├── src/                    # TypeScript source  
└── dist/                   # npm package build

packages/mcp-server/
├── src/                    # TypeScript source
└── dist/                   # Node.js build
```

## Tool Locations

### Shared Tools (Root Level)
```
tools/
└── config/
  └── deployment.json    # Shared deployment config
```

### Package-Specific Tools
```
packages/game/
├── rojo.json              # Rojo config for this project
└── tsconfig.json          # TypeScript config for game

packages/opencloud-api/
└── tsconfig.json          # API package TypeScript config
```

## Why This Approach Works

1. **Developer Experience**: Simple commands from root
2. **Package Autonomy**: Each package can be built independently  
3. **Shared Tools**: Common build logic in shared scripts
4. **Scalability**: Easy to add new packages
5. **CI/CD Friendly**: Can build specific packages or all packages

## Common Commands

### From Root (Recommended for daily use)
- `npm run dev:game` - Start game development
- `npm run build:game` - Build game for testing
- `npm run build:game:production` - Build for production
- `npm run sync-assets` - Sync game assets

### From Package Directory (For focused development)
- `cd packages/game && npm run build`
- `cd packages/opencloud-api && npm test`

### For CI/CD
- `npm run build` - Build all packages
- `npm run test` - Test all packages
- `npm run lint` - Lint all packages
