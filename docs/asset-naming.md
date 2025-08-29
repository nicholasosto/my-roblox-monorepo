# GameAssets Naming Convention Cheat Sheet

## Quick Reference Format

```text
[category]_[subcategory]_[descriptor]_[variant]_[size]_[version].[extension]
```

## Category Prefixes

| Prefix | Category | Example |
|--------|----------|---------|
| `ui_` | User Interface | `ui_button_start.png` |
| `char_` | Characters | `char_player_idle.png` |
| `env_` | Environments | `env_forest_background.png` |
| `fx_` | Effects | `fx_explosion_small.png` |
| `item_` | Items | `item_sword_iron.png` |
| `tex_` | Textures | `tex_stone_wall.png` |
| `mus_` | Music | `mus_combat_boss.ogg` |
| `sfx_` | Sound Effects | `sfx_footstep_grass.wav` |
| `vo_` | Voice | `vo_npc_greeting.wav` |
| `loop_` | Audio Loops | `loop_ambient_forest.ogg` |

## Size Indicators (Images Only)

| Code | Size | Resolution Range |
|------|------|------------------|
| `_xs` | Extra Small | 16×16 to 32×32 |
| `_sm` | Small | 64×64 to 128×128 |
| `_md` | Medium | 256×256 to 512×512 |
| `_lg` | Large | 1024×1024 to 2048×2048 |
| `_xl` | Extra Large | 4096×4096+ |

## State/Variant Indicators

| Suffix | Meaning |
|--------|---------|
| `_idle` | Default/resting state |
| `_active` | Active/pressed state |
| `_hover` | Mouse over state |
| `_disabled` | Inactive state |
| `_damaged` | Damaged variant |
| `_alt` | Alternative version |

## Essential Rules

✅ **DO:**

- Use **snake_case** (lowercase with underscores)
- Keep filenames under 64 characters
- Use version numbers: `_v01`, `_v02`
- Include descriptive names
- Match file extensions to content type

❌ **DON'T:**

- Use spaces or special characters
- Use CamelCase or UPPERCASE
- Exceed 64 character limit
- Use unicode characters
- Mix version numbering formats

## Animation Sequences

```text
[base_name]_[frame_number]_[total_frames]
```

**Example:** `char_player_run_01_08.png` (frame 1 of 8)

## Common Examples

### UI Assets

- `ui_button_start_hover_lg_v02.png`
- `ui_icon_health_damaged_sm_v01.png`
- `ui_menu_background_md_v03.jpg`

### Character Assets

- `char_player_idle_v01.png`
- `char_enemy_attack_03_06.png`
- `char_npc_dialogue_active_v02.png`

### Audio Assets

- `mus_level1_theme_v01.ogg`
- `sfx_explosion_large_v02.wav`
- `vo_player_hurt_alt_v01.wav`

## File Extensions by Category

| Category | Approved Extensions |
|----------|-------------------|
| **Images** | `.png`, `.jpg`, `.jpeg`, `.tga`, `.psd` |
| **Audio** | `.wav`, `.ogg`, `.mp3`, `.flac` |
| **Video** | `.mp4`, `.mov`, `.avi` |

## Status Indicators

| Status | Meaning |
|--------|---------|
| `final` | Ready for production |
| `wip` | Work in progress |
| `temp` | Temporary placeholder |
| `deprecated` | No longer used |

## Quick Validation Checklist

- [ ] Starts with valid category prefix
- [ ] Uses snake_case formatting
- [ ] Under 64 characters total
- [ ] Includes version number (`_vXX`)
- [ ] Uses approved file extension
- [ ] No spaces or special characters
- [ ] Descriptive and consistent terminology

## LLM Catalog Design Reference

When designing asset catalogs, inventories, or indexes using this naming convention, follow these guidelines:

### Searchable Fields

Structure your catalog to enable searching by these extracted components:

- **Category** (ui, char, env, fx, item, tex, mus, sfx, vo, loop)
- **Subcategory** (button, player, forest, explosion, sword, stone, combat, footstep, npc, ambient)
- **Descriptor** (start, idle, background, small, iron, wall, boss, grass, greeting, forest)
- **Variant/State** (hover, active, idle, disabled, damaged, alt)
- **Size** (xs, sm, md, lg, xl)
- **Version** (v01, v02, v03, etc.)

### Auto-Generated Metadata

Extract these properties programmatically from filenames:

```json
{
  "filename": "ui_button_start_hover_lg_v02.png",
  "parsed_components": {
    "category": "ui",
    "subcategory": "button", 
    "descriptor": "start",
    "variant": "hover",
    "size": "lg",
    "version": "v02",
    "extension": "png"
  },
  "auto_tags": ["ui", "button", "start", "hover", "large", "interface"],
  "rbxgameasset_path": "rbxgameasset://Images/ui_button_start_hover_lg_v02",
  "category_folder": "Images"
}
```

### Catalog Organization Patterns

**By Category Hierarchy:**

```text
UI Assets/
├── Buttons/
│   ├── Start Buttons/
│   └── Menu Buttons/
├── Icons/
│   ├── Health Icons/
│   └── Inventory Icons/
└── Backgrounds/

Characters/
├── Player/
├── NPCs/
└── Enemies/
```

**By Size Groups:**

```text
Small Assets (xs, sm)/
Medium Assets (md)/
Large Assets (lg, xl)/
```

**By Development Status:**

```text
Final Assets/
Work in Progress/
Deprecated Assets/
```

### Smart Filtering Logic

Enable filtering combinations like:

- All UI buttons in hover state: `category:ui AND subcategory:button AND variant:hover`
- Large textures version 2+: `category:tex AND size:lg AND version:>=v02`
- All player character assets: `category:char AND subcategory:player`
- Audio loops under 30 seconds: `category:loop AND duration:<30`

### Batch Operations Support

Design for bulk operations using pattern matching:

- Update all `_v01` to `_v02`
- Convert all `ui_*_sm_*` to medium size
- Archive all `_temp` and `_wip` assets
- Migrate `char_player_*` to new character system

### Version Management

Track version relationships:

```json
{
  "base_name": "ui_button_start_hover_lg",
  "versions": ["v01", "v02", "v03"],
  "latest": "v03",
  "deprecated": ["v01"],
  "active": ["v02", "v03"]
}
```

### Asset Relationship Mapping

Link related assets automatically:

```json
{
  "asset_family": "ui_button_start",
  "related_assets": [
    "ui_button_start_idle_lg_v02",
    "ui_button_start_hover_lg_v02", 
    "ui_button_start_active_lg_v02",
    "ui_button_start_disabled_lg_v02"
  ],
  "size_variants": ["sm", "md", "lg"],
  "state_variants": ["idle", "hover", "active", "disabled"]
}
```

### Validation Rules for Catalogs

- Ensure category prefixes match folder assignments
- Flag missing size variants in UI asset families
- Detect orphaned versions (v03 exists but v02 missing)
- Validate rbxgameasset paths match actual Asset Manager structure
- Check for naming convention violations before catalog entry

## Need Help?

Refer to the full convention document for detailed validation rules, metadata requirements, and quality standards.
