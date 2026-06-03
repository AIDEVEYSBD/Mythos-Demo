"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------- Content data ---------------------------- */

interface Horizon {
  tag: string;
  when: string;
  title: string;
  body: string;
  points: string[];
  color: string;
}

const HORIZONS: Horizon[] = [
  {
    color: "#f59e0b", // amber — act now
    tag: "Operational",
    when: "Now",
    title: "Absorb the wave",
    body: "Treat this like an incident with no clean end. Stand up the capacity to triage and deploy a flood of patches — from the launch partners and 40+ organizations in the Glasswing early-access program alone — without exhausting the team.",
    points: [
      "Prepare for multiple high-severity incidents in one week",
      "Reach minimum viable resilience first",
      "Protect experienced staff from burnout",
    ],
  },
  {
    color: "#38bdf8", // sky — this quarter
    tag: "Risk Management",
    when: "This quarter",
    title: "Re-baseline the risk",
    body: "Business risk has shifted. Re-engage stakeholders on tolerance and reporting before the old numbers mislead a decision.",
    points: [
      "Update metrics, reporting, and risk calculations",
      "Align tolerance for downtime to shorter adversary timelines",
      "Make the change legible to the board",
    ],
  },
  {
    color: "#a78bfa", // violet — longer-term
    tag: "Strategic",
    when: "Longer-term",
    title: "Rebuild for the next wave",
    body: "Mythos is the first of many. Selective overhaul of governance and controls so the program adapts rather than reacts.",
    points: [
      "Governance that onboards technology faster",
      "AI-based defensive controls as they mature",
      "A permanent VulnOps function",
    ],
  },
];

interface Metric {
  label: string;
  was: string;
  now: string;
}

// The measurement shift: from preventing entry to surviving it well.
const METRICS: Metric[] = [
  { label: "Cost of exploitation", was: "Assumed high", now: "Raise it deliberately" },
  { label: "Detection of compromise", was: "Eventually", now: "Early, by design" },
  { label: "Blast radius", was: "Hope it's small", now: "Contained and measured" },
  { label: "Time to recover", was: "Not a headline metric", now: "The headline metric" },
];

// Assumptions the new landscape breaks.
const ASSUMPTIONS: string[] = [
  "Time to exploitation has fallen to minutes",
  "A patch may not be ready in time to remediate",
  "Incident frequency is rising",
  "The CVE system may not scale to AI discovery rates",
  "Citizen coders fragment central control",
  "Threat intelligence lags real discovery",
];

export default function ProgramSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealBatch(".prog-reveal", { start: "top 85%", stagger: 0.1 });
      revealBatch(".prog-horizon", { start: "top 80%", stagger: 0.18, y: 50, duration: 0.8 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="program" ref={rootRef} className="relative scroll-mt-16 bg-transparent px-8 py-28 lg:px-24 lg:py-40">
      {/* Section marker */}
      <div className="prog-reveal mb-16 flex items-center gap-4">
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">07</span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          The Mythos-Ready Program
        </span>
      </div>

      {/* Heading */}
      <div className="max-w-4xl">
        <p className="prog-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          A program across three horizons
        </p>
        <h2 className="prog-reveal mt-6 font-cormorant text-5xl font-light leading-tight text-white lg:text-6xl">
          Operational now. Strategic for what&apos;s next.
        </h2>
        <p className="prog-reveal mt-8 max-w-2xl font-inter text-lg leading-relaxed text-[#a3a3a3]">
          A Mythos-ready program is run like an incident and built like a strategy. It restores
          equilibrium today while preparing for the waves that follow — because Mythos is the first,
          not the last.
        </p>
      </div>

      {/* ===== Three horizons ============================================ */}
      <div className="mt-20 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {HORIZONS.map((h, i) => (
          <div
            key={h.tag}
            className="prog-horizon relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 lg:p-9"
            style={{ boxShadow: `inset 0 2px 0 0 ${h.color}` }}
          >
            {/* connector arrow between columns (desktop) */}
            {i < HORIZONS.length - 1 && (
              <span
                className="absolute -right-[14px] top-1/2 z-10 hidden -translate-y-1/2 font-cormorant text-2xl lg:block"
                style={{ color: `${h.color}80` }}
              >
                →
              </span>
            )}
            <div className="flex items-center justify-between">
              <span
                className="font-inter text-xs font-medium uppercase tracking-[0.2em]"
                style={{ color: h.color }}
              >
                {h.tag}
              </span>
              <span
                className="rounded-full border px-3 py-1 font-inter text-[11px] uppercase tracking-[0.15em]"
                style={{ borderColor: `${h.color}55`, color: h.color }}
              >
                {h.when}
              </span>
            </div>
            <h3 className="mt-6 font-cormorant text-3xl font-light text-white">{h.title}</h3>
            <p className="mt-4 font-inter text-sm leading-relaxed text-[#a3a3a3]">{h.body}</p>
            <ul className="mt-7 space-y-3 border-t border-white/[0.06] pt-6">
              {h.points.map((pt) => (
                <li key={pt} className="flex gap-3 font-inter text-sm leading-relaxed text-white">
                  <span className="mt-1.5 h-1 w-1 flex-none rounded-full" style={{ background: h.color }} />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ===== The metrics shift ======================================== */}
      <div className="mt-28">
        <p className="prog-reveal text-center font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          Minimum viable resilience
        </p>
        <h3 className="prog-reveal mx-auto mt-5 max-w-2xl text-center font-cormorant text-3xl font-light leading-tight text-white lg:text-4xl">
          The metrics move from prevention to resilience.
        </h3>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.label} className="prog-reveal rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6">
              <p className="font-inter text-sm font-semibold text-white">{m.label}</p>
              <p className="mt-4 font-inter text-xs leading-relaxed text-white line-through decoration-white/50">
                {m.was}
              </p>
              <p className="mt-1.5 flex items-start gap-2 font-inter text-sm leading-relaxed text-[#f59e0b]">
                <span className="mt-0.5">→</span>
                {m.now}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Assumptions being challenged ============================= */}
      <div className="prog-reveal mx-auto mt-24 max-w-4xl rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 lg:p-10">
        <p className="font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          Assumptions the new landscape breaks
        </p>
        <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
          {ASSUMPTIONS.map((a) => (
            <div key={a} className="flex gap-3">
              <span className="mt-1 font-inter text-sm text-[#f59e0b]">✕</span>
              <span className="font-inter text-sm leading-relaxed text-[#a3a3a3]">{a}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
