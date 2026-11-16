/**
 * StarX Flow — Animation Registry
 * Centralized motion variants strictly adhering to the P0 Content Visibility Mandate.
 * Core text opacity is >= 0.90 in all initial states; transitions use transforms and border highlights.
 */

import type { Variants, Transition } from "motion/react";
import { MOTION_DURATIONS, MOTION_EASINGS, MOTION_SPRINGS } from "./MotionConfig";

// ── Shared Transitions ──
export const defaultTransition: Transition = {
  duration: MOTION_DURATIONS.sectionReveal,
  ease: MOTION_EASINGS.premium,
};

export const snappyTransition: Transition = {
  duration: MOTION_DURATIONS.card,
  ease: MOTION_EASINGS.snappy,
};

export const reducedMotionTransition: Transition = {
  duration: 0.001,
};

// ── Headline & Display Reveals (P0 Opacity Guaranteed >= 0.92) ──
export const headlineRevealVariants: Variants = {
  initial: {
    opacity: 0.92,
    y: 14,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.heroChoreography,
      ease: MOTION_EASINGS.premium,
    },
  },
};

export const eyebrowBadgeVariants: Variants = {
  initial: {
    opacity: 0.92,
    scale: 0.96,
    y: 6,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: MOTION_EASINGS.snappy,
    },
  },
};

export const paragraphEntranceVariants: Variants = {
  initial: {
    opacity: 0.90,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.sectionReveal,
      ease: MOTION_EASINGS.smooth,
    },
  },
};

// ── Card & Grid Reveals ──
export const cardEntranceVariants: Variants = {
  initial: {
    opacity: 0.92,
    y: 16,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: MOTION_DURATIONS.card,
      ease: MOTION_EASINGS.premium,
    },
  },
};

export const staggeredGridContainerVariants: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
};

// ── Button & Interactive Elements ──
export const buttonHoverVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.025,
    transition: {
      duration: MOTION_DURATIONS.iconHover,
      ease: MOTION_EASINGS.snappy,
    },
  },
  tap: {
    scale: 0.97,
    transition: {
      duration: MOTION_DURATIONS.press,
    },
  },
};

// ── Modal & Dialog Springs ──
export const modalDialogVariants: Variants = {
  initial: {
    opacity: 0.92,
    scale: 0.95,
    y: 16,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: MOTION_SPRINGS.modal,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: {
      duration: 0.2,
      ease: MOTION_EASINGS.exit,
    },
  },
};

// ── Reduced Motion Fallbacks ──
export const reducedMotionVariants: Variants = {
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.001 } },
  exit: { opacity: 0.9, transition: { duration: 0.001 } },
};
