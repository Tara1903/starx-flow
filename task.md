# Phase 6: Liquid-Glass Implementation Plan

## Goal: Dashboard, Onboarding, and Operational Surfaces

- [x] **Dashboard Sections**
  - Use glass-panel for standard widgets
  - Use glass-focus for selected states (inbox items, workflow nodes)
  - Empty/loading/error/success states use glass panels and motion variants

- [x] **Onboarding Steps**
  - Differentiate Connected, Configured, Completed states
  - Apply glass system to all onboarding step cards
  - Replaced bg-[#0a0a0a] and bg-[#111] with glass-panel

# Phase 5: Liquid-Glass Implementation Plan

## Goal: Conversion and Decision Clarity

- [x] **src/components/Hero.tsx**
  - Secondary CTA updated to guided demo action (smooth-scroll to `#solutions`, applies temporary `.spotlight-active` class to Demo stage for 1.5s).
  - Added stronger depth separation between copy block and interactive simulation. Used `.glass-hero` on the simulation container.

- [x] **src/components/Demo.tsx**
  - Control deck selector feels like a glass control deck with stronger selected-state depth (`.glass-panel`).
  - Added controlled 3D to phone frame and KPI cards (using `.glass-tilt` and `.glass-lift` classes).
  - Immediate updates on tab change with crossfade cleanly (`crossfadeSwap` from `src/lib/motionVariants.ts`).

- [x] **src/components/CTA.tsx**
  - Made CTA surface feel like high-priority hero-tier glass stage (`.glass-hero`).

- [x] **src/pages/Pricing.tsx**
  - Clearer ROI result block (visually separate recovered revenue from hours saved, using `.glass-focus` panels).
  - Made featured plan the brightest and deepest surface (`.glass-hero` with strong glow).

- [x] **src/pages/Resources.tsx**
  - Added chapter markers to masterclass player (visual UI elements).
  - Clarified media status, progress, controls (added Live badge, updated controls).
  - Improved success state of newsletter signup (used glass-panel for a better look without extra steps).

# Phase 7: Marketing Rhythm and Page Storytelling

- [x] **src/pages/Home.tsx**
  - Upgraded section rhythm with flex-col gap-32 wrapper.
  - Wrapped SocialProof/Problem in glass-panel and HowItWorks/Benefits in glass-hero for cohesion.

- [x] **src/pages/Product.tsx** & **src/pages/Features.tsx**
  - Modernized mock UI framing with glass-hero, glass-inner-sheen, and glass-edge-light classes.

- [x] **src/pages/About.tsx**
  - Improved tablet/mobile balance with adjusted paddings and font sizes.
  - Framed the founding story block in a glass-panel.

- [x] **src/pages/Privacy.tsx** & **src/pages/Terms.tsx**
  - Applied glass-mist wrapper.
  - Improved typography hierarchy with text-2xl/text-3xl headers and text-lg paragraphs instead of basic prose.

# Phase 4: Layout Responsiveness and Navigation

- [x] **src/components/Navbar.tsx**: Added GlassSheet mobile menu.
- [x] **src/components/dashboard/DashboardSidebar.tsx**: Added GlassSheet for bottom dock.
- [x] **src/components/dashboard/DashboardTopBar.tsx**: Collapsed labels and responsive layout.
- [x] **src/pages/setup/SetupLayout.tsx** & **SetupChecklist.tsx**: Added mobile sticky progress bar and sheet.
- [x] **src/pages/Pricing.tsx**: Responsive sizes for hero and ROI grid.
- [x] **src/pages/Resources.tsx**: Fixed newsletter and video modal for mobile.
- [x] **src/pages/Product.tsx** & **Features.tsx**: Adjusted responsive paddings and titles.
