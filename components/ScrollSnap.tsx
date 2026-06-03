"use client";

import { useEffect } from "react";
import { SECTIONS } from "./sections";

/**
 * Section snap controller — gives each section a snappy "lock to viewport"
 * catch as you scroll into it.
 *
 * Why JS instead of CSS scroll-snap: native `proximity` is too gentle across
 * tall / pinned sections (it barely catches), and `mandatory` would trap the
 * reader inside the multi-screen pinned animations (#how-different,
 * #acceleration). This controller waits for the scroll to come to REST, and
 * only if a section top is within a threshold of the viewport top does it run
 * a short eased glide to lock it. Mid-pin you're far from any section top, so
 * it never fires there and never fights the scrubbed ScrollTrigger animations.
 *
 * Desktop + motion-allowed only; bails out otherwise.
 */
export default function ScrollSnap() {
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!isDesktop.matches || reduce.matches) return;

    const NAV = 64; // px — fixed navbar height; sections lock just beneath it
    const GAP = 48; // px — desired breathing room between navbar and content
    const THRESHOLD = 0.4; // lock when a section top is within 40% vh of the top
    const REST_MS = 100; // how long the scroll must be still before we lock
    const DURATION = 320; // ms — the lock glide; short = snappy

    let restTimer: ReturnType<typeof setTimeout> | undefined;
    let rafId = 0;
    let animating = false;
    let lastY = window.scrollY;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const glideTo = (targetY: number) => {
      const startY = window.scrollY;
      const dist = targetY - startY;
      if (Math.abs(dist) < 2) return;
      animating = true;
      let startTs = 0;
      const step = (ts: number) => {
        if (!startTs) startTs = ts;
        const t = Math.min(1, (ts - startTs) / DURATION);
        window.scrollTo(0, Math.round(startY + dist * easeOutCubic(t)));
        if (t < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          animating = false;
          lastY = window.scrollY;
        }
      };
      rafId = requestAnimationFrame(step);
    };

    const maybeLock = () => {
      if (animating) return;
      const vh = window.innerHeight;
      const y = window.scrollY;

      let best: { top: number; dist: number } | null = null;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        // Lock just under the navbar — but absorb any excess top padding so the
        // section's actual content (not 160px of dead padding) lands a
        // consistent GAP below the navbar. Centered hero sections have no
        // padding, so they're unaffected and still lock flush under the navbar.
        const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0;
        const absorb = Math.max(0, padTop - GAP);
        const lockY = Math.max(0, el.getBoundingClientRect().top + y - NAV + absorb);
        const dist = Math.abs(lockY - y);
        if (!best || dist < best.dist) best = { top: lockY, dist };
      }

      if (best && best.dist > 3 && best.dist < vh * THRESHOLD) glideTo(best.top);
    };

    const onScroll = () => {
      if (animating) return; // ignore the scroll events our own glide emits
      lastY = window.scrollY;
      clearTimeout(restTimer);
      restTimer = setTimeout(maybeLock, REST_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(restTimer);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
