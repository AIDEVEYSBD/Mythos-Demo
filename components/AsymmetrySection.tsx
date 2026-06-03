"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------- Content data ---------------------------- */

const ATTACKER: string[] = [
  "Needs a single exploit to succeed — once.",
  "Reuses one finding across thousands of targets (1 : N).",
  "Treats every published patch as an exploit blueprint.",
  "Operates as a syndicate — tools and findings shared instantly.",
  "Pays no testing, no change-control, no downtime cost.",
];

const DEFENDER: string[] = [
  "Must hold every system, every dependency, every day.",
  "Tests, stages, and schedules each patch before it ships.",
  "Cannot assume a fix will exist in time to remediate.",
  "Carries supply-chain risk far beyond its own code.",
  "Absorbs the operational cost of every change.",
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function AsymmetrySection() {
  const rootRef = useRef<HTMLElement>(null);
  const beamRef = useRef<SVGGElement>(null);
  const leftPanRef = useRef<SVGGElement>(null);
  const rightPanRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ---- Reveal-on-scroll (replays on scroll up/down) ---------------- */
      revealBatch(".asym-reveal", { start: "top 85%", stagger: 0.09 });

      /* ---- The scale tips toward the attacker as it enters view --------- */
      // We tween a single value 0→1 and derive the beam tilt + pan offsets.
      const state = { t: 0 };
      const TILT = 13; // degrees the beam rotates toward the attacker (left)
      const DROP = 26; // px the heavy pan drops / the light pan rises

      const apply = () => {
        const e = state.t;
        if (beamRef.current) beamRef.current.setAttribute("transform", `rotate(${-TILT * e} 200 90)`);
        // Left (attacker) pan drops; right (defender) pan rises. The pans also
        // counter-rotate slightly so they hang naturally from the beam ends.
        if (leftPanRef.current) leftPanRef.current.setAttribute("transform", `translate(0 ${DROP * e})`);
        if (rightPanRef.current) rightPanRef.current.setAttribute("transform", `translate(0 ${-DROP * e})`);
      };

      // Tips toward the attacker on enter; resets level when scrolled back up,
      // so it replays each time it comes into view.
      ScrollTrigger.create({
        trigger: ".asym-scale",
        start: "top 70%",
        onEnter: () =>
          gsap.to(state, { t: 1, duration: 1.8, ease: "elastic.out(1, 0.6)", onUpdate: apply, overwrite: true }),
        onLeaveBack: () =>
          gsap.to(state, { t: 0, duration: 0.5, ease: "power2.in", onUpdate: apply, overwrite: true }),
      });
      apply();
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="asymmetry" ref={rootRef} className="relative scroll-mt-16 bg-transparent px-8 py-28 lg:px-24 lg:py-40">
      {/* Section marker */}
      <div className="asym-reveal mb-16 flex items-center gap-4">
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">04</span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          The Asymmetry
        </span>
      </div>

      {/* Heading */}
      <div className="mx-auto max-w-4xl text-center">
        <p className="asym-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          Why this favours the attacker
        </p>
        <h2 className="asym-reveal mt-6 font-cormorant text-5xl font-light leading-tight text-white lg:text-6xl">
          The attacker needs one.
          <br />
          You must hold everything.
        </h2>
        <p className="asym-reveal mx-auto mt-8 max-w-2xl font-inter text-lg leading-relaxed text-[#a3a3a3]">
          AI accelerates both sides. It speeds patch development and reduces defects in new
          code — but the gains are not shared evenly. Patching has inherent limits that
          exploitation does not, so every increase in capability hands the attacker the larger share.
        </p>
      </div>

      {/* ===== The balance scale ========================================= */}
      <div className="asym-scale mx-auto mt-16 max-w-md">
        <svg viewBox="0 0 400 260" className="w-full">
          {/* stand */}
          <line x1="200" y1="70" x2="200" y2="225" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round" />
          <path d="M150 235 L250 235 L235 225 L165 225 Z" fill="rgba(255,255,255,0.12)" />
          <circle cx="200" cy="78" r="6" fill="#f59e0b" />

          {/* beam + hanging pans (rotates as a unit; pans translate within) */}
          <g ref={beamRef}>
            <line x1="60" y1="90" x2="340" y2="90" stroke="rgba(255,255,255,0.55)" strokeWidth="4" strokeLinecap="round" />

            {/* left pan — ATTACKER (drops) */}
            <g ref={leftPanRef}>
              <line x1="60" y1="90" x2="60" y2="135" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" />
              <path d="M22 135 A38 22 0 0 0 98 135 Z" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth="2" />
              <text x="60" y="128" textAnchor="middle" className="font-cormorant" fontSize="26" fill="#f59e0b">1</text>
            </g>

            {/* right pan — DEFENDER (rises) */}
            <g ref={rightPanRef}>
              <line x1="340" y1="90" x2="340" y2="135" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <path d="M302 135 A38 22 0 0 0 378 135 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
              <text x="340" y="128" textAnchor="middle" className="font-cormorant" fontSize="26" fill="#ffffff">N</text>
            </g>
          </g>
        </svg>
        <div className="mt-2 flex justify-between px-2">
          <span className="font-inter text-xs uppercase tracking-[0.25em] text-[#f59e0b]">One exploit</span>
          <span className="font-inter text-xs uppercase tracking-[0.25em] text-[#a3a3a3]">Every system</span>
        </div>
      </div>

      {/* ===== Paired columns ============================================ */}
      <div className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attacker */}
        <div className="asym-reveal rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/[0.03] p-8 lg:p-10">
          <p className="font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
            The attacker&apos;s advantage
          </p>
          <ul className="mt-7 space-y-5">
            {ATTACKER.map((a) => (
              <li key={a} className="flex gap-4">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#f59e0b]" />
                <span className="font-inter text-base leading-relaxed text-white">{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Defender */}
        <div className="asym-reveal rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 lg:p-10">
          <p className="font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#a3a3a3]">
            The defender&apos;s burden
          </p>
          <ul className="mt-7 space-y-5">
            {DEFENDER.map((d) => (
              <li key={d} className="flex gap-4">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-white/40" />
                <span className="font-inter text-base leading-relaxed text-[#a3a3a3]">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== Punchline ================================================= */}
      <figure className="asym-reveal mx-auto mt-24 max-w-4xl text-center">
        <blockquote className="font-cormorant text-4xl font-light leading-snug text-white lg:text-5xl">
          We cannot outwork machine-speed threats.
          <br />
          <span className="text-[#f59e0b]">The answer is not more effort — it is leverage.</span>
        </blockquote>
        <figcaption className="mt-8 font-inter text-xs uppercase tracking-[0.25em] text-[#606060]">
          Re-prioritize · Automate · Contain
        </figcaption>
      </figure>
    </section>
  );
}
