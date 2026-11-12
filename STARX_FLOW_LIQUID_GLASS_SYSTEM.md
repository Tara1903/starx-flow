# STARX FLOW — LIQUID GLASS DESIGN SYSTEM SPECIFICATION 1.0

## 1. Vision & Material Philosophy

The StarX Flow Liquid Glass Design System transforms the interface into a spatial, luminous, and tactile physical surface. Inspired by modern spatial computing interfaces, Apple glass aesthetics, and premium obsidian-emerald SaaS consoles, Liquid Glass is defined by:

1. **True Translucency:** Backgrounds, ambients, and underlying interfaces remain softly visible through the material; surfaces are never flat, matte, or opaque black.
2. **Refractive Depth & Color Filtration:** Transmitted light is subtly tinted with obsidian-emerald hues (`#10b981`, `#34d399`, `#059669`) without ever shifting into purple or blue.
3. **Multi-Stop Specular Highlights:** Crisp 1px top-edge highlights simulate light striking the upper bevel of polished glass (`rgba(255, 255, 255, 0.45)` transitioning to `rgba(52, 211, 153, 0.35)`).
4. **Internal Refraction & Sheen:** Soft diagonal light gradients and inner glows (`inset 0 1.5px 0 ...`, `inset 0 0 24px ...`) provide volume and surface curvature.
5. **Layered Elevation Shadows:** Diffuse ambient shadows combined with subtle emerald ground reflections (`0 16px 44px rgba(0, 0, 0, 0.55), 0 0 28px rgba(16, 185, 129, 0.08)`).
6. **Performance-First GPU Architecture:** All specular highlights, refraction sheens, and edge reflections are executed via CSS pseudo-elements (`::before`, `::after`) and hardware-composited `transform` / `box-shadow` properties, preventing layout thrashing and preserving 100%–250% browser zoom stability.

---

## 2. Three-Tier Glass Surface Hierarchy

```
+-------------------------------------------------------------------------------+
| TIER 3: FOCAL LIQUID GLASS                                                    |
| Hero Product Showcase, Primary Modals, Command Palette, Featured Pricing Card |
| Blur: 18px-20px | Translucency: 42%-55% | Specular: 0.35-0.55 | Glow: Emerald |
+-------------------------------------------------------------------------------+
       |
       v
+-------------------------------------------------------------------------------+
| TIER 2: PREMIUM GLASS                                                         |
| Navbar Capsule, Dashboard Sidebar Dock, Top Bar, Feature Cards, Floating Nav  |
| Blur: 14px-16px | Translucency: 50%-65% | Specular: 0.22-0.35 | Glow: Subtle  |
+-------------------------------------------------------------------------------+
       |
       v
+-------------------------------------------------------------------------------+
| TIER 1: SUBTLE GLASS                                                          |
| Secondary Widgets, Feed Items, Table Containers, Toolbars, Inline Pills       |
| Blur: 8px-10px  | Translucency: 65%-80% | Specular: 0.12-0.18 | Glow: Minimal |
+-------------------------------------------------------------------------------+
```

### 2.1 Tier 1 — Subtle Glass (`.glass-subtle` / `.glass-mist`)
- **Use Cases:** Secondary metric widgets, activity feed rows, data table headers, inline contextual tags, tab backgrounds.
- **Translucent Base:** `linear-gradient(150deg, rgba(255, 255, 255, 0.03) 0%, rgba(16, 185, 129, 0.02) 50%, rgba(4, 10, 8, 0.45) 100%)`
- **Backdrop Filter:** `blur(8px) saturate(125%)`
- **Border:** `1px solid rgba(255, 255, 255, 0.08)`
- **Specular Highlight:** `inset 0 1px 0 rgba(255, 255, 255, 0.12)`
- **Shadow:** `0 4px 18px rgba(0, 0, 0, 0.28)`

### 2.2 Tier 2 — Premium Glass (`.glass-premium` / `.glass-panel` / `.glass-card-obsidian`)
- **Use Cases:** Scrolled Navbar capsule, Dashboard Sidebar dock, Dashboard Top Bar, Feature cards, Mobile floating capsule (`.glass-capsule-nav`), dropdown panels.
- **Translucent Base:** `linear-gradient(145deg, rgba(26, 52, 41, 0.42) 0%, rgba(10, 22, 17, 0.52) 55%, rgba(5, 12, 10, 0.64) 100%)`
- **Backdrop Filter:** `blur(14px) saturate(140%)`
- **Border:** `1px solid rgba(255, 255, 255, 0.15)`
- **Specular Highlight:** Top-edge pseudo-element highlight `linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.35) 45%, rgba(52, 211, 153, 0.28) 55%, transparent 95%)`
- **Inner Depth:** `inset 0 1.5px 0 rgba(255, 255, 255, 0.24), inset 1px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.35)`
- **Shadow:** `0 16px 44px rgba(0, 0, 0, 0.5), 0 0 24px rgba(16, 185, 129, 0.08)`

### 2.3 Tier 3 — Focal Liquid Glass (`.glass-focal` / `.glass-hero` / `.liquid-glass`)
- **Use Cases:** Hero product showcase window chrome, live preview mode containers, Command Center (`⌘K`), Pro/Popular Pricing Card, primary modals (`SignupModal`, `IntegrationModal`).
- **Translucent Base:** `linear-gradient(155deg, rgba(32, 64, 50, 0.48) 0%, rgba(12, 26, 20, 0.58) 50%, rgba(6, 14, 11, 0.70) 100%)`
- **Backdrop Filter:** `blur(18px) saturate(150%)`
- **Border:** `1px solid rgba(52, 211, 153, 0.32)`
- **Specular Highlight:** Intense top-edge highlight `linear-gradient(90deg, transparent 2%, rgba(255, 255, 255, 0.5) 40%, rgba(52, 211, 153, 0.45) 60%, transparent 98%)`
- **Refraction Sheen:** Diagonal refraction pseudo-element `linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, transparent 40%, transparent 60%, rgba(16, 185, 129, 0.04) 100%)`
- **Inner Depth:** `inset 0 2px 0 rgba(255, 255, 255, 0.35), inset 1px 0 0 rgba(255, 255, 255, 0.12), inset 0 0 32px rgba(16, 185, 129, 0.06)`
- **Shadow:** `0 24px 64px rgba(0, 0, 0, 0.65), 0 0 45px rgba(16, 185, 129, 0.16)`

---

## 3. Glass Token Matrix (`src/app/globals.css`)

| Property / Token | Tier 1 (Subtle) | Tier 2 (Premium) | Tier 3 (Focal) |
|---|---|---|---|
| `--glass-tint` | `rgba(255, 255, 255, 0.025)` | `rgba(20, 42, 33, 0.42)` | `rgba(28, 58, 45, 0.50)` |
| `--glass-blur` | `8px` | `14px` | `18px` |
| `--glass-saturate` | `125%` | `140%` | `150%` |
| `--glass-border` | `rgba(255, 255, 255, 0.09)` | `rgba(255, 255, 255, 0.15)` | `rgba(52, 211, 153, 0.34)` |
| `--glass-specular` | `rgba(255, 255, 255, 0.16)` | `rgba(255, 255, 255, 0.35)` | `rgba(255, 255, 255, 0.52)` |
| `--glass-inset-highlight`| `inset 0 1px 0 rgba(255,255,255,0.12)` | `inset 0 1.5px 0 rgba(255,255,255,0.24)` | `inset 0 2px 0 rgba(255,255,255,0.35)` |
| `--glass-shadow` | `0 4px 20px rgba(0,0,0,0.3)` | `0 16px 44px rgba(0,0,0,0.5)` | `0 24px 64px rgba(0,0,0,0.65)` |
| `--glass-emerald-glow` | `none` | `0 0 24px rgba(16,185,129,0.08)` | `0 0 45px rgba(16,185,129,0.18)` |

---

## 4. Interaction & Micro-Motion Integration

1. **Hover Lift & Reflection Intensification (`.glass-interactive`):**
   - Translucent base brightens slightly (`transform: translateY(-2px) scale(1.01)`).
   - Top-edge specular highlight opacity increases by 25%.
   - Subtle emerald rim shadow intensifies without full-surface blinding glow.
2. **Pressed State:**
   - Scale compression `0.985` with inset shadow deepening (`inset 0 2px 6px rgba(0,0,0,0.4)`).
3. **Custom Cursor 2.0 Co-existence:**
   - Interactive glass surfaces declare `data-cursor-spotlight="true"` or `data-cursor-spotlight="button"`.
   - The localized outer-orb spotlight projects a radial emerald pool (`rgba(16, 185, 129, 0.16)`) through the translucent glass without disturbing the top-edge specular highlight.

---

## 5. Performance & Zoom Resilience Rules

1. **Zero Full-Viewport Filter Overlays:** No global fixed `<svg><feTurbulence>` filter or full-screen animated blurs.
2. **Bounded Backdrop Filters:** Backdrop blur is strictly confined to individual glass components with `contain: paint` or `overflow: hidden`.
3. **No Nested Blur Stacking:** Child items inside a glass panel must not declare their own heavy `backdrop-filter: blur(24px)`. They use subtle gradients with transparent fallbacks.
4. **Hardware Acceleration:** All specular gradients and sheen glide keyframes are pinned to `transform` and `opacity`.
5. **Zoom Stability (100%–250%):** Standard pixel-based border widths and viewport-relative percentages ensure zero horizontal overflow across all browser zoom levels.
