import type { CursorPhysicsConfig, MagneticStrengthLevel } from './cursorTypes';

/**
 * Brand & interaction tokens grounded directly in StarX Flow's dark emerald palette
 * (`--surface-0: #000000`, `--accent: #10b981`, `--accent-light: #34d399`).
 */
export const CURSOR_VISUAL_TOKENS = {
  dotColor: '#fafafa',
  dotHoverColor: '#ffffff',
  dotDisabledColor: '#71717a',
  ringColor: '#047857',
  ringHoverColor: '#059669',
  orbFillRgba: 'rgba(4, 120, 87, 0.38)',
  orbHoverFillRgba: 'rgba(4, 120, 87, 0.36)',
  orbPrimaryFillRgba: 'rgba(6, 95, 70, 0.40)',
  orbEdgeRgba: 'rgba(16, 185, 129, 0.14)',
  ringDangerColor: '#f87171',
  ringDisabledColor: 'rgba(161, 161, 170, 0.28)',
  ringBorderWidthPx: 1,
  ringHoverBorderWidthPx: 1,
  glowBaseRgba: 'rgba(16, 185, 129, 0.14)',
  glowHoverRgba: 'rgba(16, 185, 129, 0.18)',
  glowDangerRgba: 'rgba(248, 113, 113, 0.20)',
  labelBgRgba: 'rgba(4, 57, 42, 0.86)',
  labelTextColor: '#ecfdf5',
  zIndex: 99998,
} as const;

/**
 * Default tuned dual-layer physics configuration:
 * Physical mouse -> Inner dot (0ms immediate) -> Outer circle (damped spring).
 */
export const DEFAULT_CURSOR_PHYSICS: CursorPhysicsConfig = {
  dotSize: 6,
  defaultRingSize: 46,
  hoverRingSize: 64,
  labelRingSize: 76,
  outerStiffness: 140,
  outerDamping: 20,
  followResponsiveness: 0.50,
  maxSeparationPx: 56,
  clickCompressionScale: 0.78,
  glowIntensity: 1,
  magneticStrength: 0.32,
  spotlightIntensity: 0.16,
};

export const MAGNETIC_STRENGTH_PRESETS: Record<
  MagneticStrengthLevel,
  { factor: number; maxDisplacementPx: number }
> = {
  none: { factor: 0, maxDisplacementPx: 0 },
  low: { factor: 0.18, maxDisplacementPx: 6 },
  medium: { factor: 0.32, maxDisplacementPx: 10 },
  high: { factor: 0.46, maxDisplacementPx: 14 },
};

/** Routes excluded from Custom Cursor 2.0 */
export const CURSOR_EXCLUDED_ROUTE_PREFIXES = [] as const;

/**
 * Native selector restore list: ensures OS pointer I-beam, resize handles,
 * disabled indicators, and embedded media frames always remain usable.
 */
export const NATIVE_CURSOR_SELECTOR = [
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]):not([type="reset"])',
  'textarea',
  '[contenteditable="true"]',
  '[contenteditable=""]',
  'select',
  'iframe',
  'video[controls]',
  '[data-cursor-mode="native"]',
  '.cursor-native',
].join(', ');

export const DISABLED_CURSOR_SELECTOR = [
  'button:disabled',
  'button[aria-disabled="true"]',
  '[role="button"][aria-disabled="true"]',
  'a[aria-disabled="true"]',
  '[data-cursor-disabled="true"]',
].join(', ');
