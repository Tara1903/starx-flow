# StarX Flow Mobile — Emerald Liquid Glass Design System
**Version:** 2.0.0-PROD  
**Platform:** Kotlin Multiplatform / Compose Multiplatform (Android & iOS)  
**Visual Identity:** Emerald Liquid Glass (Apple Liquid Glass + Linear Usability)

---

## 1. Brand Philosophy & Identity

StarX Flow is an **AI Business Operating System**, not a trading terminal, cryptocurrency exchange, or generic admin portal.

### Core Visual Principles:
- **Premium, Not Flashy:** Controlled translucent glass layers with deep obsidian tones and emerald highlights.
- **Modern, Not Futuristic:** Purposeful ergonomics, clean typography, and high information density.
- **Glassy, Not Illegible:** Background opacity is calibrated to guarantee WCAG 2.1 AA text contrast across all lighting conditions.
- **Operations-First:** The primary hierarchy prioritizes **Business Operations, AI Workforce Fleet, and Customer Relationships**.

---

## 2. Color Palette & Tokens

### Backgrounds & Surfaces
| Token Name | Hex Code | Role | Description |
|:---|:---|:---|:---|
| `StarXBlack` | `#060B08` | Primary Background | Deepest obsidian canvas |
| `StarXSecondaryBg` | `#0B120E` | Secondary Background | Section headers, sheet backdrops |
| `StarXCharcoal` | `#0F1713` | Card Surface | Standard card base |
| `StarXElevatedSurface` | `#14221A` | Elevated Surface | Inbound chat bubbles, elevated cards |
| `StarXDarkSurface` | `#101C16` | Recessed Surface | Text inputs, track backgrounds |

### Brand Accents
| Token Name | Hex Code | Role | Description |
|:---|:---|:---|:---|
| `StarXGreen` | `#10B981` | Primary Emerald | Primary actions, active indicators, live status |
| `StarXFreshGreen` | `#34D399` | Fresh Green Accent | Secondary highlights, gradient blends |
| `StarXDarkGreen` | `#059669` | Deep Emerald | Pressed states, dark gradient stops |
| `StarXAccentGlow` | `0x3310B981` | Emerald Glow | 20% alpha glow for focal surfaces |

### Typography & Text
| Token Name | Hex Code | Contrast | Purpose |
|:---|:---|:---|:---|
| `StarXTextPrimary` | `#F5F7F5` | > 14:1 | Headings, primary metrics, active labels |
| `StarXTextSecondary` | `#A0AAA4` | > 7:1 | Body text, card descriptions, timestamps |
| `StarXTextMuted` | `#69766E` | > 4.5:1 | Metadata, placeholders, inactive tabs |

### Operational Status Tokens
| Token Name | Hex Code | Applied States |
|:---|:---|:---|
| `StarXStatusActive` | `#10B981` | Active, Confirmed, Qualified, Completed, Paid |
| `StarXStatusWarning` | `#F59E0B` | Pending, Needs Attention, Human Mode, Contacted |
| `StarXStatusError` | `#EF4444` | Cancelled, Lost, Failed, Unpaid, Disconnected |
| `StarXStatusInfo` | `#3B82F6` | Scheduled, Informational, Email Channel |

### Omnichannel Branding Tokens
| Channel | Hex Code | Purpose |
|:---|:---|:---|
| WhatsApp | `#25D366` | WhatsApp Cloud API badge & indicator |
| Instagram | `#E1306C` | Instagram Direct badge & indicator |
| Email | `#3B82F6` | Email provider integration |
| SMS | `#8B5CF6` | SMS Gateway identifier |
| Web Chat | `#10B981` | Embedded Web Chat widget |

---

## 3. The 3 Liquid Glass Tiers

```
┌────────────────────────────────────────────────────────┐
│  Tier 3: FOCAL GLASS (Floating Dock, Sheets, Dialogs)  │
│  Gradient: 0x3810B981 -> 0x3D14221A -> 0x9E0B120E       │
│  Border: StarXBorderActive (0x6634D399)                │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│  Tier 2: PREMIUM GLASS (KPI Cards, Top Bar, Agents)    │
│  Gradient: 0x1F10B981 -> 0x2E14221A -> 0x8A0F1713       │
│  Border: StarXBorderEmerald (0x3310B981)               │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│  Tier 1: SUBTLE GLASS (List Rows, Filter Chips, Tags)  │
│  Gradient: 0x0FFFFFFF -> 0x0A10B981 -> 0x550F1713       │
│  Border: StarXBorder (0x1FFFFFFF)                      │
└────────────────────────────────────────────────────────┘
```

---

## 4. Reusable Component Inventory

1. **`GlassSurface(tier, shape, content)`**: Foundational glassmorphic container engine.
2. **`StarXButton(text, onClick, enabled, isLoading, isSecondary, leadingIcon)`**: Physics-based interactive button with loading spinner and spring press scale.
3. **`StarXIconButton(icon, onClick, badgeCount, tint)`**: 40dp circular glass touch target with optional unread count badge.
4. **`StarXCard(modifier, shape, tier, onClick, content)`**: Elevated content container with subtle translucent border.
5. **`MetricCard(title, value, subtitle, changePercent, isPositive, icon)`**: Clean operational business metric card without crypto candlestick noise.
6. **`StarXTextField(value, onValueChange, placeholder, label, leadingIcon)`**: Form input with emerald focus border and error validation state.
7. **`StarXSearchBar(value, onValueChange, placeholder)`**: Compact search bar with clear button.
8. **`StarXAvatar(name, size, channel)`**: Customer and agent avatar generator with integrated omnichannel badge.
9. **`StatusIndicator(status)`**: Rounded pill with color-matched status dot and label.
10. **`StarXFilterChip(label, isSelected, onClick, badgeCount)`**: Interactive filter chip for channel and stage filtering.
11. **`AIResponseSuggestionChip(text, onClick)`**: Quick response reply pill for the chat composer.
12. **`StarXTopBar(title, subtitle, navigationIcon, actions)`**: Unified top bar with glass backing and action buttons.
13. **`EmptyState(title, description, icon, actionButtonText)`**: Polished zero-data layout.
14. **`ErrorState(message, onRetry)`**: Resilient error display with retry callback.
15. **`LoadingState(message)`**: Center-aligned spinner with brand styling.
