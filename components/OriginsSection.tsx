"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

interface OriginsSectionProps {
  shannonImageSrc?: string;
}

interface Fact {
  stat: string;
  statAmber?: boolean;
  label: string;
  sub: string;
}

interface Model {
  name: string;
  form: string;
  desc: string;
  highlight?: boolean;
}

interface Milestone {
  year: string;
  title: string;
  desc: string;
  highlight?: boolean;
}

interface Principle {
  title: string;
  desc: string;
}

const MODELS: Model[] = [
  {
    name: "Haiku",
    form: "the short form",
    desc: "Near-instant and lightweight. Built for high-volume, low-latency work where speed is everything.",
  },
  {
    name: "Sonnet",
    form: "the balanced form",
    desc: "The workhorse. Strong reasoning and speed held in balance — the everyday frontier.",
  },
  {
    name: "Opus",
    form: "the grand work",
    desc: "Maximum depth. The most capable reasoning Anthropic ships, for the hardest problems.",
  },
  {
    name: "Mythos",
    form: "the legend",
    desc: "The upcoming flagship — a tier above Opus, and the capability that turned vulnerability discovery into a boardroom risk. The subject of this briefing.",
    highlight: true,
  },
];

const TIMELINE: Milestone[] = [
  {
    year: "2021",
    title: "Anthropic founded",
    desc: "Eleven researchers leave OpenAI to build a safety-first frontier lab.",
  },
  {
    year: "2022",
    title: "Constitutional AI",
    desc: "A method to align models to a written set of principles, not just human ratings.",
  },
  {
    year: "2023",
    title: "Claude arrives",
    desc: "The first Claude models ship, scaling to a 100K-token context window.",
  },
  {
    year: "2024",
    title: "The Claude 3 family",
    desc: "Haiku, Sonnet and Opus — one tiered family spanning speed to depth.",
  },
  {
    year: "2025",
    title: "A million tokens",
    desc: "Context windows reach 1M tokens as Opus pushes the capability frontier.",
  },
  {
    year: "Next",
    title: "Claude Mythos",
    desc: "The upcoming flagship — a step change in reasoning and scale.",
    highlight: true,
  },
];

const PRINCIPLES: Principle[] = [
  {
    title: "Constitutional AI",
    desc: "Claude is trained against an explicit constitution — principles it uses to critique and revise its own answers, reducing reliance on humans labeling harmful content.",
  },
  {
    title: "Responsible Scaling",
    desc: "Capabilities are gated behind AI Safety Levels. As models grow more powerful, stricter evaluations and safeguards are required before release.",
  },
  {
    title: "Interpretability",
    desc: "Anthropic studies the internals of its models — the features and circuits behind a prediction — to understand why Claude does what it does.",
  },
];

const FACTS: Fact[] = [
  {
    stat: "1,000,000",
    label: "Token context window",
    sub: "≈ 750,000 words in a single pass",
  },
  {
    stat: "~2T",
    label: "Estimated parameters",
    sub: "est. · 10× the scale of GPT-3",
  },
  {
    stat: "~10T",
    label: "Tokens of training data",
    sub: "est. · more than any human could read in millennia",
  },
  {
    stat: "83.1%",
    statAmber: true,
    label: "CyberGym vulnerability-discovery score",
    sub: "vs Claude Opus 4.6 at 66.6% · Anthropic's own benchmark",
  },
];

export default function OriginsSection({
  shannonImageSrc,
}: OriginsSectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const sectionTagRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const factsLabelRef = useRef<HTMLParagraphElement>(null);
  const factsCardRef = useRef<HTMLDivElement>(null);
  const bulletRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Hover (desktop) / tap (mobile) state for the Claude Shannon modal.
  const [cardOpen, setCardOpen] = useState(false);

  useEffect(() => {
    // Scope all tweens to this section and revert cleanly on unmount.
    const ctx = gsap.context(() => {
      const from = { y: 30, opacity: 0 };
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        sectionTagRef.current,
        from,
        { y: 0, opacity: 1, duration: 0.8 },
        0
      )
        .fromTo(labelRef.current, from, { y: 0, opacity: 1, duration: 0.8 }, 0)
        .fromTo(headingRef.current, from, { y: 0, opacity: 1, duration: 0.8 }, 0)
        .fromTo(
          paragraphRef.current,
          from,
          { y: 0, opacity: 1, duration: 0.8 },
          0.3
        )
        .fromTo(
          factsLabelRef.current,
          from,
          { y: 0, opacity: 1, duration: 0.6 },
          0.55
        )
        .fromTo(
          factsCardRef.current,
          from,
          { y: 0, opacity: 1, duration: 0.7 },
          0.6
        )
        // Bullets cascade in within the single card.
        .fromTo(
          bulletRefs.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
          0.75
        );

      // Below-the-fold blocks reveal on scroll (the hero plays on mount above).
      // Replays on scroll up/down.
      revealBatch(".reveal-on-scroll", { start: "top 85%", stagger: 0.08 });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="introduction"
      ref={rootRef}
      className="min-h-screen w-full scroll-mt-16 bg-transparent px-8 py-24 lg:px-24"
    >
      {/* Section marker (this deck replaces a slide deck). */}
      <div
        ref={sectionTagRef}
        className="mb-14 flex items-center gap-4 opacity-0"
      >
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">
          01
        </span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          Introduction
        </span>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
        {/* ====== LEFT COLUMN: interactive heading + paragraph =========== */}
        <div>
          {/* Hover zone. `pb-5` bridges the gap down to the modal so the
              cursor never crosses dead space (which would close it); the modal
              is a DOM descendant, so moving onto it keeps the hover alive. */}
          <div
            className="relative pb-5"
            onMouseEnter={() => setCardOpen(true)}
            onMouseLeave={() => setCardOpen(false)}
          >
            <p
              ref={labelRef}
              className="font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b] opacity-0"
            >
              Anthropic · Founded 2021
            </p>

            <h2
              ref={headingRef}
              onClick={() => setCardOpen((o) => !o)}
              className="mt-5 inline-block cursor-pointer select-none font-cormorant text-5xl font-light leading-none text-white opacity-0 lg:text-6xl"
            >
              Who is Claude?
            </h2>

            {/* hover / tap cue */}
            <span
              className={`ml-4 align-middle font-inter text-xs uppercase tracking-[0.2em] text-white transition-opacity duration-300 ${
                cardOpen ? "opacity-0" : "opacity-100"
              }`}
            >
              <span className="hidden lg:inline">Hover ↘</span>
              <span className="lg:hidden">Tap ↓</span>
            </span>

            {/* The reveal modal — overlays the content beneath (does not take
                up layout space). Anchored top-left, large, high z-index. */}
            <div
              className={`absolute left-0 top-full z-50 w-full rounded-2xl border border-white/10 bg-[#111111] p-7 shadow-2xl shadow-black/60 transition-all duration-300 lg:w-[44rem] lg:p-8 ${
                cardOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-7">
                {/* Portrait */}
                {shannonImageSrc ? (
                  <Image
                    src={shannonImageSrc}
                    alt="Claude Shannon"
                    width={192}
                    height={240}
                    unoptimized
                    className="h-60 w-48 flex-none rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-60 w-48 flex-none items-center justify-center rounded-lg border border-white/10 bg-[#0a0a0a] p-2 text-center font-mono text-[10px] leading-relaxed text-white">
                    [ Claude Shannon · Bell Labs, 1950 ]
                  </div>
                )}

                {/* Name, dates, history & achievements */}
                <div className="min-w-0">
                  <p className="font-inter text-xl font-semibold text-white">
                    Claude Shannon
                  </p>
                  <p className="mt-1 font-inter text-sm text-[#a3a3a3]">
                    1916 – 2001 · the father of information theory
                  </p>

                  <div className="my-4 border-t border-white/10" />

                  <p className="font-inter text-sm leading-relaxed text-[#a3a3a3]">
                    Claude isn&apos;t a random name — the model is a tribute to{" "}
                    <span className="text-white">Claude Shannon</span>, the
                    mathematician and engineer whose ideas make language models
                    possible at all.
                  </p>

                  <p className="mt-3 font-inter text-sm leading-relaxed text-[#a3a3a3]">
                    In 1948 he published{" "}
                    <span className="italic text-white/90">
                      &ldquo;A Mathematical Theory of Communication,&rdquo;
                    </span>{" "}
                    the paper that founded information theory. He coined the{" "}
                    <span className="text-white">bit</span>, defined{" "}
                    <span className="text-white">entropy</span> as a measure of
                    uncertainty, and proved the absolute limits of how much
                    information any channel can carry. A decade earlier, his
                    master&apos;s thesis had shown that Boolean algebra could
                    describe electrical switching circuits — the conceptual
                    blueprint for every digital computer that followed.
                  </p>

                  <p className="mt-3 font-inter text-sm leading-relaxed text-[#a3a3a3]">
                    An LLM predicts the next token by estimating a probability
                    distribution over symbols — precisely the statistical view
                    of language Shannon pioneered when he measured the entropy
                    of written English in 1951. Every token, every prediction,
                    every word Claude generates flows directly from his work.
                  </p>
                </div>
              </div>

              {/* A few landmark achievements. */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="font-inter text-xs font-medium uppercase tracking-[0.2em] text-[#f59e0b]">
                  Selected work
                </p>
                <ul className="mt-3 space-y-2 font-inter text-sm text-[#a3a3a3]">
                  <li>
                    <span className="text-white">1937</span> — Boolean algebra
                    applied to switching circuits; the foundation of digital
                    logic design.
                  </li>
                  <li>
                    <span className="text-white">1948</span> — Information
                    theory: the bit, entropy, and channel capacity.
                  </li>
                  <li>
                    <span className="text-white">1950</span> — One of the first
                    computer chess programs, and{" "}
                    <span className="text-white/90">Theseus</span>, a
                    maze-solving mechanical mouse that &ldquo;learned&rdquo; — an
                    early experiment in machine learning.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Paragraph — sits below the heading. */}
          <p
            ref={paragraphRef}
            className="mt-2 max-w-prose font-inter text-lg leading-relaxed text-[#a3a3a3] opacity-0"
          >
            In 2021, eleven researchers left OpenAI to found Anthropic — not
            because they believed AI was safe, but because they believed a lab
            that took safety seriously had to be at the frontier, not on the
            sidelines. Their wager was simple: if powerful AI is inevitable,
            better that the people most concerned with its risks are the ones
            building it. The result is Claude — and the reason a model&apos;s
            security capabilities are now a boardroom conversation.
          </p>
        </div>

        {/* ====== RIGHT COLUMN: quick facts (one card, bulleted) ========= */}
        <div>
          <p
            ref={factsLabelRef}
            className="font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b] opacity-0"
          >
            By the numbers
          </p>

          <div
            ref={factsCardRef}
            className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 opacity-0 lg:p-8"
          >
            <ul>
              {FACTS.map((fact, i) => (
                <li
                  key={fact.label}
                  ref={(el) => {
                    bulletRefs.current[i] = el;
                  }}
                  className="flex items-baseline gap-5 border-t border-white/[0.08] py-5 first:border-t-0 first:pt-0 last:pb-0"
                >
                  <span
                    className={`w-28 flex-none font-cormorant text-3xl leading-none lg:text-4xl ${
                      fact.statAmber ? "text-[#f59e0b]" : "text-white"
                    }`}
                  >
                    {fact.stat}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-inter text-sm text-[#a3a3a3]">
                      {fact.label}
                    </span>
                    <span className="mt-1 block font-inter text-xs text-white">
                      {fact.sub}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ==================================================================
          Below the fold — reveals on scroll.
          ================================================================== */}
      <div className="mt-28 space-y-28 lg:mt-44 lg:space-y-44">
        {/* ---- The Claude family ---------------------------------------- */}
        <div>
          <p className="reveal-on-scroll font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
            The Claude family
          </p>
          <h3 className="reveal-on-scroll mt-5 max-w-3xl font-cormorant text-3xl font-light leading-tight text-white lg:text-5xl">
            Every Claude is named for a form of writing.
          </h3>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODELS.map((m) => (
              <div
                key={m.name}
                className={`reveal-on-scroll rounded-2xl border p-7 ${
                  m.highlight
                    ? "border-[#f59e0b]/40 bg-[#f59e0b]/[0.04] shadow-[0_0_50px_-14px_rgba(245,158,11,0.5)]"
                    : "border-white/[0.08] bg-[#0a0a0a]"
                }`}
              >
                <p className="font-inter text-[11px] uppercase tracking-[0.2em] text-[#f59e0b]">
                  {m.form}
                </p>
                <p
                  className={`mt-3 font-cormorant text-4xl ${
                    m.highlight ? "text-[#f59e0b]" : "text-white"
                  }`}
                >
                  {m.name}
                </p>
                <p className="mt-4 font-inter text-sm leading-relaxed text-[#a3a3a3]">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Milestones timeline -------------------------------------- */}
        <div>
          <p className="reveal-on-scroll font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
            Milestones
          </p>
          <h3 className="reveal-on-scroll mt-5 max-w-3xl font-cormorant text-3xl font-light leading-tight text-white lg:text-5xl">
            The road to Mythos.
          </h3>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-6 lg:border-t lg:border-white/10">
            {TIMELINE.map((item) => (
              <div
                key={item.year + item.title}
                className="reveal-on-scroll relative lg:pt-8"
              >
                <span
                  className={`absolute left-0 top-0 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full lg:block ${
                    item.highlight ? "bg-[#f59e0b]" : "bg-white/40"
                  }`}
                />
                <p
                  className={`font-cormorant text-2xl lg:text-3xl ${
                    item.highlight ? "text-[#f59e0b]" : "text-white"
                  }`}
                >
                  {item.year}
                </p>
                <p className="mt-2 font-inter text-sm font-medium text-white">
                  {item.title}
                </p>
                <p className="mt-1 font-inter text-xs leading-relaxed text-white">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Why Anthropic -------------------------------------------- */}
        <div>
          <p className="reveal-on-scroll font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
            Why Anthropic
          </p>
          <h3 className="reveal-on-scroll mt-5 max-w-3xl font-cormorant text-3xl font-light leading-tight text-white lg:text-5xl">
            Built to be trusted at the frontier.
          </h3>

          <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.title}
                className="reveal-on-scroll rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-8"
              >
                <p className="font-cormorant text-3xl text-[#f59e0b]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-4 font-inter text-lg font-semibold text-white">
                  {p.title}
                </p>
                <p className="mt-3 font-inter text-sm leading-relaxed text-[#a3a3a3]">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Closing pull quote --------------------------------------- */}
        <figure className="reveal-on-scroll mx-auto max-w-4xl text-center">
          <blockquote className="font-cormorant text-3xl font-light leading-snug text-white lg:text-4xl">
            &ldquo;If powerful AI is inevitable, the safest future is one where
            the people most worried about it are the ones building it.&rdquo;
          </blockquote>
          <figcaption className="mt-7 font-inter text-xs uppercase tracking-[0.25em] text-[#f59e0b]">
            Anthropic&apos;s founding thesis
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
