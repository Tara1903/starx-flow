"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// Selectors for zones where the cursor should be disabled
const DISABLED_ZONE_SELECTORS = [
  'input', 'select', 'textarea',
  '[data-cursor-disabled]',
  '.modal-interior',
  '.dashboard-panel',
  '.setup-content',
  'form button',
  'form [role="button"]',
].join(', ');

export function CustomCursor() {
  const lightX = useMotionValue(-100);
  const lightY = useMotionValue(-100);

  const springConfig = { damping: 20, stiffness: 250, mass: 0.6 };
  const lightXSpring = useSpring(lightX, springConfig);
  const lightYSpring = useSpring(lightY, springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDisabledZone, setIsDisabledZone] = useState(false);

  const isVisibleRef = useRef(false);
  const cursorActiveRef = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!cursorActiveRef.current) {
      cursorActiveRef.current = true;
      document.documentElement.classList.add('starx-cursor-enabled', 'starx-cursor-active');
      document.body.classList.add('starx-cursor-active');
    }
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setIsVisible(true);
    }
    lightX.set(e.clientX);
    lightY.set(e.clientY);

    // Check if we're in a disabled zone
    const target = e.target as HTMLElement;
    const inDisabledZone = !!target?.closest?.(DISABLED_ZONE_SELECTORS);
    setIsDisabledZone(inDisabledZone);
    if (inDisabledZone) {
      document.documentElement.classList.add('starx-cursor-native');
    } else {
      document.documentElement.classList.remove('starx-cursor-native');
    }

    // Agentic Glass: Broadcast interactive specular caustics coordinates to hovered glass surface
    if (target?.closest) {
      const glassEl = target.closest<HTMLElement>(
        '.spatial-glass-card, .glass-navbar-floating, .glass-navbar-scrolled, .glass-card-obsidian, .glass-panel, .glass-dock, .glass-capsule-nav, .mat-primary-glass, .mat-crystal-glass'
      );
      if (glassEl) {
        const rect = glassEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const relX = ((e.clientX - rect.left) / rect.width) * 100;
          const relY = ((e.clientY - rect.top) / rect.height) * 100;
          glassEl.style.setProperty('--glass-light-x', `${relX.toFixed(1)}%`);
          glassEl.style.setProperty('--glass-light-y', `${relY.toFixed(1)}%`);
        }
      }
    }

    // Magnetic CTA attraction
    if (!inDisabledZone && target?.closest) {
      const magneticEl = target.closest<HTMLElement>("[data-magnetic]");
      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;
        const dist = Math.sqrt(distX * distX + distY * distY);
        const maxDist = 100;

        if (dist < maxDist) {
          const pull = 1 - dist / maxDist;
          lightX.set(e.clientX - distX * pull * 0.3);
          lightY.set(e.clientY - distY * pull * 0.3);
        }
      }
    }
  }, [lightX, lightY]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target?.closest) return;

      // Check disabled zones
      if (target.closest(DISABLED_ZONE_SELECTORS)) {
        setIsDisabledZone(true);
        setIsHovered(false);
        setIsCardHovered(false);
        document.documentElement.classList.add('starx-cursor-native');
        return;
      }
      setIsDisabledZone(false);
      document.documentElement.classList.remove('starx-cursor-native');

      if (target.closest('button, a, [role="button"], .clickable, [data-magnetic], summary')) {
        setIsHovered(true);
        setIsCardHovered(false);
      } else if (target.closest(".glass-card, .glass-panel, .glass-focus, .glass-hero, .glass-mist, .glass-focal, .glass-premium, .spatial-glass-card, .starx-glass-card-interactive, .glass-card-obsidian")) {
        setIsCardHovered(true);
        setIsHovered(false);
      } else {
        setIsHovered(false);
        setIsCardHovered(false);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      cursorActiveRef.current = false;
      setIsVisible(false);
      document.documentElement.classList.remove('starx-cursor-active');
      document.body.classList.remove('starx-cursor-active');
    };
    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      cursorActiveRef.current = true;
      setIsVisible(true);
      document.documentElement.classList.add('starx-cursor-enabled', 'starx-cursor-active');
      document.body.classList.add('starx-cursor-active');
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.documentElement.classList.remove('starx-cursor-active', 'starx-cursor-enabled', 'starx-cursor-native');
      document.body.classList.remove('starx-cursor-active');
    };
  }, [handleMouseMove]);

  // If in a disabled zone, hide completely
  const shouldShow = isVisible && !isDisabledZone;

  return (
    <div
      id="starx-cursor-layer"
      data-testid="starx-cursor-layer"
      data-visible={shouldShow ? "true" : "false"}
      className="starx-custom-cursor-root starx-cursor-layer"
      aria-hidden="true"
    >
      {/* Outer light ring — ambient glass reflection source */}
      <motion.div
        id="starx-cursor-ring"
        data-testid="starx-cursor-ring"
        style={{ x: lightXSpring, y: lightYSpring }}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -ml-5 -mt-5 h-10 w-10 rounded-full"
        animate={{
          scale: isClicked ? 0.5 : isHovered ? 2.2 : isCardHovered ? 1.6 : 1,
          opacity: shouldShow ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Refraction / light ring */}
        <div
          className={`w-full h-full rounded-full transition-all duration-200 ${
            isHovered
              ? "bg-gradient-to-br from-emerald-400/30 to-white/20 shadow-[0_0_20px_rgba(16,185,129,0.4),inset_0_0_8px_rgba(255,255,255,0.3)]"
              : isCardHovered
                ? "border border-emerald-400/30 bg-emerald-400/5 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "border border-white/30 bg-white/5 shadow-[0_0_16px_rgba(255,255,255,0.08)]"
          }`}
          style={{ backdropFilter: "blur(1px)", WebkitBackdropFilter: "blur(1px)" }}
        />
      </motion.div>

      {/* Center dot — glass-aware light point */}
      <motion.div
        id="starx-cursor-dot"
        data-testid="starx-cursor-dot"
        style={{ x: lightX, y: lightY }}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full"
        animate={{
          scale: isClicked ? 0 : isHovered ? 0 : isCardHovered ? 0 : 1,
          opacity: shouldShow && !isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      >
        <div className="w-full h-full rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
      </motion.div>

      {/* Ambient glow following cursor — visible on marketing surfaces */}
      <motion.div
        style={{ x: lightXSpring, y: lightYSpring }}
        className="fixed top-0 left-0 pointer-events-none z-[9998] -ml-[75px] -mt-[75px] w-[150px] h-[150px] rounded-full"
        animate={{
          opacity: shouldShow ? (isHovered ? 0.08 : 0.04) : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0.1) 30%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
      </motion.div>
    </div>
  );
}
