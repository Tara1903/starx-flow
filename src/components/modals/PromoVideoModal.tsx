"use client";

import React from "react";
import { Play, ArrowDown, ArrowRight } from "lucide-react";
import { GlassModal, GlassButton } from "../ui";

interface PromoVideoModalProps {
  open: boolean;
  onClose: () => void;
  onExploreInteractive?: () => void;
  onGetStarted?: () => void;
}

/**
 * Product overview video player modal triggered from the Hero "See It in Action" CTA.
 */
export function PromoVideoModal({
  open,
  onClose,
  onExploreInteractive,
  onGetStarted,
}: PromoVideoModalProps) {
  return (
    <GlassModal
      open={open}
      onClose={onClose}
      maxWidth="2xl"
      className="sm:max-w-4xl border-[#34d399]/25"
      title={
        <span className="flex items-center gap-2 text-[#edf0ee]">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <Play className="w-3 h-3 fill-current" />
          </span>
          <span>StarX Flow in Action</span>
        </span>
      }
      subtitle="Autonomous WhatsApp, Instagram & real-time Calendar infrastructure (48s overview)"
    >
      <div className="p-4 sm:p-6 space-y-4">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#040e0a] border border-emerald-500/25 shadow-2xl">
          <video
            src="/videos/starx-flow-promo.mp4"
            poster="/videos/starx-flow-promo-poster.png"
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="w-full h-full object-contain bg-[#040e0a]"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {onExploreInteractive ? (
            <GlassButton
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                onClose();
                onExploreInteractive();
              }}
            >
              <span>Try Interactive Workflow Demo</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </GlassButton>
          ) : (
            <span />
          )}

          {onGetStarted && (
            <GlassButton
              variant="primary"
              size="sm"
              type="button"
              onClick={() => {
                onClose();
                onGetStarted();
              }}
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </GlassButton>
          )}
        </div>
      </div>
    </GlassModal>
  );
}
