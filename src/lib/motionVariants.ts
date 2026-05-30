import type { Variants, Transition } from "motion/react";

// ── Reusable transitions ──
export const springTransition: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 300,
  mass: 0.8,
};

export const smoothTransition: Transition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
};

// ── Fade Up ──
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ── Stagger Container ──
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// ── Stagger Item ──
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Hover Lift (for whileHover) ──
export const hoverLift = {
  y: -4,
  scale: 1.02,
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
};

// ── Press Down (for whileTap) ──
export const pressDown = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

// ── Tilt Interactive (for whileHover with perspective) ──
export const tiltInteractive = {
  rotateX: 2,
  rotateY: -2,
  z: 4,
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

// ── Sheet Enter (GlassSheet sliding in) ──
export const sheetEnter: Variants = {
  hidden: (side: "left" | "right" | "bottom" = "right") => ({
    x: side === "left" ? "-100%" : side === "right" ? "100%" : 0,
    y: side === "bottom" ? "100%" : 0,
    opacity: 0,
  }),
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 },
  },
  exit: (side: "left" | "right" | "bottom" = "right") => ({
    x: side === "left" ? "-100%" : side === "right" ? "100%" : 0,
    y: side === "bottom" ? "100%" : 0,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  }),
};

// ── Modal Enter ──
export const modalEnter: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// ── Selected Glow ──
export const selectedGlow: Variants = {
  inactive: {
    boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)",
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  active: {
    boxShadow: "0 0 24px -4px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    transition: { duration: 0.3 },
  },
};

// ── Crossfade Swap ──
export const crossfadeSwap: Variants = {
  hidden: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(4px)",
    transition: { duration: 0.2 },
  },
};

// ── Overlay backdrop ──
export const overlayBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
