import React, { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function CustomCursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const ringXSpring = useSpring(ringX, springConfig);
  const ringYSpring = useSpring(ringY, springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isVisible) setIsVisible(true);
    dotX.set(e.clientX);
    dotY.set(e.clientY);

    // Magnetic CTA attraction
    const target = e.target as HTMLElement;
    const magneticEl = target.closest<HTMLElement>("[data-magnetic]");
    if (magneticEl) {
      const rect = magneticEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const maxDist = 100;

      if (dist < maxDist) {
        const pull = 1 - dist / maxDist;
        ringX.set(e.clientX - distX * pull * 0.3);
        ringY.set(e.clientY - distY * pull * 0.3);
        return;
      }
    }

    ringX.set(e.clientX);
    ringY.set(e.clientY);
  }, [dotX, dotY, ringX, ringY, isVisible]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [role="button"], .clickable, [data-magnetic]')) {
        setIsHovered(true);
        setIsCardHovered(false);
      } else if (target.closest(".glass-card, .glass-panel, input, textarea, select")) {
        setIsCardHovered(true);
        setIsHovered(false);
      } else {
        setIsHovered(false);
        setIsCardHovered(false);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [handleMouseMove]);

  return (
    <>
      {/* Outer ring — spring-animated, contextual states */}
      <motion.div
        style={{ x: ringXSpring, y: ringYSpring }}
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center -ml-4 -mt-4 h-8 w-8 rounded-full mix-blend-difference"
        animate={{
          scale: isClicked ? 0.6 : isHovered ? 2 : isCardHovered ? 1.4 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-200 ${
            isHovered
              ? "bg-white/90 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              : isCardHovered
                ? "border border-white/40 bg-white/5"
                : "border-[1.5px] border-white/80"
          }`}
        />
      </motion.div>

      {/* Center dot — instant position, precise */}
      <motion.div
        style={{ x: dotX, y: dotY }}
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
        animate={{
          scale: isClicked ? 0 : isHovered ? 0 : isCardHovered ? 0 : 1,
          opacity: isVisible && !isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
