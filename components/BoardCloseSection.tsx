"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------- Content data ---------------------------- */

interface TalkingPoint {
  tag: string;
  title: string;
  body: string;
}

const TALKING_POINTS: TalkingPoint[] = [
  {
    tag: "Talking point",
    title: "AI accelerates both sides",
    body: "The same capability that makes the business faster makes the adversary faster. It has compressed time-to-incident from weeks to hours. Turned inward, these tools let us find and fix our own weaknesses before attackers do — the security program we've funded is exactly what makes that strategy viable.",
  },
  {
    tag: "Talking point",
    title: "An aggressive plan is needed",
    body: "This is not an open-ended AI initiative. We are seeking alignment to execute a targeted 90-day plan with clear owners and outcomes — returning risk toward pre-Mythos levels and demonstrating due diligence against a documented shift in the threat environment.",
  },
];

interface PlanItem {
  n: string;
  title: string;
  detail: string;
}

// The 90-day plan to present upstairs.
const PLAN: PlanItem[] = [
  { n: "01", title: "Increase people & capacity", detail: "Repurpose staff and add capacity for triage, remediation, and incidents — while protecting experienced staff from burnout." },
  { n: "02", title: "Deploy AI tooling", detail: "Formalize agent use across security: scan our own code, require AI review before code ships, augment teams with purpose-built agents." },
  { n: "03", title: "Harden infrastructure", detail: "Asset inventories, reduced exposure, segmentation, Zero Trust, egress filtering — validated across internal systems and key third parties." },
  { n: "04", title: "Accelerate procurement & governance", detail: "Align Security, Legal, and Engineering to evaluate threats and fast-track defensive technology. Current cycles are too slow." },
  { n: "05", title: "Update playbooks", detail: "Technical and communications response plans that execute at speed, including pre-authorized containment for simultaneous incidents." },
  { n: "06", title: "Track progress", detail: "Regular check-ins across the 90 days to capture results and surface roadblocks early." },
];

// What "Mythos-ready" actually means — the four-part definition from the brief.
const READY_MEANS: { title: string; body: string }[] = [
  { title: "Resilient architecture", body: "Limit attackers' ability to exploit what they find — and contain the impact when they do." },
  { title: "Find it first", body: "Discover more of your own vulnerabilities in advance of any adversary or vendor advisory." },
  { title: "Respond at scale", body: "Handle incidents quickly and in volume, containing impact to minimize business disruption." },
  { title: "Accelerate with agents", body: "Compound your program and your people with AI — starting this week, across every function." },
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function BoardCloseSection() {
  const rootRef = useRef<HTMLElement>(null);
  const respondRef = useRef<SVGPathElement>(null);
  const gapRef = useRef<SVGPathElement>(null);
  const respondDotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealBatch(".bc-reveal", { start: "top 88%", stagger: 0.1 });

      /* ---- "Closing the gap" chart: response line rises to meet discovery */
      // Discovery line is fixed near the top (fast). The response line starts
      // low and animates up; the shaded gap between them collapses.
      const W = 600;
      const DISCOVERY_Y = 60; // attacker discovery — fast, near top
      const START_Y = 230; // response starts slow (low on the chart = more time)
      const END_Y = 95; // response ends close to discovery (gap nearly closed)

      const state = { t: 0 };
      const respondPath = (y: number) =>
        `M0 ${START_Y} C ${W * 0.35} ${START_Y}, ${W * 0.5} ${y + 30}, ${W} ${y}`;
      const gapPath = (y: number) =>
        `M0 ${DISCOVERY_Y} L ${W} ${DISCOVERY_Y} L ${W} ${y} C ${W * 0.5} ${y + 30}, ${W * 0.35} ${START_Y}, 0 ${START_Y} Z`;

      const apply = () => {
        const y = START_Y + (END_Y - START_Y) * state.t;
        respondRef.current?.setAttribute("d", respondPath(y));
        gapRef.current?.setAttribute("d", gapPath(y));
        respondDotRef.current?.setAttribute("cy", String(y));
      };
      apply();

      // Closes the gap on enter; reopens it when scrolled back up, so it replays.
      ScrollTrigger.create({
        trigger: ".bc-chart",
        start: "top 70%",
        onEnter: () => gsap.to(state, { t: 1, duration: 2, ease: "power3.inOut", onUpdate: apply, overwrite: true }),
        onLeaveBack: () => gsap.to(state, { t: 0, duration: 0.6, ease: "power2.in", onUpdate: apply, overwrite: true }),
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="board-close" ref={rootRef} className="relative scroll-mt-16 overflow-hidden bg-transparent px-8 py-28 lg:px-24 lg:py-40">
      {/* Section marker */}
      <div className="bc-reveal mb-16 flex items-center gap-4">
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">11</span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          The Board Briefing
        </span>
      </div>

      {/* Heading */}
      <div className="max-w-4xl">
        <p className="bc-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          Taking it upstairs
        </p>
        <h2 className="bc-reveal mt-6 font-cormorant text-5xl font-light leading-tight text-white lg:text-6xl">
          Mythos is now a boardroom concern.
          <br />
          That is the opening.
        </h2>
        <p className="bc-reveal mt-8 max-w-2xl font-inter text-lg leading-relaxed text-[#a3a3a3]">
          The attention is already here. The job is to convert it — justify the program that&apos;s
          funded, and make the case for what comes next.
        </p>
      </div>

      {/* ===== Talking points =========================================== */}
      <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {TALKING_POINTS.map((t) => (
          <div key={t.title} className="bc-reveal rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 lg:p-10">
            <p className="font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">{t.tag}</p>
            <h3 className="mt-4 font-cormorant text-3xl font-light text-white">{t.title}</h3>
            <p className="mt-5 font-inter text-base leading-relaxed text-[#a3a3a3]">{t.body}</p>
          </div>
        ))}
      </div>

      {/* ===== The 90-day plan ========================================== */}
      <div className="mt-24">
        <p className="bc-reveal text-center font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          The ask · a targeted 90-day plan
        </p>
        <h3 className="bc-reveal mx-auto mt-5 max-w-2xl text-center font-cormorant text-3xl font-light leading-tight text-white lg:text-4xl">
          Clear owners. Clear outcomes. One quarter.
        </h3>
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLAN.map((p) => (
            <div key={p.n} className="bc-reveal rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-7">
              <span className="font-cormorant text-4xl font-light text-[#f59e0b]">{p.n}</span>
              <h4 className="mt-4 font-inter text-base font-semibold text-white">{p.title}</h4>
              <p className="mt-3 font-inter text-sm leading-relaxed text-[#a3a3a3]">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Closing the gap (animated) =============================== */}
      <div className="mx-auto mt-28 max-w-4xl">
        <p className="bc-reveal text-center font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          What &ldquo;Mythos-ready&rdquo; means
        </p>
        <h3 className="bc-reveal mx-auto mt-5 max-w-2xl text-center font-cormorant text-3xl font-light leading-tight text-white lg:text-4xl">
          Permanently closing the gap.
        </h3>

        <div className="bc-chart mt-12 rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6 lg:p-8">
          <svg viewBox="0 0 600 280" className="w-full">
            {/* shaded gap */}
            <path ref={gapRef} d="" fill="rgba(245,158,11,0.07)" />
            {/* discovery line (attacker) */}
            <path d="M0 60 L600 60" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <circle cx="600" cy="60" r="5" fill="#ef4444" />
            {/* response line (you) — animates up */}
            <path ref={respondRef} d="" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <circle ref={respondDotRef} cx="600" cy="230" r="5" fill="#f59e0b" />
          </svg>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <span className="flex items-center gap-2 font-inter text-xs text-[#a3a3a3]">
              <span className="h-2 w-6 rounded-full bg-[#ef4444]" /> Speed of discovery — the attacker
            </span>
            <span className="flex items-center gap-2 font-inter text-xs text-[#a3a3a3]">
              <span className="h-2 w-6 rounded-full bg-[#f59e0b]" /> Speed of response — you
            </span>
          </div>
        </div>
      </div>

      {/* ===== What Mythos-ready means (the 4-part definition) ========== */}
      <div className="mt-28">
        <p className="bc-reveal text-center font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          In four parts
        </p>
        <h3 className="bc-reveal mx-auto mt-5 max-w-2xl text-center font-cormorant text-3xl font-light leading-tight text-white lg:text-4xl">
          Being &ldquo;Mythos-ready&rdquo; means:
        </h3>
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {READY_MEANS.map((r, i) => (
            <div key={r.title} className="bc-reveal rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-7">
              <span className="font-cormorant text-4xl font-light text-[#f59e0b]">{String(i + 1).padStart(2, "0")}</span>
              <h4 className="mt-4 font-inter text-base font-semibold text-white">{r.title}</h4>
              <p className="mt-3 font-inter text-sm leading-relaxed text-[#a3a3a3]">{r.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Collective Defense ====================================== */}
      <div className="bc-reveal mx-auto mt-24 max-w-4xl rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 text-center lg:p-12">
        <p className="font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          And we don&apos;t do it alone
        </p>
        <h3 className="mt-5 font-cormorant text-3xl font-light leading-snug text-white lg:text-4xl">
          Attackers already move as a collective. Defenders must too.
        </h3>
        <p className="mx-auto mt-6 max-w-2xl font-inter text-base leading-relaxed text-[#a3a3a3]">
          Adversaries crowdsource, share tools, and operate as syndicates. The answer is collective
          defense — engaging ISACs, CERTs, sector groups, and standards bodies to share intelligence
          and coordinate response. It matters most for the organizations below the Cyber Poverty Line,
          a concept introduced by Wendy Nather: those without the resources to defend themselves alone.
        </p>
      </div>

      {/* ===== Y2K close ================================================ */}
      <div className="mx-auto mt-28 max-w-4xl text-center">
        <p className="bc-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          We have done this before
        </p>
        <blockquote className="bc-reveal mt-7 font-cormorant text-3xl font-light leading-snug text-white lg:text-5xl">
          Y2K was a systemic threat with a hard deadline, and the industry met it through
          coordinated, disciplined effort.
          <span className="text-[#f59e0b]"> This is the same kind of problem — with far more powerful tools in the defenders&apos; hands.</span>
        </blockquote>
        <p className="bc-reveal mx-auto mt-10 max-w-2xl font-inter text-lg leading-relaxed text-[#a3a3a3]">
          Being Mythos-ready isn&apos;t about reacting to one model or one announcement. It is about
          permanently closing the gap between how fast vulnerabilities are found and how fast your
          organization can respond.
        </p>
        <p className="bc-reveal mt-12 font-cormorant text-4xl font-light text-white lg:text-5xl">
          Every action in this brief can <span className="text-[#f59e0b]">begin this week.</span>
        </p>
        <p className="bc-reveal mx-auto mt-16 max-w-xl border-t border-white/[0.06] pt-8 font-inter text-xs leading-relaxed text-white">
          Source: &ldquo;The AI Vulnerability Storm: Building a Mythos-ready Security Program&rdquo; · CSA CISO
          Community, SANS, [un]prompted, OWASP Gen AI Security Project · v0.95, April 2026 · CC BY-NC 4.0
        </p>
      </div>
    </section>
  );
}
