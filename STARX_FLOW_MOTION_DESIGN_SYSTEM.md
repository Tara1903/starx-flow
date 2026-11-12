# STARX FLOW — FLAGSHIP MOTION & INTERACTION DESIGN SYSTEM 1.0

**Scope:** StarX Flow (`https://starx-flow.runs-on.dev`) across Public Website, Authentication & 8-Character OTP, Authenticated Dashboard Workspace, and Internal Administration.  
**Exclusions:** StarX Alpha Labs (`/collections` & 160 demos) is completely isolated and never inherits these tokens or wrappers.

---

## 1. Visual & Brand Contract
- **Palette:** Deep black/obsidian surfaces (`#000000`, `#030706`, `#050b08`) accented exclusively by StarX Flow emerald (`#10b981`, `#34d399`, `#047857`) and high-contrast white/zinc typography.
- **Liquid Glass:** Translucent frosted obsidian containers (`backdrop-blur-md` / capped `backdrop-blur-xl` without stacking nested blurs over continuously animating layers) paired with subtle 1px emerald specular highlights.
- **Custom Cursor 2.0 Integration:** `6px` `0ms` inner white dot + damped-spring translucent dark emerald outer orb + button color inversion + localized outer-orb button spotlight (`[data-cursor-spotlight="button"]` `54px` radial pool synced via `onRingFrame`).

---

## 2. Duration Tokens (`MOTION_DURATION`)

| Interaction Category | Token Key | Target (s) | Milliseconds |
|---|---|---:|---:|
| Button press | `press` | `0.11` | `110ms` |
| Icon hover micro-nudge | `iconHover` | `0.15` | `150ms` |
| Button color inversion | `buttonInvert` | `0.19` | `190ms` |
| Dropdown / popover expand | `dropdown` | `0.20` | `200ms` |
| Card elevation / spotlight | `card` | `0.21` | `210ms` |
| Modal / sheet entrance | `modal` | `0.24` | `240ms` |
| Route / page transition | `page` | `0.26` | `260ms` |
| Section scroll reveal | `sectionReveal` | `0.42` | `420ms` |
| Hero choreography | `heroChoreography` | `0.58` | `580ms` |

---

## 3. Three Easing Families

1. **Smooth Deceleration (`MOTION_EASE`):**
   - `premium`: `[0.16, 1, 0.3, 1]` — primary entrances, sections, dropdowns, modals, button transitions.
   - `snappy`: `[0.22, 1, 0.36, 1]` — quick interactive feedback, tab switches, tooltips.
   - `smooth`: `[0.25, 0.1, 0.25, 1]` — cross-fades and chart transitions.
   - `exit`: `[0.4, 0, 1, 1]` — crisp dismissal of overlays/drawers.
2. **Spring Physics (`MOTION_SPRINGS`):**
   - `sidebar`: `{ type: "spring", stiffness: 320, damping: 30, mass: 0.78 }` — expanding desktop glass dock & drawer panels.
   - `navPill`: `{ type: "spring", stiffness: 420, damping: 32, mass: 0.7 }` — desktop & mobile bottom navigation capsules (`layoutId`).
   - `modal`: `{ type: "spring", stiffness: 320, damping: 26, mass: 0.78 }` — modal & dialog pop-in.
   - `otp`: `{ type: "spring", stiffness: 460, damping: 28, mass: 0.55 }` — individual 8-character OTP cell entry/focus.
   - `liquid`: `{ type: "spring", stiffness: 340, damping: 26, mass: 0.72 }` — liquid glass interactive lift & tab slides.
3. **Scroll-Linked Progression:**
   - Sticky/pinned demonstrations (`ProductStorytelling` / `Demo`) use normalized progress `[0, 1]` driven via GPU transforms/opacity with automatic fallback to discrete clickable steps under `prefers-reduced-motion` or small viewports.

---

## 4. Five Global Motion Engines

| Engine | Responsibility | Primitives / Modules |
|---|---|---|
| **A — Entrance & Reveal** | Section reveal, headline stagger, grid stagger, clip/image reveal, list insert/remove | `ScrollReveal`, `AnimatedSection`, `AnimatedText`, `motionVariants.ts` |
| **B — Interaction & Lighting** | Button inversion, press tactile feedback, card hover lift, localized outer-orb spotlight, magnetic CTAs, toggles, tabs, dropdowns | `GlassButton`, `GlassCard`, `AnimatedTabs`, `GlassDropdown`, `GlassToggle`, `CursorProvider` |
| **C — Navigation & Transition** | Sticky scrolled public nav, expanding glass sidebar, mobile floating capsule, dialogs/sheets, non-blocking route transitions | `Navbar`, `MobileFloatingNavigation`, `DashboardSidebar`, `GlassModal`, `GlassSheet`, `PageTransition` |
| **D — Scroll Storytelling** | Pinned desktop demos, chapter transitions, viewport-gated playback | `useInViewport`, `useIsDocumentVisible`, `Demo`, `HowItWorks` |
| **E — Product Animation** | Live product state machines: WhatsApp typing/delivery, AI Voice listening/speaking waveforms, Workflow node execution flow, CRM pipeline state, Analytics charts | `Hero`, `ConversationsSection`, `VoiceSection`, `WorkflowEditor`, `AnalyticsSection`, `OTPInput` |

---

## 5. Responsive, Accessibility & Performance Contracts
- **GPU Compositing Only:** Animate `transform` (`x`, `y`, `scale`) and `opacity`; never animate layout properties (`height`, `left`, `top`) on per-frame paths. Sidebar width transitions use controlled GPU-composited container transitions without per-frame DOM measurements.
- **Viewport & Visibility Gating:** Looping showcases (`Hero` chat loop, `SocialProof` marquee, live waveform simulations) suspend via `useInViewport` + `useIsDocumentVisible` when scrolled offscreen or when the browser tab is hidden.
- **Reduced Motion:** `MotionConfig reducedMotion="user"` wraps the StarX Flow app root (`ClientShell`), collapsing continuous loops, spring overshoots, and spatial transforms into crisp `< 10ms` instant opacity states.
- **Browser Zoom Stability (`100%–250%`):** Zero `ResizeObserver` feedback loops, zero `0px+` horizontal overflow, unified debounced viewport measurement.
- **Mobile Adaptation (`< 768px`):** Desktop custom cursor disabled; magnetic attraction disabled; shorter durations (`<= 220ms`); safe-area padding on floating bottom capsule and sheets.
