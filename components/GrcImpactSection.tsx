"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------- Content data ---------------------------- */

interface Shift {
  was: string;
  now: string;
}

interface Pillar {
  num: string;
  title: string;
  lead: string;
  shifts: Shift[];
  impact: string;
  frameworks: string[];
}

const PILLARS: Pillar[] = [
  {
    num: "01",
    title: "The risk model is outdated",
    lead: "The assumptions underneath today's metrics were written for a slower adversary. Several no longer hold.",
    shifts: [
      { was: "Weeks from disclosure to exploit", now: "Hours — sometimes minutes" },
      { was: "A patch will be ready in time", now: "No patch may exist when you need it" },
      { was: "Measure prevention", now: "Measure containment and time-to-recover" },
    ],
    impact:
      "The CISO's ability to control risk has measurably narrowed — which flows directly into business reporting, projections, and the funding of the controls that prevent incidents.",
    frameworks: ["GV.RM", "GV.OC", "RS.CO"],
  },
  {
    num: "02",
    title: "The standard of care is shifting",
    lead: "Regulation tests defensive effort against what is reasonable. When AI scanning is cheap and available, reasonable moves.",
    shifts: [
      { was: "AI defensive tooling is optional", now: "Not using it invites a negligence question" },
      { was: "Reasonableness is a stable bar", now: "The bar rises as capability spreads" },
      { was: "Compliance is a checklist", now: "The EU AI Act adds audit & incident duties (Aug 2026)" },
    ],
    impact:
      "Boards will be asked whether they used the tools available to find their own weaknesses first. This is a governance risk with direct financial exposure.",
    frameworks: ["GV.RR", "GV.OC", "GV.RM"],
  },
  {
    num: "03",
    title: "Governance friction is now a liability",
    lead: "Approval cycles built for a calmer threat environment now slow the very defenses you need to deploy.",
    shifts: [
      { was: "Onboard a control over quarters", now: "Friction has a harder deadline" },
      { was: "Security, Legal, Engineering in silos", now: "One cross-functional acceleration body" },
      { was: "Wait for industry frameworks", now: "Define your own guardrails now" },
    ],
    impact:
      "Without a mechanism to evaluate new threats and fast-track defensive technology, every other action runs into approval friction — to the attacker's advantage.",
    frameworks: ["GV.OV", "GV.RR", "GV.SC"],
  },
];

interface Framework {
  code: string;
  name: string;
  scope: string;
  color: string;
}

const FRAMEWORKS: Framework[] = [
  { code: "NIST CSF 2.0", name: "Govern · Identify · Protect · Detect · Respond", scope: "The program backbone", color: "#38bdf8" },
  { code: "MITRE ATLAS", name: "Adversarial techniques against AI/ML", scope: "How the attack works", color: "#fb7185" },
  { code: "OWASP LLM 2025", name: "Top 10 for LLM applications", scope: "Risk in LLM components", color: "#2dd4bf" },
  { code: "OWASP Agentic 2026", name: "Top 10 for agentic applications", scope: "Risk in autonomous agents", color: "#a78bfa" },
];

export default function GrcImpactSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealBatch(".grc-reveal", { start: "top 85%", stagger: 0.1 });
      // Pillars build upward as they enter.
      revealBatch(".grc-pillar", { start: "top 80%", stagger: 0.15, y: 50, duration: 0.8 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="grc-impact" ref={rootRef} className="relative scroll-mt-16 bg-transparent px-8 py-28 lg:px-24 lg:py-40">
      {/* Section marker */}
      <div className="grc-reveal mb-16 flex items-center gap-4">
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">05</span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          What This Means for GRC
        </span>
      </div>

      {/* Heading */}
      <div className="max-w-4xl">
        <p className="grc-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          Governance · Risk · Compliance
        </p>
        <h2 className="grc-reveal mt-6 font-cormorant text-5xl font-light leading-tight text-white lg:text-6xl">
          This is a governance event
          <br />
          before it is a technical one.
        </h2>
        <p className="grc-reveal mt-8 max-w-2xl font-inter text-lg leading-relaxed text-[#a3a3a3]">
          The exploits are the headline. The exposure your team owns is quieter and more durable:
          the risk models, the standard of care, and the speed at which you can govern change.
        </p>
      </div>

      {/* ===== Three pillars ============================================= */}
      <div className="mt-20 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.num}
            className="grc-pillar flex flex-col rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 lg:p-9"
          >
            <div className="flex items-baseline gap-4">
              <span className="font-cormorant text-4xl font-light text-[#f59e0b]">{p.num}</span>
              <h3 className="font-cormorant text-2xl font-light leading-tight text-white lg:text-3xl">{p.title}</h3>
            </div>
            <p className="mt-5 font-inter text-sm leading-relaxed text-[#a3a3a3]">{p.lead}</p>

            {/* old → new shifts */}
            <div className="mt-7 space-y-4">
              {p.shifts.map((s) => (
                <div key={s.was} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <p className="font-inter text-xs leading-relaxed text-[#606060] line-through decoration-[#606060]/50">
                    {s.was}
                  </p>
                  <p className="mt-1.5 flex items-start gap-2 font-inter text-sm leading-relaxed text-white">
                    <span className="mt-0.5 text-[#f59e0b]">→</span>
                    {s.now}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-7 border-t border-white/[0.06] pt-6 font-inter text-sm leading-relaxed text-[#a3a3a3]">
              {p.impact}
            </p>

            {/* framework refs */}
            <div className="mt-6 flex flex-wrap gap-2">
              {p.frameworks.map((f) => (
                <span
                  key={f}
                  className="rounded-md border border-[#f59e0b]/20 bg-[#f59e0b]/[0.06] px-2.5 py-1 font-inter text-[11px] uppercase tracking-[0.1em] text-[#f59e0b]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Framework mapping band =================================== */}
      <div className="mt-24">
        <p className="grc-reveal text-center font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          The frameworks this maps to
        </p>
        <h3 className="grc-reveal mx-auto mt-5 max-w-2xl text-center font-cormorant text-3xl font-light leading-tight text-white lg:text-4xl">
          You already own the language for this.
        </h3>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FRAMEWORKS.map((f) => (
            <div
              key={f.code}
              className="grc-reveal overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d]"
              style={{ boxShadow: `inset 0 2px 0 0 ${f.color}` }}
            >
              <div className="p-6">
                <p className="font-inter text-sm font-semibold" style={{ color: f.color }}>
                  {f.code}
                </p>
                <p className="mt-3 font-inter text-xs leading-relaxed text-[#a3a3a3]">{f.name}</p>
                <p className="mt-4 font-inter text-[11px] uppercase tracking-[0.18em] text-[#606060]">{f.scope}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="grc-reveal mx-auto mt-10 max-w-2xl text-center font-inter text-sm leading-relaxed text-[#606060]">
          Every risk in the register that follows is tagged to these four. The shift is real,
          but it is legible — and that is the opening for the program.
        </p>
      </div>
    </section>
  );
}
