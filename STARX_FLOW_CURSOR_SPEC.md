# STARX FLOW — CUSTOM CURSOR 2.0 SPECIFICATION

## 1. Visual Architecture & Brand Contract

StarX Flow Custom Cursor 2.0 implements a two-element physics cursor + coordinated surface interaction system strictly tailored to StarX Flow's black & emerald glass design language.

### Exact Cursor Elements (Strictly 2 Visual Trackers)
1. **Inner Dot (`[data-testid="starx-cursor-dot"]`)**
   - `6px × 6px` pure light focal point (`#fafafa`, expanding slightly for legibility on hover).
   - Tracks physical pointer viewport coordinates `(clientX, clientY)` directly with **0ms delay**.
2. **Outer Circle (`[data-testid="starx-cursor-ring"]`)**
   - `34px × 34px` thin emerald ring (`1.5px solid #10b981`, soft ambient emerald glow).
   - Follows the **inner dot's position** (never an independent raw mouse target) via a frame-rate-independent damped second-order spring (`stiffness: 300`, `damping: 29`, sub-stepped up to `1/120s`, clamped max frame delta `0.2s`).
   - Expands smoothly to `52px` on hover targets, `66px` when presenting an inline contextual label (`VIEW`, `OPEN`, `DRAG`, `PLAY`, `EXPLORE`), and scales by `0.78×` on pointer compression (`click`).

## 2. CSS Design Tokens (`src/app/globals.css`)
- `--sx-cursor-dot`: `#fafafa`
- `--sx-cursor-ring`: `#10b981`
- `--sx-cursor-ring-active`: `#34d399`
- `--sx-cursor-danger`: `#f87171`
- `--sx-cursor-ease`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `--sx-spotlight-color`: `rgba(16, 185, 129, 0.16)`

## 3. Interaction States
| State | Trigger | Inner Dot | Outer Ring | Native OS Pointer |
|---|---|---|---|---|
| `default` | Active desktop fine pointer (`hover: hover` & `pointer: fine`) | `6px` `#fafafa` at 0ms pointer | `34px` emerald ring, soft glow | Hidden when `html.starx-cursor-enabled.starx-cursor-active` |
| `hover` | Buttons, links, `[data-cursor-hover="true"]`, `[role="button"]` | Centered at pointer | Expands to `52px`, `#34d399`, brighter border glow | Hidden |
| `click` | `pointerdown` while interactive/default | Subtle `0.85×` pulse | Compresses (`0.78×`) with fast recovery | Preserved |
| `label` | `[data-cursor-label="VIEW \| OPEN \| ..."]` | Hidden/recessed behind badge pill | Expands to `66px` containing crisp monospace badge inside the outer ring (no 3rd tracker) | Hidden |
| `disabled` | `button:disabled`, `aria-disabled="true"`, `[data-cursor-disabled="true"]` | Dimmed zinc dot (`#71717a`) | `38px` muted gray dashed ring | Disabled form inputs restore `not-allowed`; disabled buttons render custom subdued ring |
| `native` | Inputs, textareas, `contenteditable`, `<select>`, `<iframe>`, text selection | Hidden | Hidden | Native OS I-beam / cursor restored immediately |

## 4. Data Attribute Contract
- `data-cursor-hover="true" | "false"`: Forces or suppresses interactive ring expansion.
- `data-cursor-mode="default" | "hover" | "click" | "label" | "disabled" | "native"`: Explicit mode override.
- `data-cursor-label="VIEW" | "OPEN" | "DRAG" | "PLAY" | "EXPLORE"`: Renders contextual mode text inside the single outer circle.
- `data-cursor-invert="primary" | "secondary" | "outline" | "white" | "ghost" | "focus" | "danger"`: Coordinates synchronized button surface + text color inversion with cursor hover and `:focus-visible`.
- `data-cursor-magnetic="none" | "low" | "medium" | "high"`: Enables bounded local magnetic attraction on high-priority CTAs.
- `data-cursor-spotlight="true" | "false"`: Enables GPU-friendly emerald radial lighting on hover cards without nested backdrop filters.
- `data-cursor-disabled="true"`: Restores native pointer behavior and marks surface non-interactive.

## 5. Synchronized Button Color Inversion (`GlassButton`)
- **`primary`**: Emerald gradient + `#02120c` text → inverts on hover / keyboard `:focus-visible` to crisp **white `#ffffff` surface + dark `#02120c` text**.
- **`secondary`**: Dark translucent glass + `#f4f4f5` light text + subtle emerald outline → inverts to **emerald `#10b981` fill + dark `#02120c` text**.
- **`outline`**: Transparent/obsidian surface + emerald border & `#34d399` text → inverts to **emerald `#10b981` fill + dark `#02120c` text**.
- **`white`**: Pure **white `#ffffff` surface + dark `#050a08` text** → inverts to **dark `#0a0f0d` surface + `#fafafa` white text** with crisp emerald border highlight.
- **`danger`**: Translucent ruby surface + `#fca5a5` text → transitions cleanly to accessible high-contrast red inversion (`#ef4444` / `#fff`) while signaling destructive cursor tone.

## 6. Exclusions & Accessibility Guarantees
- **StarX Alpha Labs & 160 Business Demos (`/collections`)**: Strictly excluded from custom cursor overrides and code changes.
- **Touch Devices (`pointer: coarse` / `hover: none`)**: Custom cursor never mounts or renders; native touch behavior untouched.
- **Reduced Motion (`prefers-reduced-motion: reduce`)**: Magnetic translation disabled; outer follower snaps directly without elastic trail lag; button inversion still communicates state instantaneously via color contrast.
- **Keyboard Users**: `:focus-visible` mirrors hover color inversion so keyboard navigation receives identical visual clarity.
