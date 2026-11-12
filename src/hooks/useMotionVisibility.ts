"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Returns whether the current browser tab is visible so looping product
 * animations and background timers suspend immediately when unfocused.
 */
export function useIsDocumentVisible(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(() =>
    typeof document === "undefined" ? true : !document.hidden,
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return isVisible;
}

/**
 * Tracks whether a DOM node is intersecting the viewport using a single
 * IntersectionObserver per host to pause offscreen product animations.
 */
export function useInViewport(
  ref: RefObject<Element | null>,
  rootMargin = "120px",
  defaultValue = true,
): boolean {
  const [inView, setInView] = useState<boolean>(defaultValue);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setInView(entry.isIntersecting);
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
