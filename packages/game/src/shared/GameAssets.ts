// Asset constants live here. Naming rules:
// See ../../../../docs/asset-naming.md
export const GameAssets = {} as const;
export type AssetKey = keyof typeof GameAssets;
export type AssetId = (typeof GameAssets)[AssetKey];
