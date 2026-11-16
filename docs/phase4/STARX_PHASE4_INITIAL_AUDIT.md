# Phase 4 initial audit — cinematic motion

Date: 2026-11-15. Root verified: `C:\Web Apps\starx-flow`.

## Repository and safety

- Next.js App Router app in `src/app`, reusable components in `src/components`, styles in `src/styles`, existing cursor implementation in both `src/components/CustomCursor.tsx` and `src/cursor/`, motion tokens in `src/lib/motionVariants.ts`.
- `public/assets` contains the current WebP environment/reference images. `tests`, `scripts`, `screenshots`, `test-results`, `docs` and historical ZIP backups already exist. No new project or documentation tree is needed; these reports use the existing `docs/phase4` directory. Its older numbered files concern a separate SEO phase and remain untouched.
- Initial Git state: modified `next-env.d.ts`; numerous untracked assets, screenshots, reconstruction scripts and `starx_flow.html`. All pre-existing work is retained. No commit, push, preview or deployment is authorized or performed.
- `BACKUP_MANIFEST.md` and previous reports describe a sibling backup and historical Git checkpoints. They have not been restored, modified, or independently hash-verified for this task.
- No applicable `AGENTS.md` was found in the repository or its parent directories.

## Actual references

Read current `STARX_PHASE3_PROGRESS.md`, `STARX_HOMEPAGE_IMPLEMENTATION_PROGRESS.md`, `STARX_REFERENCE_DESIGN_ANALYSIS.md`, `STARX_INTERACTION_INVENTORY.md`, `STARX_FUNCTIONAL_TEST_REPORT.md`, and existing motion, cursor, liquid-glass and visibility-restoration specifications/reports. Historical reports contain claims that do not match the current source; current source and browser observations take precedence.

Of the ten proposed reference filenames, only `STARX_PHASE3_PROGRESS.md` exists. The proposed master context, pixel reconstruction, object catalog, lighting, motion, scroll, interaction, responsive/performance and roadmap filenames are absent. Related historical files listed above provide context.

## Homepage architecture and 3D

`src/app/page.tsx` renders `StarXFlowLanding` plus SEO markup. `ClientShell` provides the two global auth/demo modals, mobile floating navigation, cursor and a default-visible page wrapper. The current homepage does **not** mount the older `src/components/spatial/*` scene system.

`StarXFlowLanding.tsx` is a large, 2,500+ line client component with two consecutive areas:

1. A proportional 1440 × 2362 canvas, sized with container units (`--u: 100cqw / 1440`), holding hero, connected operations/challenges, smartphone, six capabilities and two pricing panels. All content is absolutely positioned. The five section wrappers have zero height at the same top coordinate, confirmed in Chromium. Ordinary anchor scrolling therefore targets the wrong position.
2. A flowing Tailwind extension with the AI receptionist demo, ROI calculator, integrations, onboarding, operational detail, customer segments, guarantees, three-tier pricing, FAQ and footer. Preserve this existing order, despite the historical “12 scenes” labels.

The portal, elliptical pedestal, card bodies, phone casing, fragmented platforms and central connected-operations orb are baked into `/assets/starx_clean_env.webp`. Live text, SVG lines and controls overlay that image. The alternative CSS/SVG sanctuary is already present but not fully wired. There is **no mounted Three.js/WebGL/canvas scene, no independent meshes and no central orb in the hero**. Independent rotation of baked objects would require new source layers or a redesign. Phase 4 must not pretend that DOM text movement constitutes independent geometry animation. A shared restrained camera can move the backdrop and overlay together; local reflections and very small surface motion can enhance existing objects without replacing their geometry.

## Motion, pointer and materials

- Installed `motion` supplies existing Framer Motion APIs. Shared durations/easing/springs and viewport/visibility hooks exist. `MotionConfig reducedMotion="user"` is mounted globally. `PageTransition` intentionally renders immediately visible content after an earlier P0 visibility incident.
- Homepage section reveal CSS currently resolves to visible/no transform. The connecting beam has an infinite drop-shadow animation; inspector contains an infinite ping. Neither is viewport gated.
- Homepage `onMouseMove` updates React state for every mouse event, rerendering the entire landing component; its `--mx/--my` variables are unused.
- The mounted cursor is `src/components/CustomCursor.tsx`, not the older provider. It renders a dot, ring **and third blurred follower**, has incomplete editable/selection fallback, and checks coarse pointer only at mount. Reuse/refine the mounted system rather than mount another.
- Baseline glass uses gradients, inset shadows, borders and blur (8–16 px in places). Do not add animated filters or duplicate the material system. Extend with bounded, low-opacity transform/opacity reflections.

## Dependencies and scripts

Installed: Next 16.2.7, React/React DOM 19.2.5, Motion 12.38.0, Tailwind 4.3.0, TypeScript 5.8.3, Playwright 1.65.0. No new runtime dependency is warranted.

Scripts: `dev`, `build` (`next build --webpack`), `start`, `typecheck`, `lint`, plus SEO/security/integrity/visual checks. `lint` points at removed Next 16 command `next lint`; baseline invocation fails with “Invalid project directory … /lint”. No ESLint dependency/config exists. `test:visual` names a missing file. Many historical tests target obsolete homepage components, production endpoints or authenticated data; inspect before execution, and do not submit live forms or billing actions for motion QA.

The Playwright-managed browser is absent. Installed Chrome works via its explicit executable path. The local dev server required execution outside the restricted sandbox; it remains local at `127.0.0.1:3000`.

## Phase 3 readiness — partial, not complete

Browser baseline loaded with no page exceptions and both environment images loaded. Source confirms working workflow state, booking-slot state, calendar selection, receptionist simulator, ROI computation and global signup/login triggers. These will be exercised again with assertions. The FAQ is six always-visible static cards; the historical claim of native accordion controls was disproved during detailed QA. The initial audit's inherited accordion description was corrected accordingly; no new disclosure controls are added.

Specific existing gaps:

- Capability modal state never controls its permanently `hidden` markup; titles/subtitles are hard-coded. Its unused form falsely claims provisioning without a backend. This is a Phase 3 blocker, not a motion feature. Repair the detail dialog and route its existing enable action to the real signup flow; do not implement fake provisioning.
- Orbital selection, hero slot highlight/customer slot text, pure-CSS mode and X-ray percentage have stale/hard-coded presentation.
- Zero-height scene wrappers break anchor navigation.
- Mobile architectural canvas is a scaled desktop composition: at 360 px, phone text measures **3.2 px**; at 390 px, **3.47 px**; at 768 px, **6.83 px**. This pre-existing readability/touch-target blocker cannot be solved while preserving the explicitly locked mobile layout. The flowing extension and existing mobile navigation are separate and responsive. Do not mark mobile design acceptance complete.
- Stage has `user-select:none`; text selection must be restored without altering geometry.
- Inspector is visible in the baseline and can cover content. Preserve its layout rather than silently redesigning approved content.

## Baseline evidence

Before application changes, captured full-page static screenshots at all eight requested sizes in `test-results/phase4/baseline-WIDTHxHEIGHT.png`; `baseline-1440.png` is the first reference. Capture disables animation/transition CSS and uses reduced-motion emulation. Measurements are in `test-results/phase4/baseline-metrics.json`. All eight have document width equal to viewport width. Capture uses installed headless Chrome, not an Iris Xe hardware benchmark.

## Implementation sequence and gates

1. Extend shared tokens; add a scoped default-visible engine and `?motion=off`; typecheck/build.
2. Hero: coherent camera, portal/pedestal reflections, bounded DOM surface float; compare static output.
3. Connected operations: coordinated nodes/paths, core illumination, preserve baked platform geometry.
4. Product: keep phone casing/screen aligned; interaction-driven screen/confirmation transitions.
5. Six capabilities: readable stagger, bounded lift/tilt/light; fix the existing detail dialog dependency.
6. Pricing: restrained elevation/entrance for both existing pricing areas; preserve amounts/actions.
7. Scroll: coordinate scene progress without scroll interception; repair anchor offsets; viewport/visibility gating.
8. Pointer/cursor: one shared fine-pointer stream, no per-pointer React state, two followers, native editing/selection and touch fallback.
9. Measure all viewports, reduced motion, animation failure, offscreen/hidden cleanup and frame timing; fix regressions.
10. Run relevant local tests/typecheck/build/lint attempt, screenshot comparison, and publish accurate reports including unresolved Phase 3 and baked-geometry limitations.
