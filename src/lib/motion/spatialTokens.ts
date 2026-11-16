import { MOTION_DURATION, MOTION_EASE, MOTION_SPRINGS } from '../motionVariants';

/** Phase 4 extends the established motion language; distances are CSS pixels. */
export const SPATIAL_MOTION = {
  duration: { ...MOTION_DURATION, environment: 8.4, notification: 0.32 },
  easing: `cubic-bezier(${MOTION_EASE.premium.join(',')})`,
  spring: MOTION_SPRINGS.liquid,
  stagger: 65,
  perspective: 2200,
  camera: { translation: 1.2, rotation: 0.055, settlingMs: 170 },
  cursor: { stiffness: 300, damping: 35, hoverScale: 1.5 },
  pointer: { sensitivity: 0.8, tilt: 0.7, magnetic: 2.5 },
  lighting: { surface: 0.075, environment: 0.055 },
  scale: { pressed: 0.99, resting: 1 },
  depth: { environment: 0.2, structure: 0.4, surface: 0.7, foreground: 1 },
  priority: { interaction: 3, entrance: 2, ambient: 1 },
  maxAmbient: 8,
  profiles: {
    desktop: { distance: 1, ambient: true, pointer: true },
    tablet: { distance: 0.4, ambient: false, pointer: false },
    mobile: { distance: 0.2, ambient: false, pointer: false },
    off: { distance: 0, ambient: false, pointer: false },
  },
} as const;

export type SpatialProfile = keyof typeof SPATIAL_MOTION.profiles;
export const clamp = (value: number, min = -1, max = 1) => Math.min(max, Math.max(min, value));

export function motionDisabled() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    new URLSearchParams(window.location.search).get('motion') === 'off';
}

export function spatialProfile(): SpatialProfile {
  if (motionDisabled()) return 'off';
  if (window.innerWidth < 768) return 'mobile';
  return window.innerWidth >= 1100 && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ? 'desktop' : 'tablet';
}

export interface SpatialSurface {
  selector: string;
  scene: 'hero' | 'operations' | 'product' | 'capabilities' | 'pricing' | 'story';
  float?: number;
  entrance?: number;
  tilt?: number;
  lift?: number;
  light?: boolean;
  depth?: number;
  travel?: number;
  magnetic?: boolean;
}

// Register the existing elements batch by batch. Never alter their base transforms.
export const SPATIAL_SURFACES: SpatialSurface[] = [
  { selector: '#hero-bookings-tablet', scene: 'hero', float: 0.65, depth: 0.3 },
  { selector: '#hero-whatsapp-card', scene: 'hero', float: 1.1, light: true, depth: 0.8 },
  { selector: '#hero-ai-card', scene: 'hero', float: 0.8, light: true, depth: 0.6 },
  { selector: '#hero-customer-card', scene: 'hero', float: 0.9, light: true, depth: 0.7 },
  { selector: '.sx-portal-reflection, .sx-pedestal-reflection', scene: 'hero', float: 2, depth: 0.2 },
  { selector: '#challenge-section > button.glass-shell', scene: 'operations', float: 0.5, light: true, depth: 0.25 },
  { selector: '#challenge-section .orbital-node-btn', scene: 'operations', float: 0.7, depth: 0.55 },
  { selector: '#operations-connections', scene: 'operations', depth: 0 },
  { selector: '#btn-center-orb', scene: 'operations', light: true, depth: 0.15 },
  { selector: '#phone-3d-screen', scene: 'product', entrance: 1.5, depth: 0 },
  { selector: '#action-confirmed-card', scene: 'product', float: 0.9, entrance: 2, light: true, depth: 0.4 },
  { selector: '#product-connection', scene: 'product', depth: 0 },
  { selector: '#capabilities-section > button', scene: 'capabilities', entrance: 5, lift: 2, tilt: 0.7, light: true, depth: 0.5 },
  { selector: '#pricing-card-solo, #pricing-card-group', scene: 'pricing', entrance: 3, lift: 1, light: true, depth: 0.2 },
  { selector: '#scene-pricing-comparison .spatial-glass-card', scene: 'pricing', entrance: 7, lift: 2, light: true, depth: 0.2 },
  { selector: '#scene-onboarding .spatial-glass-card', scene: 'story', entrance: 10, travel: 6, depth: 0.4 },
  { selector: '#scene-customer-segments .spatial-glass-card', scene: 'story', entrance: 6, travel: 4, depth: 0.3 },
  { selector: '#hero-section > button.btn-mint-pill, #btn-nav-get-started', scene: 'hero', magnetic: true, lift: 0, depth: 0 },
];

export const STAGE_SCENES = [
  { id: 'hero-section', start: 0, end: 756 },
  { id: 'challenge-section', start: 756, end: 1250 },
  { id: 'action-section', start: 1250, end: 1730 },
  { id: 'capabilities-section', start: 1730, end: 1965 },
  { id: 'pricing-section', start: 1965, end: 2362 },
] as const;
