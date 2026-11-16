'use client';

import { useEffect, type RefObject } from 'react';
import { clamp, spatialProfile, SPATIAL_MOTION as M, SPATIAL_SURFACES, type SpatialSurface } from '@/lib/motion/spatialTokens';
import { subscribePointer, type SpatialPointer } from '@/lib/motion/pointer';

type Surface = {
  el: HTMLElement;
  config: SpatialSurface;
  rect: DOMRect;
  top: number;
  inView: boolean;
  entered: boolean;
  baseTransform: string;
  loop?: Animation;
  styles?: Record<string, string>;
};

/** Progressive enhancement only: no initial hidden state, no React updates per frame. */
export function useSpatialMotion(rootRef: RefObject<HTMLDivElement | null>, inspecting = false) {
  useEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    const stage = root.querySelector<HTMLElement>('.starx-stage');
    const camera = root.querySelector<HTMLElement>('.starx-stage-inner');
    const getProfile = () => inspecting ? 'off' as const : spatialProfile();
    let profile = getProfile();
    let frame = 0;
    let dirtyGeometry = true;
    let targetX = 0, targetY = 0;
    let pointerX = 0, pointerY = 0;
    let hovered: HTMLElement | null = null;
    let stageVisible = false;
    let unsubscribe = () => {};
    const animations = new Set<Animation>();
    const ViewTimeline = (window as unknown as { ViewTimeline?: new (options: { subject: Element; axis: 'block' }) => AnimationTimeline }).ViewTimeline;
    const surfaces: Surface[] = SPATIAL_SURFACES.flatMap(config =>
      Array.from(root.querySelectorAll<HTMLElement>(config.selector)).map(el => {
        el.dataset.sxSurface = config.scene;
        if (config.light) el.dataset.sxLight = '';
        return { el, config, rect: el.getBoundingClientRect(), top: 0, inView: false, entered: false, baseTransform: el.style.transform };
      }),
    );
    const animate = (el: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) => {
      if (!el.animate) return;
      const animation = el.animate(frames, options);
      animations.add(animation);
      animation.onfinish = () => { animations.delete(animation); animation.cancel(); };
      return animation;
    };

    function measure() {
      // All geometry reads precede writes. Cached until resize/layout changes.
      const scrollTop = window.scrollY;
      surfaces.forEach(surface => {
        surface.rect = surface.el.getBoundingClientRect();
        surface.top = surface.rect.top + scrollTop;
      });
      dirtyGeometry = false;
    }
    function schedule() {
      if (!frame && !document.hidden && profile !== 'off') frame = requestAnimationFrame(tick);
    }
    function tick() {
      frame = 0;
      // Reading scrollY after each style write forced repeated synchronous style
      // recalculation in Chromium. Snapshot *all* viewport reads before writes.
      const focused = document.activeElement;
      if (dirtyGeometry) measure();
      if (camera && stageVisible && profile === 'desktop') {
        camera.style.transform = `perspective(${M.perspective}px) translate3d(${(targetX * M.camera.translation).toFixed(2)}px,${(targetY * M.camera.translation).toFixed(2)}px,0) rotateX(${(-targetY * M.camera.rotation).toFixed(3)}deg) rotateY(${(targetX * M.camera.rotation).toFixed(3)}deg)`;
      }
      const distance = M.profiles[profile].distance;
      surfaces.forEach(surface => {
        const { el, config, inView } = surface;
        if (!inView) return;
        const interactive = hovered === el && profile === 'desktop' && !el.contains(focused);
        const depth = config.depth ?? M.depth.surface;
        const x = interactive ? pointerX * (config.magnetic ? M.pointer.magnetic : depth * M.pointer.sensitivity) : 0;
        const magneticY = interactive && config.magnetic ? pointerY * M.pointer.magnetic : 0;
        const styles = {
          transform: interactive ? `${surface.baseTransform} translate(${x.toFixed(2)}px,${((-(config.lift ?? 0) + magneticY) * distance).toFixed(2)}px)` : surface.baseTransform,
          rotate: interactive && config.tilt ? `${(-pointerY).toFixed(3)} ${pointerX.toFixed(3)} 0 ${(Math.hypot(pointerX, pointerY) * config.tilt).toFixed(3)}deg` : 'none',
          '--sx-light-x': `${interactive ? (pointerX * 24).toFixed(1) : 0}%`,
          '--sx-light-y': `${interactive ? (pointerY * 18).toFixed(1) : 0}%`,
        };
        Object.entries(styles).forEach(([key, value]) => {
          if (surface.styles?.[key] !== value) el.style.setProperty(key, value);
        });
        surface.styles = styles;
        const hoverState = interactive ? 'true' : 'false';
        if (el.dataset.sxHover !== hoverState) el.dataset.sxHover = hoverState;
      });
    }
    function playback() {
      let ambientCount = 0;
      const focused = document.activeElement;
      const visible = !document.hidden;
      surfaces.forEach(surface => {
        const running = profile === 'desktop' && surface.inView && visible;
        const activeState = running ? 'true' : 'false';
        if (surface.el.dataset.sxActive !== activeState) surface.el.dataset.sxActive = activeState;
        if (surface.loop) {
          const play = running && hovered !== surface.el && !surface.el.contains(focused) && ambientCount < M.maxAmbient;
          if (play) { ambientCount++; if (surface.loop.playState !== 'running') surface.loop.play(); }
          else if (hovered === surface.el || surface.el.contains(focused)) surface.loop.cancel();
          else surface.loop.pause();
        }
      });
      const visibleState = visible ? 'true' : 'false';
      if (root.dataset.sxVisible !== visibleState) root.dataset.sxVisible = visibleState;
    }
    function configure() {
      cancelAnimationFrame(frame);
      frame = 0;
      profile = getProfile();
      unsubscribe();
      unsubscribe = profile === 'desktop' ? subscribePointer(onPointer) : () => {};
      root.dataset.sxMotion = profile;
      root.dataset.sxScroll = ViewTimeline ? 'native' : 'static';
      document.documentElement.classList.toggle('starx-motion-off', profile === 'off');
      root.style.setProperty('--sx-ease', M.easing);
      root.style.setProperty('--sx-card-duration', `${M.duration.card}s`);
      root.style.setProperty('--sx-light-intensity', String(M.lighting.surface));
      root.style.setProperty('--sx-environment-intensity', String(M.lighting.environment));
      animations.forEach(animation => animation.cancel());
      animations.clear();
      camera?.style.removeProperty('transform');
      camera?.style.removeProperty('transform-origin');
      if (camera) {
        camera.style.transformOrigin = '50% 25%';
        camera.style.transition = `transform ${M.camera.settlingMs}ms ease-out`;
      }
      targetX = targetY = 0;
      surfaces.forEach((surface, index) => {
        surface.loop = undefined;
        surface.styles = undefined;
        surface.el.style.removeProperty('translate');
        surface.el.style.removeProperty('rotate');
        surface.el.style.transform = surface.baseTransform;
        surface.el.dataset.sxHover = 'false';
        // Native view progress runs outside the JS scroll loop. Unsupported
        // browsers keep the visible static position and IO entrances.
        const travel = (surface.config.depth ?? M.depth.surface) * (surface.config.travel ?? 1.5) * M.profiles[profile].distance;
        if (ViewTimeline && surface.el.animate && profile !== 'off' && travel) {
          const timeline = new ViewTimeline({ subject: surface.el, axis: 'block' });
          const animation = surface.el.animate([{ translate: `0 ${travel}px` }, { translate: `0 ${-travel}px` }], { timeline, fill: 'both' } as KeyframeAnimationOptions);
          animations.add(animation);
        }
        if (surface.config.float && profile === 'desktop') {
          const y = surface.config.float;
          surface.loop = animate(surface.el, [{ transform: `${surface.baseTransform} translateY(0)` }, { transform: `${surface.baseTransform} translateY(${-y}px)` }, { transform: `${surface.baseTransform} translateY(0)` }], {
            duration: (M.duration.environment + (index % 3) * 0.9) * 1000,
            delay: -(index % 4) * 900, iterations: Infinity, easing: 'ease-in-out',
          });
        }
      });
      dirtyGeometry = true;
      playback();
      schedule();
    }
    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === stage) stageVisible = entry.isIntersecting;
        const surface = surfaces.find(item => item.el === entry.target);
        if (!surface) return;
        surface.inView = entry.isIntersecting;
        if (surface.inView && !surface.entered && profile !== 'off') {
          surface.entered = true;
          if (surface.config.entrance) animate(surface.el, [
            { transform: `${surface.baseTransform} translateY(${surface.config.entrance * M.profiles[profile].distance}px)` }, { transform: `${surface.baseTransform} translateY(0)` },
          ], { duration: profile === 'mobile' ? 180 : M.duration.heroChoreography * 1000, delay: (surfaces.indexOf(surface) % 6) * M.stagger * M.profiles[profile].distance, easing: M.easing });
        }
      });
      playback();
      schedule();
    }, { threshold: 0 }) : null;
    surfaces.forEach(surface => observer?.observe(surface.el));
    if (stage) observer?.observe(stage);

    function onPointer(pointer: SpatialPointer) {
      if (profile !== 'desktop') return;
      const onStage = pointer.active && !!stage?.contains(pointer.target);
      const nextX = onStage ? clamp(pointer.x / window.innerWidth * 2 - 1) : 0;
      const nextY = onStage ? clamp(pointer.y / window.innerHeight * 2 - 1) : 0;
      const nextHovered = pointer.active ? pointer.target?.closest<HTMLElement>('[data-sx-surface]') ?? null : null;
      if (targetX === nextX && targetY === nextY && hovered === nextHovered) return;
      targetX = nextX; targetY = nextY; hovered = nextHovered;
      const surface = surfaces.find(item => item.el === hovered);
      if (surface) {
        pointerX = clamp((pointer.x - surface.rect.left) / surface.rect.width * 2 - 1);
        pointerY = clamp((pointer.y - (surface.top - window.scrollY)) / surface.rect.height * 2 - 1);
      }
      playback();
      schedule();
    }
    const onResize = () => configure();
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      playback();
      if (!document.hidden) { dirtyGeometry = true; schedule(); }
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('popstate', configure);
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', configure);
    fine.addEventListener('change', configure);
    root.addEventListener('focusin', playback);
    root.addEventListener('focusout', playback);
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { dirtyGeometry = true; schedule(); }) : null;
    resizeObserver?.observe(root);
    configure();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      unsubscribe();
      animations.forEach(animation => animation.cancel());
      window.removeEventListener('resize', onResize);
      window.removeEventListener('popstate', configure);
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', configure);
      fine.removeEventListener('change', configure);
      root.removeEventListener('focusin', playback);
      root.removeEventListener('focusout', playback);
      resizeObserver?.disconnect();
      camera?.style.removeProperty('transform');
      camera?.style.removeProperty('transform-origin');
      camera?.style.removeProperty('transition');
      surfaces.forEach(({ el, baseTransform }) => {
        el.style.transform = baseTransform;
        ['translate', 'rotate', '--sx-light-x', '--sx-light-y'].forEach(key => el.style.removeProperty(key));
        ['sxSurface', 'sxLight', 'sxHover', 'sxActive'].forEach(key => delete el.dataset[key]);
      });
      delete root.dataset.sxMotion;
      delete root.dataset.sxScroll;
      document.documentElement.classList.remove('starx-motion-off');
    };
  }, [rootRef, inspecting]);
}
