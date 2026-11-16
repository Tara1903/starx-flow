/**
 * StarX Flow — Motion Configuration
 * Centralized motion tokens, physical spring dynamics, easing curves, and device profiles.
 */

export const MOTION_DURATIONS = {
  press: 0.11,
  iconHover: 0.16,
  buttonInvert: 0.19,
  dropdown: 0.22,
  card: 0.26,
  navPill: 0.32,
  sidebar: 0.38,
  modal: 0.42,
  modalExchange: 0.48,
  sectionReveal: 0.44,
  heroChoreography: 0.58,
  cameraTransition: 0.85,
} as const;

export const MOTION_EASINGS = {
  premium: [0.16, 1, 0.3, 1] as const,
  snappy: [0.22, 1, 0.36, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
  springy: [0.34, 1.56, 0.64, 1] as const,
} as const;

export const MOTION_SPRINGS = {
  modal: {
    type: "spring",
    damping: 28,
    stiffness: 300,
    mass: 0.78,
  },
  modalExchange: {
    type: "spring",
    stiffness: 220,
    damping: 27,
    mass: 0.8,
  },
  navPill: {
    type: "spring",
    stiffness: 420,
    damping: 32,
    mass: 0.7,
  },
  sidebar: {
    type: "spring",
    stiffness: 320,
    damping: 30,
    mass: 0.78,
  },
  otp: {
    type: "spring",
    stiffness: 460,
    damping: 28,
    mass: 0.55,
  },
  liquid: {
    type: "spring",
    stiffness: 340,
    damping: 26,
    mass: 0.72,
  },
  magnetic: {
    stiffness: 280,
    damping: 22,
    mass: 0.6,
  },
  cardTilt: {
    stiffness: 240,
    damping: 24,
    mass: 0.5,
  },
} as const;

export const POINTER_CONFIG = {
  maxTiltAngle: 6.5, // degrees
  maxMagneticOffset: 14, // px
  magneticThreshold: 65, // px
  spotlightRadius: 400, // px
  spotlightOpacity: 0.18,
  dampFactor: 0.08,
} as const;

export const VIEWPORT_THRESHOLDS = {
  sceneEnter: 0.15,
  sceneActive: 0.5,
  cardReveal: 0.2,
} as const;

export const PERFORMANCE_TIERS = {
  HIGH: {
    enable3D: true,
    maxDPR: 2,
    enableGyroscopicTilt: true,
    enableSpotlight: true,
    enableParticles: true,
    particleCount: 400,
  },
  MEDIUM: {
    enable3D: true,
    maxDPR: 1.5,
    enableGyroscopicTilt: false,
    enableSpotlight: true,
    enableParticles: true,
    particleCount: 150,
  },
  LOW: {
    enable3D: false,
    maxDPR: 1,
    enableGyroscopicTilt: false,
    enableSpotlight: false,
    enableParticles: false,
    particleCount: 0,
  },
} as const;

export type PerformanceTier = keyof typeof PERFORMANCE_TIERS;
