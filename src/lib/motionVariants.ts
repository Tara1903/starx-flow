"use client";
import type { Variants, Transition } from "motion/react";

/* ─────────────────────────────────────────────────────────────
   STARX FLOW MASTER MOTION DESIGN SYSTEM
   Full motion tokens, physical spring dynamics, interaction physics,
   and visible-by-default guarantees.
   
   ABSOLUTE P0 RULE: TEXT AND CONTENT MUST NEVER DISAPPEAR.
   - Core text opacity remains >= 0.90 during all transitions.
   - Motion is driven by transforms (y, x, scale), specular borders,
     and ambient glow shifts rather than opacity collapse.
   ───────────────────────────────────────────────────────────── */

// ── Timing Tokens (Exact Millisecond Budgets) ──
export const MOTION_DURATION = {
  press: 0.11,            // 110ms snappy click feedback
  iconHover: 0.16,        // 160ms micro-lift
  buttonInvert: 0.19,     // 190ms primary button shift
  dropdown: 0.22,         // 220ms glass popover expand
  card: 0.26,             // 260ms card hover feedback
  navPill: 0.32,          // 320ms active capsule slide
  sidebar: 0.38,          // 380ms dock expansion
  modal: 0.42,            // 420ms modal entrance
  modalExchange: 0.48,    // 480ms login/signup position exchange
  sectionReveal: 0.44,    // 440ms section transition
  heroChoreography: 0.58, // 580ms hero entry
} as const;

export const MOTION_EASE = {
  premium: [0.16, 1, 0.3, 1] as const,
  snappy: [0.22, 1, 0.36, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
};

export const VIEWPORT_CONFIG = {
  once: true,
  amount: "some" as const,
  margin: "150px 0px 150px 0px",
} as const;

// ── Master Physical Springs (Reference Easing & Damping) ──
export const springTransition: Transition = {
  type: "spring",
  damping: 28,
  stiffness: 300,
  mass: 0.78,
};

export const navPillSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.7,
};

export const sidebarSpring: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.78,
};

export const otpPopSpring: Transition = {
  type: "spring",
  stiffness: 460,
  damping: 28,
  mass: 0.55,
};

export const liquidSpring: Transition = {
  type: "spring",
  stiffness: 340,
  damping: 26,
  mass: 0.72,
};

export const MOTION_SPRINGS = {
  modal: springTransition,
  navPill: navPillSpring,
  sidebar: sidebarSpring,
  otp: otpPopSpring,
  liquid: liquidSpring,
} as const;

export const smoothTransition: Transition = {
  duration: MOTION_DURATION.sectionReveal,
  ease: MOTION_EASE.premium,
};

export const reducedMotionTransition: Transition = {
  duration: 0.01,
};

// ── Master Page & Section Transitions (P0 Text Opacity Safe: >= 0.90) ──
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0.92, y: 6 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION.sectionReveal, ease: MOTION_EASE.premium },
  },
  exit: {
    opacity: 0.92,
    y: -4,
    transition: { duration: 0.16, ease: MOTION_EASE.exit },
  },
};

// ── Fade & Clip Reveals (P0 Safe: Floor of 0.92 Opacity) ──
export const fadeIn: Variants = {
  hidden: { opacity: 0.92 },
  visible: { opacity: 1, transition: { duration: MOTION_DURATION.card, ease: MOTION_EASE.smooth } },
  exit: { opacity: 0.92, transition: { duration: 0.14, ease: MOTION_EASE.exit } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0.92, y: 14 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0.92, y: -6, transition: { duration: 0.16, ease: MOTION_EASE.exit } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0.92, y: -12 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0.92, y: 6, transition: { duration: 0.16, ease: MOTION_EASE.exit } },
};

export const clipRevealUp: Variants = {
  hidden: { opacity: 0.92, clipPath: "inset(0 0 10% 0 round 16px)", y: 10 },
  visible: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0 round 16px)",
    y: 0,
    transition: { duration: MOTION_DURATION.sectionReveal, ease: MOTION_EASE.premium },
  },
};

export const imageReveal: Variants = {
  hidden: { opacity: 0.92, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: MOTION_EASE.premium },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0.92, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION.card, ease: MOTION_EASE.premium },
  },
  exit: {
    opacity: 0.92,
    x: -6,
    transition: { duration: 0.15, ease: MOTION_EASE.exit },
  },
};

// ── Directional Scroll Reveals (P0 Safe: >= 0.92 Opacity) ──
export const scrollRevealUp: Variants = {
  hidden: { opacity: 0.92, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: MOTION_EASE.premium } },
};

export const scrollRevealDown: Variants = {
  hidden: { opacity: 0.92, y: -18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: MOTION_EASE.premium } },
};

export const scrollRevealLeft: Variants = {
  hidden: { opacity: 0.92, x: -18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.42, ease: MOTION_EASE.premium } },
};

export const scrollRevealRight: Variants = {
  hidden: { opacity: 0.92, x: 18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.42, ease: MOTION_EASE.premium } },
};

export const scrollRevealScale: Variants = {
  hidden: { opacity: 0.92, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: MOTION_EASE.premium } },
};

// ── Stagger Containers ──
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

export const fastStaggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.02,
    },
  },
};

// ── Stagger Item (P0 Safe) ──
export const staggerItem: Variants = {
  hidden: { opacity: 0.92, y: 12, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.34, ease: MOTION_EASE.premium },
  },
};

// ── Hover Lift & Specular Glow Physics ──
export const hoverLift = {
  y: -5,
  scale: 1.01,
  transition: liquidSpring,
};

export const cardHoverGlow = {
  y: -5,
  scale: 1.01,
  transition: liquidSpring,
};

// ── Press Down ──
export const pressDown = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

// ── Tilt Interactive ──
export const tiltInteractive = {
  rotateX: 2,
  rotateY: -2,
  z: 4,
  transition: { duration: 0.3, ease: MOTION_EASE.premium },
};

// ── Dropdown Expand (P0 Safe) ──
export const dropdownExpand: Variants = {
  hidden: { opacity: 0.92, y: -6, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: MOTION_EASE.premium },
  },
  exit: {
    opacity: 0.92,
    y: -6,
    scale: 0.97,
    transition: { duration: 0.14, ease: MOTION_EASE.exit },
  },
};

// ── Sheet Enter (GlassSheet sliding in) ──
export const sheetEnter: Variants = {
  hidden: (side: "left" | "right" | "bottom" = "right") => ({
    x: side === "left" ? "-100%" : side === "right" ? "100%" : 0,
    y: side === "bottom" ? "100%" : 0,
    opacity: 0.95,
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
    opacity: 0.95,
    transition: { duration: 0.22, ease: MOTION_EASE.exit },
  }),
};

// ── Modal Enter (P0 Safe: >= 0.92 Opacity) ──
export const modalEnter: Variants = {
  hidden: { opacity: 0.92, scale: 0.96, y: 14 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0.92,
    scale: 0.97,
    y: 10,
    transition: { duration: 0.18, ease: MOTION_EASE.exit },
  },
};

// ── Selected Glow ──
export const selectedGlow: Variants = {
  inactive: {
    boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)",
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  active: {
    boxShadow: "0 0 24px -4px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.2)",
    borderColor: "rgba(16, 185, 129, 0.45)",
    transition: { duration: 0.28 },
  },
};

// ── OTP Cell Pop ──
export const otpCellVariants: Variants = {
  empty: { scale: 1 },
  filled: {
    scale: [1, 1.08, 1],
    transition: { duration: 0.2, ease: MOTION_EASE.snappy },
  },
  error: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.36 },
  },
  success: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.28 },
  },
};

// ── Crossfade Swap (P0 Safe) ──
export const crossfadeSwap: Variants = {
  hidden: { opacity: 0.92, scale: 0.985, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: MOTION_EASE.premium },
  },
  exit: {
    opacity: 0.92,
    scale: 0.985,
    y: -4,
    transition: { duration: 0.18 },
  },
};

// ── Overlay backdrop (Backdrop only, not text) ──
export const overlayBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ── Liquid Glass Dashboard & Section Choreography (P0 Safe) ──
export const liquidStaggerGrid: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
};

export const liquidCardEntrance: Variants = {
  hidden: { opacity: 0.92, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: MOTION_EASE.premium,
    },
  },
};

export const liquidHoverLift = {
  y: -5,
  transition: liquidSpring,
};

export const liquidTapPress = {
  scale: 0.98,
  transition: { duration: 0.1 },
};
