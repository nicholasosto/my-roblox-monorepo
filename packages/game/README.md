# Game (rbxts Hello World)

A minimal Roblox-ts project inside the monorepo.

## Prereqs

- Node 18+
- pnpm
- roblox-ts (installed via devDependencies)
- Rojo CLI (optional, for studio sync): <https://rojo.space/>

## Scripts

- Build once:
  - `pnpm run build`
- Watch compile:
  - `pnpm run dev`
- Serve to Roblox Studio (requires Rojo):
  - `pnpm run serve`

## Notes

- Output is generated in `out/` by `rbxtsc`.
- The monorepo’s root TypeScript build excludes this package; use the scripts above for game work.
