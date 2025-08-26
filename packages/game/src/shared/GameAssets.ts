// Placeholder kept for future asset constants.
export const GameAssets = {} as const;
export type AssetKey = keyof typeof GameAssets;
export type AssetId = typeof GameAssets[AssetKey];
