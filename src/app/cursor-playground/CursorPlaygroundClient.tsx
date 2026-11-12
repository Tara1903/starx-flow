'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Compass,
  Eye,
  Move,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassCard } from '../../components/ui/GlassCard';
import {
  CursorSpotlight,
  DEFAULT_CURSOR_PHYSICS,
  MagneticElement,
  getCursorTelemetrySnapshot,
} from '../../cursor';
import { getActivePhysicsConfig, useCursorStore } from '../../store/cursorStore';
import type { CursorTelemetrySnapshot } from '../../cursor/cursorTypes';

export function CursorPlaygroundClient() {
  const playgroundOverrides = useCursorStore((s) => s.playgroundOverrides);
  const setPlaygroundOverrides = useCursorStore((s) => s.setPlaygroundOverrides);
  const resetPlaygroundOverrides = useCursorStore((s) => s.resetPlaygroundOverrides);
  const isFinePointer = useCursorStore((s) => s.isFinePointer);
  const isReducedMotion = useCursorStore((s) => s.isReducedMotion);

  const [telemetry, setTelemetry] = useState<CursorTelemetrySnapshot>(() =>
    getCursorTelemetrySnapshot(),
  );
  const [peakLagPx, setPeakLagPx] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '', '', '']);
  const [sampleText, setSampleText] = useState('StarX Flow enterprise WhatsApp engine');

  useEffect(() => {
    let rafId = 0;
    let lastUpdate = 0;

    const sample = (now: number) => {
      if (now - lastUpdate > 48) {
        const snap = getCursorTelemetrySnapshot();
        setTelemetry(snap);
        setPeakLagPx((prev) => (snap.lagDistancePx > prev ? snap.lagDistancePx : prev));
        lastUpdate = now;
      }
      rafId = window.requestAnimationFrame(sample);
    };

    rafId = window.requestAnimationFrame(sample);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const config = getActivePhysicsConfig();

  const handleOtpChange = (index: number, value: string) => {
    const clean = value.slice(-1).toUpperCase();
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#020504] text-zinc-100 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              StarX Flow — Custom Cursor 2.0 QA Lab
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Dual-Layer Physics &amp; Interaction Sandbox
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
              Isolated testbed covering 0ms inner dot tracking, damped outer circle convergence,
              synchronized button color inversion, bounded magnetic CTAs, surface lighting, and
              native accessibility fallbacks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
              Pointer: {isFinePointer ? 'FINE' : 'COARSE/TOUCH'}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300">
              Reduced Motion: {isReducedMotion ? 'ON' : 'OFF'}
            </span>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 hover:bg-emerald-400 hover:text-black transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </header>

        {/* SECTION A: Dual-layer dot + ring tracking zone */}
        <section className="space-y-4" aria-labelledby="pg-section-a">
          <div className="flex items-center justify-between">
            <h2 id="pg-section-a" className="text-xl font-semibold text-white">
              Section A — Dual-Layer Dot + Outer Circle Tracking Zone
            </h2>
            <span className="text-xs font-mono text-emerald-300 tabular-nums">
              FPS ~{telemetry.fpsEstimate} | Lag {telemetry.lagDistancePx.toFixed(1)}px
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              data-testid="pg-tracking-pad"
              className="lg:col-span-2 relative min-h-[260px] rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#040c09] via-[#020504] to-[#06110d] p-6 flex flex-col justify-between overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>NORTH-WEST WAYPOINT</span>
                <span>NORTH-EAST WAYPOINT</span>
              </div>
              <div className="text-center space-y-1 pointer-events-none select-none my-8">
                <p className="text-sm font-medium text-emerald-300">
                  Sweep quickly or reverse directions inside this trackpad
                </p>
                <p className="text-xs text-zinc-500">
                  White inner dot snaps at 0ms; emerald outer ring converges smoothly toward dot
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>SOUTH-WEST WAYPOINT</span>
                <span>SOUTH-EAST WAYPOINT</span>
              </div>
            </div>

            <GlassCard variant="obsidian" padding="md" className="font-mono text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-emerald-300 font-semibold uppercase tracking-wider">
                  Live Physics Telemetry
                </span>
                <button
                  type="button"
                  data-testid="pg-reset-peak"
                  onClick={() => setPeakLagPx(0)}
                  className="text-[11px] text-zinc-400 hover:text-emerald-300 transition-colors"
                >
                  Reset Peak
                </button>
              </div>
              <dl className="grid grid-cols-2 gap-y-2.5 gap-x-3 tabular-nums text-zinc-300">
                <dt className="text-zinc-500">inner dot (x, y)</dt>
                <dd data-testid="pg-tel-dot">
                  {telemetry.dotX.toFixed(1)}, {telemetry.dotY.toFixed(1)}
                </dd>
                <dt className="text-zinc-500">outer ring (x, y)</dt>
                <dd data-testid="pg-tel-ring">
                  {telemetry.ringX.toFixed(1)}, {telemetry.ringY.toFixed(1)}
                </dd>
                <dt className="text-zinc-500">ring vel (px/s)</dt>
                <dd>
                  {telemetry.ringVelocityX.toFixed(0)}, {telemetry.ringVelocityY.toFixed(0)}
                </dd>
                <dt className="text-zinc-500">separation</dt>
                <dd data-testid="pg-tel-lag">{telemetry.lagDistancePx.toFixed(2)} px</dd>
                <dt className="text-zinc-500">peak separation</dt>
                <dd data-testid="pg-tel-peak-lag" className="text-emerald-300">
                  {peakLagPx.toFixed(1)} px
                </dd>
                <dt className="text-zinc-500">active mode</dt>
                <dd data-testid="pg-tel-mode" className="text-emerald-300">
                  {telemetry.mode}
                </dd>
                <dt className="text-zinc-500">active label</dt>
                <dd>{telemetry.label ?? 'none'}</dd>
              </dl>
            </GlassCard>
          </div>
        </section>

        {/* SECTION B: Cursor States */}
        <section className="space-y-4" aria-labelledby="pg-section-b">
          <h2 id="pg-section-b" className="text-xl font-semibold text-white">
            Section B — Cursor Modes &amp; Contextual Labels
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div
              data-testid="pg-state-default"
              data-cursor-mode="default"
              className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 text-center text-xs text-zinc-300"
            >
              Default Surface
            </div>
            <div
              data-testid="pg-state-hover"
              data-cursor-hover="true"
              className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-center text-xs text-emerald-300"
            >
              Generic Hover
            </div>
            <button
              type="button"
              data-testid="pg-state-click"
              onClick={() => setClickCount((c) => c + 1)}
              className="rounded-xl border border-white/15 bg-zinc-900 p-4 text-center text-xs text-white hover:border-emerald-400"
            >
              Click Test ({clickCount})
            </button>
            <div
              data-testid="pg-label-view"
              data-cursor-label="VIEW"
              className="rounded-xl border border-emerald-500/30 bg-[#06130e] p-4 text-center text-xs text-emerald-200 flex flex-col items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              Label: VIEW
            </div>
            <div
              data-testid="pg-label-open"
              data-cursor-label="OPEN"
              className="rounded-xl border border-emerald-500/30 bg-[#06130e] p-4 text-center text-xs text-emerald-200 flex flex-col items-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Label: OPEN
            </div>
            <div
              data-testid="pg-label-drag"
              data-cursor-label="DRAG"
              className="rounded-xl border border-emerald-500/30 bg-[#06130e] p-4 text-center text-xs text-emerald-200 flex flex-col items-center gap-1.5"
            >
              <Move className="w-4 h-4 text-emerald-400" />
              Label: DRAG
            </div>
            <div
              data-testid="pg-label-play"
              data-cursor-label="PLAY"
              className="rounded-xl border border-emerald-500/30 bg-[#06130e] p-4 text-center text-xs text-emerald-200 flex flex-col items-center gap-1.5"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              Label: PLAY
            </div>
            <div
              data-testid="pg-label-explore"
              data-cursor-label="EXPLORE"
              className="rounded-xl border border-emerald-500/30 bg-[#06130e] p-4 text-center text-xs text-emerald-200 flex flex-col items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              Label: EXPLORE
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled
              data-testid="pg-state-disabled"
              className="rounded-xl border border-zinc-700/60 bg-zinc-900/40 p-4 text-xs text-zinc-500 opacity-60 text-left"
            >
              Disabled Control (subdued dashed ring, zero color inversion)
            </button>
            <div
              data-testid="pg-state-native"
              data-cursor-mode="native"
              className="rounded-xl border border-zinc-700/60 bg-zinc-900/40 p-4 text-xs text-zinc-300 text-left"
            >
              Native Cursor Fallback Region (custom cursor hides cleanly to OS arrow/text cursor)
            </div>
          </div>
        </section>

        {/* SECTION C: Signature Button Color Inversion */}
        <section className="space-y-4" aria-labelledby="pg-section-c">
          <h2 id="pg-section-c" className="text-xl font-semibold text-white">
            Section C — Synchronized Button Color Inversion
          </h2>
          <div className="flex flex-wrap items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#050b09]">
            <GlassButton
              variant="primary"
              data-testid="pg-btn-primary"
              onClick={() => setClickCount((c) => c + 1)}
            >
              <span>Primary CTA</span>
              <ArrowUpRight className="w-4 h-4" />
            </GlassButton>

            <GlassButton
              variant="secondary"
              data-testid="pg-btn-secondary"
              onClick={() => setClickCount((c) => c + 1)}
            >
              Secondary CTA
            </GlassButton>

            <GlassButton
              variant="outline"
              data-testid="pg-btn-outline"
              onClick={() => setClickCount((c) => c + 1)}
            >
              Outline CTA
            </GlassButton>

            <GlassButton
              variant="white"
              data-testid="pg-btn-white"
              onClick={() => setClickCount((c) => c + 1)}
            >
              White Inversion CTA
            </GlassButton>

            <GlassButton
              variant="focus"
              data-testid="pg-btn-focus"
              onClick={() => setClickCount((c) => c + 1)}
            >
              Focus Glass CTA
            </GlassButton>

            <GlassButton
              variant="ghost"
              data-testid="pg-btn-ghost"
              onClick={() => setClickCount((c) => c + 1)}
            >
              Ghost Action
            </GlassButton>

            <GlassButton
              variant="danger"
              data-testid="pg-btn-danger"
              onClick={() => setClickCount((c) => c + 1)}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Danger Action</span>
            </GlassButton>

            <GlassButton variant="primary" disabled data-testid="pg-btn-disabled">
              Disabled Primary
            </GlassButton>

            <GlassButton
              variant="secondary"
              isLoading
              loadingText="Syncing..."
              data-testid="pg-btn-loading"
            >
              Loading
            </GlassButton>
          </div>
        </section>

        {/* SECTION D: Magnetic Interactions */}
        <section className="space-y-4" aria-labelledby="pg-section-d">
          <h2 id="pg-section-d" className="text-xl font-semibold text-white">
            Section D — Bounded Magnetic Attraction Strengths
          </h2>
          <div className="flex flex-wrap items-center gap-6 p-6 rounded-2xl border border-white/10 bg-[#050b09]">
            <GlassButton variant="secondary" magneticStrength="none" data-testid="pg-mag-none">
              Strength: None
            </GlassButton>
            <GlassButton
              variant="secondary"
              magneticStrength="low"
              size="sm"
              data-testid="pg-mag-low"
            >
              Small / Low
            </GlassButton>
            <GlassButton
              variant="primary"
              magneticStrength="medium"
              size="md"
              data-testid="pg-mag-medium"
            >
              Medium Magnetic
            </GlassButton>
            <GlassButton
              variant="white"
              magneticStrength="high"
              size="lg"
              data-testid="pg-mag-high"
            >
              Large / High Magnetic
            </GlassButton>
            <MagneticElement strength="medium">
              <span
                data-cursor-hover="true"
                className="px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-semibold"
              >
                Magnetic Badge
              </span>
            </MagneticElement>
          </div>
        </section>

        {/* SECTION E: Surface Lighting Testbed */}
        <section className="space-y-4" aria-labelledby="pg-section-e">
          <h2 id="pg-section-e" className="text-xl font-semibold text-white">
            Section E — Cursor Surface Lighting (`CursorSpotlight`)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <CursorSpotlight
              data-testid="pg-spotlight-dark"
              className="rounded-2xl border border-white/10 bg-[#040807] p-6 space-y-2"
            >
              <h3 className="text-base font-semibold text-white">Dark Obsidian Surface</h3>
              <p className="text-xs text-zinc-400">
                Single radial gradient driven via local `--sx-spot-x` &amp; `--sx-spot-y` vars.
              </p>
            </CursorSpotlight>

            <GlassCard hoverable variant="liquid" padding="md" data-testid="pg-spotlight-glass">
              <h3 className="text-base font-semibold text-white">Liquid Glass Card</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Combines edge highlight and cursor illumination without stacked backdrop blurs.
              </p>
            </GlassCard>

            <CursorSpotlight
              data-testid="pg-spotlight-wide"
              className="rounded-2xl border border-emerald-500/35 bg-emerald-950/25 p-6 space-y-2"
            >
              <h3 className="text-base font-semibold text-emerald-200">
                High-Contrast Emerald Card
              </h3>
              <p className="text-xs text-emerald-100/70">
                Wide telemetry container verifying zero spotlight bleed to adjacent surfaces.
              </p>
            </CursorSpotlight>
          </div>
        </section>

        {/* SECTION F: Accessibility & Native Inputs */}
        <section className="space-y-4" aria-labelledby="pg-section-f">
          <h2 id="pg-section-f" className="text-xl font-semibold text-white">
            Section F — Accessibility, OTP &amp; Text-Input Native Restoration
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-2xl border border-white/10 bg-[#050b09]">
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-zinc-300">
                  Standard Text Input (must restore native I-beam cursor)
                </span>
                <input
                  type="text"
                  data-testid="pg-text-input"
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  className="w-full rounded-xl bg-black border border-white/15 px-3.5 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </label>

              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-zinc-300">
                  8-Character OTP Field (zero cursor occlusion)
                </span>
                <div className="flex flex-wrap gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      aria-label={`OTP digit ${idx + 1}`}
                      data-testid={`pg-otp-${idx}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-10 h-11 rounded-lg bg-black border border-white/15 text-center font-mono text-base text-white focus:border-emerald-400 focus:outline-none"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-zinc-300">Textarea Surface</span>
                <textarea
                  rows={2}
                  data-testid="pg-textarea"
                  defaultValue="Multiline operator notes remain completely unoccluded."
                  className="w-full rounded-xl bg-black border border-white/15 px-3.5 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  aria-label="Channel selector"
                  data-testid="pg-select"
                  className="rounded-lg bg-black border border-white/15 px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="whatsapp">WhatsApp Cloud API</option>
                  <option value="instagram">Instagram DM</option>
                </select>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  data-testid="pg-contenteditable"
                  className="px-3 py-2 rounded-lg bg-black border border-white/15 text-xs text-zinc-200 min-w-[180px]"
                >
                  Editable region
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION G: Live Physics Tuning Controls */}
        <section className="space-y-4" aria-labelledby="pg-section-g">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="pg-section-g" className="text-xl font-semibold text-white">
                Section G — Live Physics Tuning Panel
              </h2>
              <p className="text-xs text-zinc-400">
                Scoped strictly to /cursor-playground — automatically clears when navigating away.
              </p>
            </div>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={resetPlaygroundOverrides}
              disabled={Object.keys(playgroundOverrides).length === 0}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-6 rounded-2xl border border-white/10 bg-[#050b09] text-xs">
            <TuningSlider
              label="Follow Responsiveness"
              testId="pg-slider-responsiveness"
              value={config.followResponsiveness}
              min={0.25}
              max={1.5}
              step={0.05}
              onChange={(v) => setPlaygroundOverrides({ followResponsiveness: v })}
            />
            <TuningSlider
              label="Spring Stiffness"
              testId="pg-slider-stiffness"
              value={config.outerStiffness}
              min={60}
              max={400}
              step={10}
              onChange={(v) => setPlaygroundOverrides({ outerStiffness: v })}
            />
            <TuningSlider
              label="Outer Damping"
              testId="pg-slider-damping"
              value={config.outerDamping}
              min={10}
              max={46}
              step={1}
              onChange={(v) => setPlaygroundOverrides({ outerDamping: v })}
            />
            <TuningSlider
              label="Max Separation (px)"
              testId="pg-slider-max-separation"
              value={config.maxSeparationPx}
              min={24}
              max={120}
              step={2}
              onChange={(v) => setPlaygroundOverrides({ maxSeparationPx: v })}
            />
            <TuningSlider
              label="Default Ring Size (px)"
              testId="pg-slider-default-ring"
              value={config.defaultRingSize}
              min={28}
              max={68}
              step={2}
              onChange={(v) => setPlaygroundOverrides({ defaultRingSize: v })}
            />
            <TuningSlider
              label="Hover Ring Size (px)"
              testId="pg-slider-hover-ring"
              value={config.hoverRingSize}
              min={44}
              max={96}
              step={2}
              onChange={(v) => setPlaygroundOverrides({ hoverRingSize: v })}
            />
            <TuningSlider
              label="Magnetic Scalar"
              testId="pg-slider-magnetic"
              value={config.magneticStrength}
              min={0}
              max={1.2}
              step={0.04}
              onChange={(v) => setPlaygroundOverrides({ magneticStrength: v })}
            />
            <TuningSlider
              label="Spotlight Opacity"
              testId="pg-slider-spotlight"
              value={config.spotlightIntensity}
              min={0}
              max={0.4}
              step={0.02}
              onChange={(v) => setPlaygroundOverrides({ spotlightIntensity: v })}
            />
            <TuningSlider
              label="Glow Intensity"
              testId="pg-slider-glow"
              value={config.glowIntensity}
              min={0}
              max={2}
              step={0.1}
              onChange={(v) => setPlaygroundOverrides({ glowIntensity: v })}
            />
            <TuningSlider
              label="Click Compression Scale"
              testId="pg-slider-compression"
              value={config.clickCompressionScale}
              min={0.55}
              max={0.98}
              step={0.02}
              onChange={(v) => setPlaygroundOverrides({ clickCompressionScale: v })}
            />
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            Active defaults: responsiveness={DEFAULT_CURSOR_PHYSICS.followResponsiveness}, stiffness=
            {DEFAULT_CURSOR_PHYSICS.outerStiffness}, damping={DEFAULT_CURSOR_PHYSICS.outerDamping},
            maxSep={DEFAULT_CURSOR_PHYSICS.maxSeparationPx}px, dot={DEFAULT_CURSOR_PHYSICS.dotSize}
            px, ring={DEFAULT_CURSOR_PHYSICS.defaultRingSize}px/{DEFAULT_CURSOR_PHYSICS.hoverRingSize}
            px
          </p>
        </section>
      </div>
    </div>
  );
}

function TuningSlider({
  label,
  testId,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  testId?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="space-y-1.5 block">
      <div className="flex items-center justify-between text-zinc-300">
        <span>{label}</span>
        <span className="font-mono text-emerald-300 tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        data-testid={testId}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-400"
      />
    </label>
  );
}
