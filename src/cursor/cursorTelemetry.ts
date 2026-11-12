import { DEFAULT_CURSOR_PHYSICS } from './cursor.config';
import type { CursorTelemetrySnapshot } from './cursorTypes';

/**
 * High-frequency telemetry container kept strictly outside React state so
 * 60-144Hz pointer frames never allocate or trigger React re-renders.
 */
const telemetryState: CursorTelemetrySnapshot = {
  dotX: 0,
  dotY: 0,
  ringX: 0,
  ringY: 0,
  ringVelocityX: 0,
  ringVelocityY: 0,
  lagDistancePx: 0,
  mode: 'default',
  label: null,
  activeVariant: null,
  fpsEstimate: 60,
};

export function writeCursorTelemetry(partial: Partial<CursorTelemetrySnapshot>): void {
  Object.assign(telemetryState, partial);
}

export function getCursorTelemetrySnapshot(): CursorTelemetrySnapshot {
  return { ...telemetryState };
}

export function resetCursorTelemetry(): void {
  telemetryState.dotX = 0;
  telemetryState.dotY = 0;
  telemetryState.ringX = 0;
  telemetryState.ringY = 0;
  telemetryState.ringVelocityX = 0;
  telemetryState.ringVelocityY = 0;
  telemetryState.lagDistancePx = 0;
  telemetryState.mode = 'default';
  telemetryState.label = null;
  telemetryState.activeVariant = null;
  telemetryState.fpsEstimate = 60;
}

export const CURSOR_DEFAULT_RADIUS_PX = DEFAULT_CURSOR_PHYSICS.defaultRingSize / 2;
