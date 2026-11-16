/**
 * StarX Flow — Section Registry
 * Landmarked scene definitions, 3D camera targets, and spatial scene mappings.
 */

export interface SceneDefinition {
  id: string;
  index: number;
  name: string;
  selector: string;
  camera: {
    x: number;
    y: number;
    z: number;
    lookAtX: number;
    lookAtY: number;
    lookAtZ: number;
  };
  coreRotationSpeed: number;
  ringIntensity: number;
  lightIntensity: number;
  pedestalVisible: boolean;
}

export const STARX_SCENES: SceneDefinition[] = [
  {
    id: "hero-section",
    index: 1,
    name: "Architectural Hero Sanctuary",
    selector: "#hero-section",
    camera: { x: 0, y: 1.5, z: 24, lookAtX: 0, lookAtY: 0, lookAtZ: 0 },
    coreRotationSpeed: 0.14,
    ringIntensity: 0.75,
    lightIntensity: 2.8,
    pedestalVisible: true,
  },
  {
    id: "scene-hero-legacy",
    index: 2,
    name: "Autonomous Front Desk Demo",
    selector: "#scene-hero-legacy",
    camera: { x: -3.5, y: 1.0, z: 22, lookAtX: -1, lookAtY: 0, lookAtZ: 0 },
    coreRotationSpeed: 0.18,
    ringIntensity: 0.85,
    lightIntensity: 3.2,
    pedestalVisible: false,
  },
  {
    id: "challenge-section",
    index: 3,
    name: "Challenge & Connected Operations",
    selector: "#challenge-section",
    camera: { x: 4.0, y: 0.5, z: 25, lookAtX: 1.5, lookAtY: 0, lookAtZ: 0 },
    coreRotationSpeed: 0.22,
    ringIntensity: 0.95,
    lightIntensity: 3.4,
    pedestalVisible: false,
  },
  {
    id: "scene-revenue-leakage",
    index: 4,
    name: "Revenue Leakage & ROI Monument",
    selector: "#scene-revenue-leakage",
    camera: { x: 0, y: -1.0, z: 26, lookAtX: 0, lookAtY: -0.5, lookAtZ: 0 },
    coreRotationSpeed: 0.16,
    ringIntensity: 0.7,
    lightIntensity: 2.6,
    pedestalVisible: false,
  },
  {
    id: "scene-onboarding",
    index: 5,
    name: "3-Stage Architectural Glass Onboarding",
    selector: "#scene-onboarding",
    camera: { x: -2.5, y: 0.8, z: 23, lookAtX: 0, lookAtY: 0, lookAtZ: 0 },
    coreRotationSpeed: 0.15,
    ringIntensity: 0.8,
    lightIntensity: 2.9,
    pedestalVisible: false,
  },
  {
    id: "action-section",
    index: 6,
    name: "Interactive Product Demonstration (3D Phone)",
    selector: "#action-section",
    camera: { x: 3.2, y: 1.2, z: 21, lookAtX: 1, lookAtY: 0.5, lookAtZ: 0 },
    coreRotationSpeed: 0.2,
    ringIntensity: 0.9,
    lightIntensity: 3.5,
    pedestalVisible: false,
  },
  {
    id: "capabilities-section",
    index: 7,
    name: "Operational Excellence Pedestals",
    selector: "#capabilities-section",
    camera: { x: 0, y: 2.0, z: 24, lookAtX: 0, lookAtY: 0, lookAtZ: 0 },
    coreRotationSpeed: 0.18,
    ringIntensity: 0.85,
    lightIntensity: 3.0,
    pedestalVisible: true,
  },
  {
    id: "scene-customer-segments",
    index: 8,
    name: "Purpose-Built Customer Segments",
    selector: "#scene-customer-segments",
    camera: { x: -2.0, y: 0, z: 25, lookAtX: 0, lookAtY: 0, lookAtZ: 0 },
    coreRotationSpeed: 0.14,
    ringIntensity: 0.75,
    lightIntensity: 2.7,
    pedestalVisible: false,
  },
  {
    id: "scene-guarantees",
    index: 9,
    name: "Technical Guarantees & Trust Architecture",
    selector: "#scene-guarantees",
    camera: { x: 2.0, y: -0.5, z: 25, lookAtX: 0, lookAtY: 0, lookAtZ: 0 },
    coreRotationSpeed: 0.14,
    ringIntensity: 0.75,
    lightIntensity: 2.7,
    pedestalVisible: false,
  },
  {
    id: "pricing-section",
    index: 10,
    name: "Signature Studio Pricing",
    selector: "#pricing-section",
    camera: { x: 0, y: 1.0, z: 23, lookAtX: 0, lookAtY: 0, lookAtZ: 0 },
    coreRotationSpeed: 0.16,
    ringIntensity: 0.85,
    lightIntensity: 3.0,
    pedestalVisible: true,
  },
  {
    id: "scene-faq",
    index: 11,
    name: "Architectural Glass FAQ",
    selector: "#scene-faq",
    camera: { x: -1.5, y: 0, z: 26, lookAtX: 0, lookAtY: 0, lookAtZ: 0 },
    coreRotationSpeed: 0.12,
    ringIntensity: 0.65,
    lightIntensity: 2.4,
    pedestalVisible: false,
  },
  {
    id: "scene-final-cta-footer",
    index: 12,
    name: "Final Conversion Portal & Footer",
    selector: "#scene-final-cta-footer",
    camera: { x: 0, y: 0.5, z: 22, lookAtX: 0, lookAtY: 0, lookAtZ: 0 },
    coreRotationSpeed: 0.22,
    ringIntensity: 0.95,
    lightIntensity: 3.6,
    pedestalVisible: false,
  },
];

export function getSceneByIndex(index: number): SceneDefinition | undefined {
  return STARX_SCENES.find((s) => s.index === index);
}

export function getSceneById(id: string): SceneDefinition | undefined {
  return STARX_SCENES.find((s) => s.id === id);
}

export function interpolateCamera(
  from: SceneDefinition["camera"],
  to: SceneDefinition["camera"],
  t: number
): SceneDefinition["camera"] {
  const clampT = Math.min(1, Math.max(0, t));
  return {
    x: from.x + (to.x - from.x) * clampT,
    y: from.y + (to.y - from.y) * clampT,
    z: from.z + (to.z - from.z) * clampT,
    lookAtX: from.lookAtX + (to.lookAtX - from.lookAtX) * clampT,
    lookAtY: from.lookAtY + (to.lookAtY - from.lookAtY) * clampT,
    lookAtZ: from.lookAtZ + (to.lookAtZ - from.lookAtZ) * clampT,
  };
}
