"use client";

import React, { useState } from "react";
import { LusionHeader } from "../navigation/LusionHeader";
import { LusionMenuOverlay } from "../navigation/LusionMenuOverlay";
import { LusionHeroScene } from "./LusionHeroScene";
import { LusionBrandStatement } from "./LusionBrandStatement";
import { LusionProductCapabilities } from "./LusionProductCapabilities";
import { LusionConnectedEnvironment } from "./LusionConnectedEnvironment";
import { LusionInteractiveDemoShowcase } from "./LusionInteractiveDemoShowcase";
import { LusionPricingSection } from "./LusionPricingSection";
import { LusionClosingExperience } from "./LusionClosingExperience";

export function LusionStarXHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="starx-lusion-bg min-h-screen relative flex flex-col selection:bg-emerald-500/30 selection:text-white">
      {/* Lusion Minimal Header */}
      <LusionHeader
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      />

      {/* Lusion Full-Screen Editorial Menu Overlay */}
      <LusionMenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Main Experience Flow */}
      <main id="main-content" className="flex-1 flex flex-col relative z-10">
        {/* Scene 0 & 1: Cinematic Entrance + 3D Spatial Core Hero */}
        <LusionHeroScene />

        {/* Scene 2: Brand Manifesto & Core Pillars */}
        <LusionBrandStatement />

        {/* Scene 3 & 6: Featured Core Product Capabilities */}
        <LusionProductCapabilities />

        {/* Scene 4: Connected Business Environment */}
        <LusionConnectedEnvironment />

        {/* Scene 5: Live Interactive Demos & ROI Engine */}
        <LusionInteractiveDemoShowcase />

        {/* Scene 8: Transparent Flat Pricing & Billing FAQs */}
        <LusionPricingSection />

        {/* Scene 7 & 9: Platform Guarantees, Closing Singularity & Architectural Footer */}
        <LusionClosingExperience />
      </main>
    </div>
  );
}
