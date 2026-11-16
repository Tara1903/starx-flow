/**
 * StarX Flow — Motion Provider
 * Global React Context Provider orchestrating pointer physics, scroll tracking, and performance tiers.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { motionOrchestrator } from "./MotionOrchestrator";
import { performanceManager } from "./PerformanceManager";
import { accessibilityMotion } from "./AccessibilityMotion";
import { SceneDefinition, STARX_SCENES } from "./SectionRegistry";
import { PerformanceTier } from "./MotionConfig";

interface MotionContextValue {
  activeScene: SceneDefinition;
  performanceTier: PerformanceTier;
  isReducedMotion: boolean;
}

const MotionContext = createContext<MotionContextValue>({
  activeScene: STARX_SCENES[0],
  performanceTier: "HIGH",
  isReducedMotion: false,
});

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [activeScene, setActiveScene] = useState<SceneDefinition>(STARX_SCENES[0]);
  const [performanceTier, setPerformanceTier] = useState<PerformanceTier>("HIGH");
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initialize global motion orchestrator
    const teardown = motionOrchestrator.init();

    // 2. Subscribe to active scene transitions
    const unsubScene = motionOrchestrator.subscribeActiveScene((scene) => {
      setActiveScene(scene);
    });

    // 3. Subscribe to performance tier adjustments
    const unsubTier = performanceManager.subscribeTierChange((tier) => {
      setPerformanceTier(tier);
    });

    // 4. Subscribe to accessibility preferences
    const unsubA11y = accessibilityMotion.subscribe((reduced) => {
      setIsReducedMotion(reduced);
    });

    return () => {
      unsubScene();
      unsubTier();
      unsubA11y();
      teardown();
    };
  }, []);

  const value = useMemo(
    () => ({
      activeScene,
      performanceTier,
      isReducedMotion,
    }),
    [activeScene, performanceTier, isReducedMotion]
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotionSystem() {
  return useContext(MotionContext);
}
