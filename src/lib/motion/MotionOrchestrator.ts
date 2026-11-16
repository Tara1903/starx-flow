/**
 * StarX Flow — Motion Orchestrator
 * High-level coordinator linking viewport observers, scene triggers, scroll dynamics, and 3D scenes.
 */

import { scrollManager, ScrollState } from "./ScrollManager";
import { pointerPhysics } from "./PointerPhysics";
import { performanceManager } from "./PerformanceManager";
import { accessibilityMotion } from "./AccessibilityMotion";
import { STARX_SCENES, SceneDefinition, getSceneById } from "./SectionRegistry";
import { motionCleanup } from "./MotionCleanup";

export type SceneChangeListener = (scene: SceneDefinition) => void;

class MotionOrchestratorEngine {
  private activeScene: SceneDefinition = STARX_SCENES[0];
  private sceneListeners = new Set<SceneChangeListener>();
  private intersectionObserver: IntersectionObserver | null = null;
  private isInitialized = false;

  public init(): () => void {
    if (typeof window === "undefined" || this.isInitialized) {
      return () => {};
    }

    this.isInitialized = true;

    // 1. Initialize Pointer Physics (Writes CSS variables, zero re-renders)
    const cleanupPointer = pointerPhysics.init();
    motionCleanup.register(cleanupPointer);

    // 2. Initialize Scroll Manager
    const cleanupScroll = scrollManager.init();
    motionCleanup.register(cleanupScroll);

    // 3. Start FPS monitoring in dev/high-tier
    performanceManager.startFPSMonitoring();
    motionCleanup.register(() => performanceManager.stopFPSMonitoring());

    // 4. Setup Intersection Observer for StarX Scenes
    this.setupSceneObserver();

    // 5. Connect Scroll Manager to Scene Progress
    const unsubScroll = scrollManager.subscribe(this.handleScrollUpdate);
    motionCleanup.register(unsubScroll);

    return () => this.teardown();
  }

  private setupSceneObserver() {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            const targetId = entry.target.id;
            const matchedScene = getSceneById(targetId);
            if (matchedScene && matchedScene.id !== this.activeScene.id) {
              this.activeScene = matchedScene;
              this.sceneListeners.forEach((l) => l(matchedScene));
            }
          }
        });
      },
      {
        threshold: [0.1, 0.25, 0.5],
        rootMargin: "-10% 0px -20% 0px",
      }
    );

    // Register all defined scene elements
    STARX_SCENES.forEach((scene) => {
      const el = document.getElementById(scene.id);
      if (el) {
        this.intersectionObserver?.observe(el);
        scrollManager.registerSection(scene.id, el);
      }
    });

    motionCleanup.register(() => {
      this.intersectionObserver?.disconnect();
      this.intersectionObserver = null;
    });
  }

  private handleScrollUpdate = (scrollState: ScrollState) => {
    // Write normalized scroll progress to root
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--sx-scroll-progress",
        scrollState.progress.toFixed(4)
      );
    }
  };

  public getActiveScene(): SceneDefinition {
    return this.activeScene;
  }

  public subscribeActiveScene(listener: SceneChangeListener): () => void {
    this.sceneListeners.add(listener);
    listener(this.activeScene);
    return () => {
      this.sceneListeners.delete(listener);
    };
  }

  public teardown() {
    motionCleanup.flush();
    this.sceneListeners.clear();
    this.isInitialized = false;
  }
}

export const motionOrchestrator = new MotionOrchestratorEngine();
