"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------- Content data ---------------------------- */

type Category = "Governance" | "Risk Control" | "Operational Enabler";
type Risk = "CRITICAL" | "HIGH";

interface Action {
  n: number;
  name: string;
  category: Category;
  risk: Risk;
  horizon: string;
  what: string;
}

interface Bucket {
  start: string;
  actions: Action[];
}

// The priority actions, grouped by when they should commence.
const BUCKETS: Bucket[] = [
  {
    start: "This week",
    actions: [
      {
        n: 1,
        name: "Point agents at your code",
        category: "Operational Enabler",
        risk: "CRITICAL",
        horizon: "Ongoing",
        what: "Turn LLM capability inward. Ask an agent for a security review today; build toward review-before-merge for all code, human or AI-generated. Tools exist now — Claude Code Security (Anthropic), Codex Security (OpenAI), and open-source OpenAnt (Knostic) and raptor.",
      },
      {
        n: 2,
        name: "Require AI agent adoption",
        category: "Risk Control",
        risk: "CRITICAL",
        horizon: "Ongoing",
        what: "Formalize agent use across every security function, with controls and oversight. Optional programs don't overcome cultural inertia — and adoption gates everything else here.",
      },
      {
        n: 4,
        name: "Establish acceleration governance",
        category: "Governance",
        risk: "CRITICAL",
        horizon: "6 months",
        what: "A cross-functional body — Security, Legal, Engineering — to evaluate new threats and fast-track defensive technology. Without it, every other action hits approval friction.",
      },
      {
        n: 5,
        name: "Prepare for continuous patching",
        category: "Risk Control",
        risk: "CRITICAL",
        horizon: "45 days",
        what: "Stand up triage and deployment capacity for a flood of patches as Glasswing disclosures reach major vendors.",
      },
      {
        n: 6,
        name: "Update risk models & reporting",
        category: "Governance",
        risk: "CRITICAL",
        horizon: "45 days",
        what: "Re-baseline metrics, reporting, and business risk to AI-accelerated timelines. Outdated models can underfund the controls that prevent incidents.",
      },
    ],
  },
  {
    start: "This month",
    actions: [
      {
        n: 3,
        name: "Defend your agents",
        category: "Risk Control",
        risk: "CRITICAL",
        horizon: "45 days",
        what: "Agents are privileged and insecure by default, and outside existing controls. Audit the harness — prompts, tools, retrieval, escalation — with the same rigor as permissions.",
      },
      {
        n: 7,
        name: "Inventory & reduce attack surface",
        category: "Risk Control",
        risk: "HIGH",
        horizon: "90 days",
        what: "Use agents to build a continuous inventory and real SBOMs. Shut down unneeded functionality; isolate what you can't patch. You can't defend what you can't see.",
      },
      {
        n: 8,
        name: "Harden your environment",
        category: "Risk Control",
        risk: "HIGH",
        horizon: "6 months",
        what: "Egress filtering (it blocked every public log4j exploit), deep segmentation, Zero Trust, locked dependency chains, phishing-resistant MFA. Every boundary raises attacker cost.",
      },
    ],
  },
  {
    start: "Next 90 days",
    actions: [
      {
        n: 9,
        name: "Build a deception capability",
        category: "Risk Control",
        risk: "HIGH",
        horizon: "6 months",
        what: "Canaries, honey tokens, behavioral monitoring. Deception is exploit-independent — it catches attackers by their behavior, not their tool.",
      },
      {
        n: 10,
        name: "Automate incident response",
        category: "Risk Control",
        risk: "HIGH",
        horizon: "12 months",
        what: "Detection engineering and response that runs, as far as possible, at machine speed: behavioral analysis, pre-authorized containment, playbooks that execute.",
      },
    ],
  },
  {
    start: "Next 6 months",
    actions: [
      {
        n: 11,
        name: "Stand up VulnOps",
        category: "Risk Control",
        risk: "CRITICAL",
        horizon: "12 months",
        what: "A permanent Vulnerability Operations function (VulnOps — introduced by Adkins, Evron & Schneier) — staffed and automated like DevOps, owning continuous discovery and automated remediation across your whole estate.",
      },
    ],
  },
];

const CAT_STYLE: Record<Category, string> = {
  Governance: "border-[#f59e0b]/30 bg-[#f59e0b]/[0.08] text-[#f59e0b]",
  "Risk Control": "border-white/12 bg-white/[0.04] text-[#a3a3a3]",
  "Operational Enabler": "border-[#60a5fa]/30 bg-[#60a5fa]/[0.08] text-[#93c5fd]",
};

export default function ActionsSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealBatch(".act-reveal", { start: "top 88%", stagger: 0.07, duration: 0.6 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="actions" ref={rootRef} className="relative scroll-mt-16 bg-transparent px-8 py-28 lg:px-24 lg:py-40">
      {/* Section marker */}
      <div className="act-reveal mb-16 flex items-center gap-4">
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">08</span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          Priority Actions
        </span>
      </div>

      {/* Heading */}
      <div className="max-w-4xl">
        <p className="act-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          The aggressive timetable
        </p>
        <h2 className="act-reveal mt-6 font-cormorant text-5xl font-light leading-tight text-white lg:text-6xl">
          Eleven moves, in order of urgency.
        </h2>
        <p className="act-reveal mt-8 max-w-2xl font-inter text-lg leading-relaxed text-[#a3a3a3]">
          For the CISO who needs a plan by Monday. Each action carries a start window and a horizon
          to completion. The pace is deliberately aggressive — calibrate it to your environment.
        </p>
        {/* legend */}
        <div className="act-reveal mt-8 flex flex-wrap gap-2.5">
          {(["Governance", "Risk Control", "Operational Enabler"] as Category[]).map((c) => (
            <span
              key={c}
              className={`rounded-md border px-2.5 py-1 font-inter text-[11px] uppercase tracking-[0.12em] ${CAT_STYLE[c]}`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* ===== Timeline buckets ========================================= */}
      <div className="relative mt-16">
        {/* horizontal spine */}
        <div className="absolute left-0 right-0 top-[18px] hidden h-px bg-gradient-to-r from-[#f59e0b]/60 via-[#f59e0b]/20 to-transparent lg:block" />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-6">
          {BUCKETS.map((b) => (
            <div key={b.start}>
              {/* bucket label */}
              <div className="act-reveal mb-6 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" style={{ boxShadow: "0 0 12px rgba(245,158,11,0.7)" }} />
                <span className="font-inter text-sm font-medium uppercase tracking-[0.18em] text-white">{b.start}</span>
              </div>

              <div className="space-y-4">
                {b.actions.map((a) => (
                  <div
                    key={a.n}
                    className={`act-reveal rounded-2xl border p-6 ${
                      a.category === "Governance"
                        ? "border-[#f59e0b]/30 bg-[#f59e0b]/[0.03]"
                        : "border-white/[0.08] bg-[#0d0d0d]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-cormorant text-3xl font-light leading-none text-[#f59e0b]">
                        {String(a.n).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1 font-inter text-base font-semibold leading-snug text-white">{a.name}</h3>
                    </div>
                    <p className="mt-3 font-inter text-sm leading-relaxed text-[#a3a3a3]">{a.what}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 font-inter text-[10px] uppercase tracking-[0.12em] ${CAT_STYLE[a.category]}`}
                      >
                        {a.category}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 font-inter text-[10px] uppercase tracking-[0.12em] ${
                          a.risk === "CRITICAL"
                            ? "border-[#ef4444]/30 bg-[#ef4444]/[0.08] text-[#f87171]"
                            : "border-[#f59e0b]/30 bg-[#f59e0b]/[0.08] text-[#f59e0b]"
                        }`}
                      >
                        {a.risk}
                      </span>
                      <span className="font-inter text-[11px] text-[#606060]">→ {a.horizon}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* A note on nuance — some of these recommendations are in tension. */}
      <div className="act-reveal mx-auto mt-16 max-w-3xl rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6 lg:p-8">
        <p className="font-inter text-xs font-medium uppercase tracking-[0.2em] text-[#f59e0b]">
          A word on nuance
        </p>
        <p className="mt-4 font-inter text-sm leading-relaxed text-[#a3a3a3]">
          Some of these pull against each other. The case for patching faster competes directly with
          the case for a supply-chain cooldown before deploying third-party updates. There is no
          single right answer — calibrate by asset criticality, blast radius, and your tolerance for
          downtime. This is a judgement, not a checklist.
        </p>
      </div>

      <p className="act-reveal mx-auto mt-16 max-w-3xl text-center font-cormorant text-2xl font-light leading-snug text-white lg:text-3xl">
        Every one of these can <span className="text-[#f59e0b]">begin this week</span>.
        None of them waits for an industry framework.
      </p>
    </section>
  );
}
