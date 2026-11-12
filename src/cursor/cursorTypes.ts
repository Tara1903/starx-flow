/**
 * Canonical TypeScript contracts for StarX Flow Custom Cursor 2.0.
 * High-frequency coordinates live purely in RAF refs; only discrete
 * interaction states enter Zustand.
 */

export type CursorMode =
  | 'default'
  | 'hover'
  | 'click'
  | 'label'
  | 'disabled'
  | 'native';

export type CursorButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'white'
  | 'ghost'
  | 'focus'
  | 'danger';

export type CursorContextualLabel = 'VIEW' | 'OPEN' | 'DRAG' | 'PLAY' | 'EXPLORE' | string;

export type MagneticStrengthLevel = 'none' | 'low' | 'medium' | 'high';

export interface CursorPhysicsConfig {
  /** Base outer ring diameter (px) in resting state */
  defaultRingSize: number;
  /** Expanded outer ring diameter (px) on interactive hover */
  hoverRingSize: number;
  /** Expanded outer ring diameter (px) when displaying contextual label */
  labelRingSize: number;
  /** Inner dot diameter (px) */
  dotSize: number;
  /** Spring stiffness driving outer ring -> inner dot convergence */
  outerStiffness: number;
  /** Critical damping coefficient preventing erratic overshoot */
  outerDamping: number;
  /** Scale multiplier applied during pointer down compression */
  clickCompressionScale: number;
  /** Default emerald ring glow radius/alpha scalar (0..2) */
  glowIntensity: number;
  /** Default magnetic attraction multiplier (0..1.5) */
  magneticStrength: number;
  /** Default card spotlight opacity scalar (0..1) */
  spotlightIntensity: number;
}

export interface CursorDataAttributes {
  'data-cursor-hover'?: 'true' | 'false';
  'data-cursor-mode'?: CursorMode;
  'data-cursor-label'?: CursorContextualLabel;
  'data-cursor-invert'?: CursorButtonVariant;
  'data-cursor-magnetic'?: MagneticStrengthLevel | 'true';
  'data-cursor-spotlight'?: 'true' | 'false';
  'data-cursor-disabled'?: 'true';
}

export interface CursorTelemetrySnapshot {
  dotX: number;
  dotY: number;
  ringX: number;
  ringY: number;
  ringVelocityX: number;
  ringVelocityY: number;
  lagDistancePx: number;
  mode: CursorMode;
  label: string | null;
  activeVariant: CursorButtonVariant | null;
  fpsEstimate: number;
}
