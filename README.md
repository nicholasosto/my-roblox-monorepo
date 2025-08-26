# TypeScript Roblox Monorepo

A comprehensive monorepo for TypeScript-based Roblox development, containing:

- **Game Package**: Main Roblox TypeScript game project
- **RBXTS Utils**: Custom utility package for Roblox TypeScript
- **OpenCloud API**: Wrapper for Roblox's OpenCloud services  
- **MCP Server**: Model Context Protocol server for development automation

## Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Roblox credentials
   ```

3. **Build all packages**
   ```bash
   pnpm build
   ```

4. **Start development**
   ```bash
   pnpm dev
   ```

## Documentation

Detailed build instructions and workflows are available in `.copilot-instructions`.

Additional documentation:
- [Setup Guide](docs/setup.md)
- [Deployment Guide](docs/deployment.md)
- [API Documentation](docs/api/)

## Package Structure

```
packages/
├── game/           # Main Roblox game (rbxts)
├── rbxts-utils/    # Reusable utilities (npm package)
├── opencloud-api/  # OpenCloud API wrapper (npm package)  
└── mcp-server/     # MCP server for automation
```

## Development

This monorepo uses:
- **pnpm workspaces** for dependency management
- **Turbo** for build orchestration
- **TypeScript project references** for incremental builds
- **Rojo** for Roblox Studio synchronization

## Contributing

1. Make changes in the appropriate package
2. Run `pnpm test` to verify changes
3. Use `pnpm changeset` for versioning published packages
4. Follow the build instructions in `.copilot-instructions`

## License

MIT
