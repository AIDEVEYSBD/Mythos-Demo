"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Cross-fades a section as it enters AND leaves the viewport — the outgoing
 * section fades out while the incoming one fades in, giving the deck its
 * "Apple-like" scene-to-scene dissolves.
 *
 * Opacity is computed straight from the section's viewport position each scroll
 * (no tween, no scrub lag) and uses OPACITY ONLY — never transform — so it's
 * safe to wrap sections that pin a child via ScrollTrigger (a transformed
 * ancestor would break `position: fixed` pinning).
 */
export default function SectionFade({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const update = () => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // Fade in as the top rises from 95% → 65% of the viewport.
        const fadeIn = clamp01((vh * 0.95 - r.top) / (vh * 0.3));
        // Fade out as the bottom drops from 35% → 5% of the viewport.
        const fadeOut = clamp01((r.bottom - vh * 0.05) / (vh * 0.3));
        el.style.opacity = String(Math.min(fadeIn, fadeOut, 1));
      };

      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onUpdate: update,
        onRefresh: update,
      });
      update();
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className} style={{ willChange: "opacity" }}>
      {children}
    </div>
  );
}
