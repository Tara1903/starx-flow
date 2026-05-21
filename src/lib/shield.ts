import { useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────
   StarX Shield — Invisible Bot Detection
   Scores visitors 0-100 based on behavioral signals.
   Zero UI. Zero friction. Zero dependencies.
   ───────────────────────────────────────────── */

interface ShieldState {
  mouseCount: number;
  angles: number[];
  lastMouseX: number;
  lastMouseY: number;
  keyCount: number;
  keyGaps: number[];
  lastKeyTime: number;
  scrollCount: number;
  clickCount: number;
  focusCount: number;
  startTime: number;
  honeypotFilled: boolean;
}

function createShield() {
  const s: ShieldState = {
    mouseCount: 0,
    angles: [],
    lastMouseX: 0,
    lastMouseY: 0,
    keyCount: 0,
    keyGaps: [],
    lastKeyTime: 0,
    scrollCount: 0,
    clickCount: 0,
    focusCount: 0,
    startTime: Date.now(),
    honeypotFilled: false,
  };

  /* ── Listeners (all passive for zero perf impact) ── */

  const onMouse = (e: MouseEvent) => {
    s.mouseCount++;
    if (s.lastMouseX) {
      const dx = e.clientX - s.lastMouseX;
      const dy = e.clientY - s.lastMouseY;
      if (s.angles.length < 30) s.angles.push(Math.atan2(dy, dx));
    }
    s.lastMouseX = e.clientX;
    s.lastMouseY = e.clientY;
  };

  const onKey = () => {
    s.keyCount++;
    const now = Date.now();
    if (s.lastKeyTime > 0 && s.keyGaps.length < 30) {
      s.keyGaps.push(now - s.lastKeyTime);
    }
    s.lastKeyTime = now;
  };

  const onScroll = () => { s.scrollCount++; };
  const onClick = () => { s.clickCount++; };
  const onFocus = () => { s.focusCount++; };

  /* ── Browser fingerprint (instant, no async) ── */
  function browserPenalty(): number {
    let p = 0;
    try {
      if ((navigator as any).webdriver) p += 4;
      if (!navigator.plugins || navigator.plugins.length === 0) p += 1;
      if (navigator.languages?.length === 0) p += 1;
      if (window.outerHeight === 0 && window.outerWidth === 0) p += 3;
      // Headless Chrome detection
      if (/HeadlessChrome/.test(navigator.userAgent)) p += 4;
    } catch { /* safe */ }
    return p;
  }

  /* ── Variance helper ── */
  function variance(arr: number[]): number {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
  }

  /* ── Scoring — pure arithmetic, <0.1ms ── */
  function getScore(): number {
    if (s.honeypotFilled) return 0;

    let score = 0;
    const elapsed = (Date.now() - s.startTime) / 1000;

    // Time on page (max 25)
    if (elapsed > 2) score += 8;
    if (elapsed > 5) score += 9;
    if (elapsed > 10) score += 8;

    // Mouse (max 25)
    if (s.mouseCount > 3) score += 10;
    if (s.mouseCount > 15) score += 8;
    if (s.angles.length > 5 && variance(s.angles) > 0.3) score += 7;

    // Keystrokes (max 20)
    if (s.keyCount > 3) score += 8;
    if (s.keyGaps.length > 3) {
      const v = variance(s.keyGaps);
      const mean = s.keyGaps.reduce((a, b) => a + b, 0) / s.keyGaps.length;
      if (v > 500) score += 6;
      if (mean > 30 && mean < 500) score += 6;
    }

    // Interaction (max 15)
    if (s.scrollCount > 0) score += 5;
    if (s.clickCount > 0) score += 5;
    if (s.focusCount > 1) score += 5;

    // Browser (max 15)
    score += Math.max(0, 15 - browserPenalty() * 3);

    return Math.min(100, score);
  }

  function attach() {
    document.addEventListener('mousemove', onMouse, { passive: true });
    document.addEventListener('keydown', onKey, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick, { passive: true });
    document.addEventListener('focusin', onFocus, { passive: true });
  }

  function detach() {
    document.removeEventListener('mousemove', onMouse);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('scroll', onScroll);
    document.removeEventListener('click', onClick);
    document.removeEventListener('focusin', onFocus);
  }

  function setHoneypot(v: boolean) { s.honeypotFilled = v; }

  return { attach, detach, getScore, setHoneypot };
}

/** React hook — start tracking on mount, cleanup on unmount */
export function useShield() {
  const ref = useRef(createShield());

  useEffect(() => {
    ref.current.attach();
    return () => ref.current.detach();
  }, []);

  return {
    getScore: useCallback(() => ref.current.getScore(), []),
    setHoneypot: useCallback((v: boolean) => ref.current.setHoneypot(v), []),
  };
}
