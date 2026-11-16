/** One lazy, shared pointer listener. Coordinates never pass through React state. */
export type SpatialPointer = {
  x: number;
  y: number;
  target: Element | null;
  active: boolean;
};
type Listener = (pointer: SpatialPointer) => void;
const listeners = new Set<Listener>();
let current: SpatialPointer = { x: -100, y: -100, target: null, active: false };

function emit() { listeners.forEach(listener => listener(current)); }
function move(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return;
  current = { x: event.clientX, y: event.clientY, target: event.target instanceof Element ? event.target : null, active: true };
  emit();
}
function leave() { current = { ...current, target: null, active: false }; emit(); }
function visibility() { if (document.hidden) leave(); }

export function subscribePointer(listener: Listener) {
  if (!listeners.size) {
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    document.addEventListener('visibilitychange', visibility);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      document.removeEventListener('visibilitychange', visibility);
      current = { x: -100, y: -100, target: null, active: false };
    }
  };
}
