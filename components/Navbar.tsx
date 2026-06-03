"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "./sections";

/**
 * Persistent top navbar for the deck. Shows the wordmark and a section index
 * with scroll-spy (the active section highlights) and smooth-scroll on click.
 *
 * Sits at z-40 — the intro overlay (z-50) covers it until it slides away,
 * after which the navbar is revealed at the top of the page.
 */
export default function Navbar() {
  const [active, setActive] = useState(SECTIONS[0]?.id ?? "");

  useEffect(() => {
    // Real-time scroll-spy: every animation frame (throttled), the active
    // section is the last one whose top has crossed a reference line ~35% down
    // the viewport. Computing from scroll position (rather than relying on
    // IntersectionObserver threshold crossings) keeps the navbar in lockstep
    // with the scroll — including during snap glides and fast scrolling.
    const ids = SECTIONS.map((s) => s.id);
    let raf = 0;

    const compute = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - 1 <= line) current = id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0a]/70 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-8 lg:px-24">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-inter text-sm font-medium uppercase tracking-[0.35em] text-white transition-opacity hover:opacity-80"
        >
          Claude&nbsp;Mythos
        </button>

        {/* Compact index: numbers always show; the active section also reveals
            its title (animated width) so ten sections fit without crowding. */}
        <nav className="flex items-center gap-3 sm:gap-4">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(s.id)}
                aria-current={isActive ? "true" : undefined}
                title={s.title}
                className={`flex items-baseline gap-2 font-inter text-xs uppercase tracking-[0.2em] transition-colors ${
                  isActive ? "text-white" : "text-[#606060] hover:text-[#a3a3a3]"
                }`}
              >
                <span className={isActive ? "text-[#f59e0b]" : ""}>{s.num}</span>
                <span
                  className={`hidden overflow-hidden whitespace-nowrap transition-all duration-300 sm:inline ${
                    isActive ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
                  }`}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
