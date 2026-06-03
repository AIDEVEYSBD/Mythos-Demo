"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------- Content data ---------------------------- */

const COST: string[] = [
  "Burnout and attrition are a direct operational risk, not an HR footnote.",
  "The expertise needed is scarce, takes years to build, and can't be replaced on short timescales.",
  "Team resilience — workload, mental health, retention — is a strategic priority, equal to the technical work.",
  "Even senior vulnerability researchers are asking whether they still have a place.",
];

const OPPORTUNITY: string[] = [
  "For now, we are not outmoded — agents amplify expertise, they don't replace it.",
  "Every security role is becoming an “AI builder” role, augmented by agents.",
  "The barrier is lower than most realize: getting started is easier than using Excel.",
  "They work across the board — from GRC to incident response, far beyond code.",
];

// Functions agents accelerate — to make "beyond code" concrete for this room.
const ACROSS: string[] = ["GRC", "Audit evidence", "Incident response", "Detection eng.", "Vuln management", "Reporting"];

export default function HumanTurnSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealBatch(".ht-reveal", { start: "top 85%", stagger: 0.1 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="human-turn" ref={rootRef} className="relative scroll-mt-16 bg-transparent px-8 py-28 lg:px-24 lg:py-40">
      {/* Section marker */}
      <div className="ht-reveal mb-16 flex items-center gap-4">
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">10</span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          The Human Turn
        </span>
      </div>

      {/* Heading */}
      <div className="mx-auto max-w-4xl text-center">
        <p className="ht-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          The hardest question in the room
        </p>
        <h2 className="ht-reveal mt-6 font-cormorant text-5xl font-light leading-tight text-white lg:text-6xl">
          Are we outmoded?
        </h2>
        <p className="ht-reveal mx-auto mt-8 max-w-2xl font-inter text-lg leading-relaxed text-[#a3a3a3]">
          It&apos;s the quiet worry behind every one of these slides. We can&apos;t outwork
          machine-speed threats — so the honest answer has two halves, and a leader has to hold both.
        </p>
      </div>

      {/* ===== Two truths ============================================== */}
      <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-2">
        {/* The cost */}
        <div className="ht-reveal rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 lg:p-10">
          <p className="font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#a3a3a3]">
            The human cost is real
          </p>
          <ul className="mt-7 space-y-5">
            {COST.map((c) => (
              <li key={c} className="flex gap-4">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-white/40" />
                <span className="font-inter text-base leading-relaxed text-[#a3a3a3]">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The opportunity */}
        <div className="ht-reveal rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/[0.03] p-8 lg:p-10">
          <p className="font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
            And the opportunity is bigger
          </p>
          <ul className="mt-7 space-y-5">
            {OPPORTUNITY.map((o) => (
              <li key={o} className="flex gap-4">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#f59e0b]" />
                <span className="font-inter text-base leading-relaxed text-white">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== The line that reframes it =============================== */}
      <figure className="ht-reveal mx-auto mt-24 max-w-4xl text-center">
        <blockquote className="font-cormorant text-4xl font-light leading-snug text-white lg:text-5xl">
          Every security role is becoming an
          <span className="text-[#f59e0b]"> AI builder</span>.
        </blockquote>
        <figcaption className="mt-7 font-inter text-lg text-[#a3a3a3]">
          Easier than Excel. All you need to know is English.
        </figcaption>
      </figure>

      {/* across-the-board strip */}
      <div className="ht-reveal mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
        <span className="mr-1 font-inter text-[11px] uppercase tracking-[0.2em] text-[#606060]">Not just code —</span>
        {ACROSS.map((a) => (
          <span
            key={a}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-inter text-xs text-[#a3a3a3]"
          >
            {a}
          </span>
        ))}
      </div>

      <p className="ht-reveal mx-auto mt-16 max-w-2xl text-center font-inter text-base leading-relaxed text-[#606060]">
        This isn&apos;t a crisis of relevance — it&apos;s a normal response to a disruptive shift. The
        practitioners who adapt fastest will be the ones who lean into the tooling rather than guard
        against it.
      </p>
    </section>
  );
}
