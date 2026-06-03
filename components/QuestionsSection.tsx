"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------- Content data ---------------------------- */

interface Question {
  q: string;
  context: string;
}

// Ten questions to reach ground truth on program state and influence.
const QUESTIONS: Question[] = [
  {
    q: "What is our actual stance on AI today?",
    context: "Allowed, tolerated, restricted, or unknown. The honest answer, not the policy.",
  },
  {
    q: "Can employees use agentic coding tools in the enterprise today?",
    context: "Looping, tool-using agents — not just chatbot access. And do guardrails exist for them?",
  },
  {
    q: "Can employees contribute to open source without legal ambiguity?",
    context: "A legal and IP question, not a technology-philosophy question.",
  },
  {
    q: "Do we have disciplined control of repos, artifacts, and software?",
    context: "Including the agentic supply chain — MCP servers, plugins, skills. Provenance and what's allowed into CI/CD.",
  },
  {
    q: "Is there a real security gate between code change and production?",
    context: "A genuine cooling-off point that demonstrates enforcement in the release cycle.",
  },
  {
    q: "Is security operational, or primarily advisory?",
    context: "Can the function directly change outcomes — or does it mostly review and escalate?",
  },
  {
    q: "What is the fastest we've made a security-driven production change this year?",
    context: "Use a real example, not a policy statement. It reveals your true response speed.",
  },
  {
    q: "Are our critical “crown jewels” explicitly tracked and current?",
    context: "Not theoretically important systems — the actual few that matter, and their dependencies.",
  },
  {
    q: "Do we know how to get urgent work prioritized by key third parties?",
    context: "Escalation paths, relationship ownership, and leverage — before you need them.",
  },
  {
    q: "Does executive leadership have a working definition of urgency?",
    context: "If everything is a crisis, nothing is urgent.",
  },
];

export default function QuestionsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealBatch(".q-reveal", { start: "top 88%", stagger: 0.06, duration: 0.6 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="questions" ref={rootRef} className="relative scroll-mt-16 bg-transparent px-8 py-28 lg:px-24 lg:py-40">
      {/* Section marker */}
      <div className="q-reveal mb-16 flex items-center gap-4">
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">09</span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          Know Your Program
        </span>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        {/* Left: framing */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="q-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
            Ten questions
          </p>
          <h2 className="q-reveal mt-6 font-cormorant text-5xl font-light leading-tight text-white lg:text-6xl">
            Before the plan, ground truth.
          </h2>
          <p className="q-reveal mt-8 max-w-md font-inter text-lg leading-relaxed text-[#a3a3a3]">
            None of the actions matter if you don&apos;t know where you actually stand. These ten
            questions triage your program&apos;s real state — and your real influence over the
            functions you don&apos;t own.
          </p>
          <p className="q-reveal mt-6 max-w-md font-inter text-sm leading-relaxed text-[#606060]">
            Answer them honestly as we go. The gaps are your starting backlog.
          </p>
        </div>

        {/* Right: interactive list */}
        <div className="space-y-3">
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`q-reveal overflow-hidden rounded-2xl border transition-colors ${
                  isOpen ? "border-[#f59e0b]/30 bg-[#f59e0b]/[0.03]" : "border-white/[0.08] bg-[#0d0d0d]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-5 px-6 py-5 text-left"
                >
                  <span
                    className={`font-cormorant text-3xl font-light leading-none transition-colors ${
                      isOpen ? "text-[#f59e0b]" : "text-[#606060]"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-inter text-base font-medium leading-snug text-white lg:text-lg">
                    {item.q}
                  </span>
                  <span
                    className={`flex-none font-cormorant text-2xl text-[#f59e0b] transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 pl-[60px] font-inter text-sm leading-relaxed text-[#a3a3a3]">
                      {item.context}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
