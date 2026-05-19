# WoD Tracker — Styles (BEM)

Conventions live in **`src/index.css`**. Naming follows **Block — Element — Modifier**:

| Pattern | Meaning | Example |
|--------|---------|---------|
| `block-name` | Standalone UI component | `site-header`, `lift-log-form` |
| `block-name__element` | Part of a block | `form-field__label` |
| `block-name--modifier` | Variant / state | `btn--primary`, `segment-control__option--active` |

Composition: put **blocks** together with **`layout-*`** primitives (Flex helpers), e.g.

`surface-card surface-card--pad-md layout-stack layout-stack--gap-md`.

## Primitive layout blocks

- **`layout-stack`** — vertical flex; gap via `layout-stack--gap-xxs | xs | sm | md`; alignment via `layout-stack--align-start | align-end`.
- **`layout-row`** — horizontal flex; `layout-row--gap-sm`; `layout-row--spread`; `layout-row--wrap`.

## Typography block

- **`type-heading`** + `type-heading--level-1` … `--level-3`
- **`type-body`** + `type-body--muted`, `--small`, `--tiny`, `--strong`, `--center`

## Form block

- **`form-field`** with **`form-field__label`**, **`form-field__control`**
- Native date quirks: **`form-field__control--native-date`** (Safari sizing / WebKit pseudos documented in CSS)

## Surfaces

- **`surface-card`** — elevated panel; padding `surface-card--pad-sm | --pad-md`

## Block inventory (components)

| Block | Role |
|-------|------|
| `app-shell` | Root layout wrapper |
| `site-header` | Sticky nav |
| `page-shell` | Horizontal safe-area + vertical page gutters |
| `exercise-dashboard` | Home route root (marker; layout via layout-stack) |
| `exercise-list` | List section on home |
| `exercise-row` | Interactive row linking to lift detail |
| `lift-detail` | Exercise detail route |
| `lift-detail-error` | Unknown exercise fallback |
| `stat-tile` | Summary number card |
| `progress-panel` | Chart card (marker) |
| `progress-chart` | Chart viewport (`progress-chart__viewport`) |
| `lift-log-form` | “Log sets” form |
| `lift-history` | History section |
| `lift-history-entry` | Single history row |
| `settings-sheet` | Modal settings |
| `segment-control` | Pill / segmented toggles |
| `data-backup` | Import/export backup |
| `form-field` | Label + control stack |
| `surface-card` | Elevated bordered panel |
| `btn`, `layout-*`, `type-*` | Shared primitives |
