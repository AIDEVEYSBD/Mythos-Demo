"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------- Content data ---------------------------- */

type Severity = "CRITICAL" | "HIGH" | "MEDIUM";
type RiskType = "Threat" | "Vulnerability" | "Capability gap" | "Governance";

interface Risk {
  id: number;
  severity: Severity;
  name: string;
  type: RiskType;
  desc: string;
  refs: string[];
  action: string;
}

// The draft Mythos-ready risk register — 13 risks, mapped to recognized
// frameworks and to the priority actions that follow in section 08.
const RISKS: Risk[] = [
  {
    id: 1,
    severity: "CRITICAL",
    name: "Accelerated Threat Exploitation",
    type: "Threat",
    desc: "Autonomous exploit generation at machine speed. The capability predates Mythos; what changes is speed, scale, and the collapse in skill required. Every patch also becomes an exploit blueprint.",
    refs: ["AML.T0040", "AML.T0043", "PR.PS", "PR.IR"],
    action: "PA 4 · 5",
  },
  {
    id: 2,
    severity: "CRITICAL",
    name: "Insufficient AI Automation Capabilities",
    type: "Capability gap",
    desc: "Defenders operating at human speed while attackers operate AI-augmented. The asymmetry is cultural as much as technical — teams that don't adopt agents cannot match the pace, regardless of skill.",
    refs: ["GV.OC", "GV.RM", "DE.CM", "RS.MA"],
    action: "PA 1 · 2",
  },
  {
    id: 3,
    severity: "CRITICAL",
    name: "Unmanaged AI Agent Attack Surface",
    type: "Vulnerability",
    desc: "Privileged agents sit outside existing control frameworks — insecure by default, and where attacker focus now lies. Introduces both defensive and agentic supply-chain risk (MCP servers, extensions, skills).",
    refs: ["LLM06", "ASI02", "ASI03", "AML.T0047", "PR.AA", "GV.SC"],
    action: "PA 3",
  },
  {
    id: 4,
    severity: "CRITICAL",
    name: "Inadequate Detection & Response Velocity",
    type: "Capability gap",
    desc: "Detection and response at human speed against machine-speed attacks. Alert triage, SIEM correlation, and containment authorization were all designed for human-paced threats.",
    refs: ["ASI08", "AML.T0047", "DE.CM", "DE.AE", "RS.MA"],
    action: "PA 9 · 10",
  },
  {
    id: 5,
    severity: "CRITICAL",
    name: "Cybersecurity Risk Model Outdated",
    type: "Governance",
    desc: "Stakeholder decisions based on pre-AI risk models. Metrics built on old assumptions about exploit timelines may no longer reflect actual exposure — and could lead to underfunding of controls.",
    refs: ["GV.OC", "GV.RM", "RS.CO"],
    action: "PA 6",
  },
  {
    id: 6,
    severity: "HIGH",
    name: "Incomplete Asset & Exposure Inventory",
    type: "Vulnerability",
    desc: "Unknown attack surface — assets, code, dependencies, shadow agents. Attackers can enumerate your exposure faster than you can inventory it. You cannot segment or defend what you don't know exists.",
    refs: ["ASI04", "AML.T0000", "ID.AM", "GV.SC"],
    action: "PA 7",
  },
  {
    id: 7,
    severity: "HIGH",
    name: "Unsecured Software Delivery Pipeline",
    type: "Vulnerability",
    desc: "Code from humans and agents ships without consistent security review. More code, faster, same defect rate, against a more capable adversary. Exploitable flaws reach production before defenders find them.",
    refs: ["LLM01", "LLM05", "ASI01", "AML.T0018", "PR.PS", "ID.IM"],
    action: "PA 1",
  },
  {
    id: 8,
    severity: "HIGH",
    name: "Network Insufficient for Lateral Containment",
    type: "Vulnerability",
    desc: "A flat or under-segmented network gives every successful exploit leverage. Automated multi-hop movement exploits poor architecture faster than any manual attacker could.",
    refs: ["PR.IR", "PR.PS"],
    action: "PA 8",
  },
  {
    id: 9,
    severity: "HIGH",
    name: "Continuous Vuln Management Maturity Gap",
    type: "Capability gap",
    desc: "A reactive posture against continuous AI-discovered zero-days, with no VulnOps function. Quarterly pen tests and reactive patching cannot keep pace; CVE/NVD workflows were built for dozens, not hundreds.",
    refs: ["ASI10", "ASI06", "AML.T0018", "ID.RA", "DE.CM"],
    action: "PA 11",
  },
  {
    id: 10,
    severity: "HIGH",
    name: "Detection Dependent on Lagging Intelligence",
    type: "Capability gap",
    desc: "CVE- and KEV-based intelligence is structurally outpaced by AI discovery rates. Novel vulnerabilities have no KEV listing by definition — and the CVE system may not scale to AI-generated volumes.",
    refs: ["AML.T0000", "DE.CM", "ID.RA", "GV.OV"],
    action: "PA 9 · 10",
  },
  {
    id: 11,
    severity: "HIGH",
    name: "Innovation Governance & Oversight Deficit",
    type: "Governance",
    desc: "A governance vacuum creates approval friction that slows defensive AI adoption. AI-accelerated timelines give that friction a harder deadline — this is where the liability asymmetry gets addressed structurally.",
    refs: ["GV.OC", "GV.RM", "GV.RR", "GV.OV"],
    action: "PA 2 · 4",
  },
  {
    id: 12,
    severity: "HIGH",
    name: "Regulatory & Liability Exposure",
    type: "Governance",
    desc: "A shifting standard of care as AI scanning becomes broadly available. The EU AI Act (Aug 2026) adds audit and incident duties; boards face questions about whether not using available tools constitutes negligence.",
    refs: ["GV.OC", "GV.RM", "GV.RR"],
    action: "PA 1 · 4",
  },
  {
    id: 13,
    severity: "MEDIUM",
    name: "AI Hype & Confusion Causing Inaction",
    type: "Governance",
    desc: "Signal-to-noise collapse in guidance. Teams that dismiss the shift as hype — or exhaust their attention on low-signal content — will miss the landscape changes they actually need to react to.",
    refs: ["GV.OC", "GV.RM"],
    action: "PA 1",
  },
];

// Each risk type gets its own hue, so the register reads as a coloured map of
// what kind of problem each row is, not a wall of amber.
const TYPE_COLOR: Record<RiskType, string> = {
  Threat: "#fb7185", // rose — external capability
  Vulnerability: "#f59e0b", // amber — addressable condition
  "Capability gap": "#38bdf8", // sky — missing defensive function
  Governance: "#a78bfa", // violet — structural failure
};

const SEV_STYLE: Record<Severity, { dot: string; text: string; chip: string }> = {
  CRITICAL: { dot: "#ef4444", text: "text-[#f87171]", chip: "border-[#ef4444]/30 bg-[#ef4444]/[0.08] text-[#f87171]" },
  HIGH: { dot: "#f59e0b", text: "text-[#f59e0b]", chip: "border-[#f59e0b]/30 bg-[#f59e0b]/[0.08] text-[#f59e0b]" },
  MEDIUM: { dot: "#a3a3a3", text: "text-[#a3a3a3]", chip: "border-white/15 bg-white/[0.04] text-[#a3a3a3]" },
};

type Filter = "ALL" | Severity;
const FILTERS: Filter[] = ["ALL", "CRITICAL", "HIGH", "MEDIUM"];

export default function RiskRegisterSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [open, setOpen] = useState<number | null>(1);

  const counts = {
    CRITICAL: RISKS.filter((r) => r.severity === "CRITICAL").length,
    HIGH: RISKS.filter((r) => r.severity === "HIGH").length,
    MEDIUM: RISKS.filter((r) => r.severity === "MEDIUM").length,
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealBatch(".reg-reveal", { start: "top 88%", stagger: 0.06, duration: 0.6 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const visible = RISKS.filter((r) => filter === "ALL" || r.severity === filter);

  return (
    <section id="risk-register" ref={rootRef} className="relative scroll-mt-16 bg-transparent px-8 py-28 lg:px-24 lg:py-40">
      {/* Section marker */}
      <div className="reg-reveal mb-16 flex items-center gap-4">
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">06</span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          The Risk Register
        </span>
      </div>

      {/* Heading */}
      <div className="max-w-4xl">
        <p className="reg-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          A draft you can take to Monday
        </p>
        <h2 className="reg-reveal mt-6 font-cormorant text-5xl font-light leading-tight text-white lg:text-6xl">
          Thirteen risks, already mapped.
        </h2>
        <p className="reg-reveal mt-8 max-w-2xl font-inter text-lg leading-relaxed text-[#a3a3a3]">
          Not a theoretical exercise — a register you could adapt this week. Each risk carries a
          severity, a type, the frameworks it touches, and the priority action that addresses it.
          Filter it, then open any row.
        </p>
      </div>

      {/* Summary + filters */}
      <div className="reg-reveal mt-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-8">
          {(["CRITICAL", "HIGH", "MEDIUM"] as Severity[]).map((s) => (
            <div key={s} className="flex items-baseline gap-3">
              <span className="font-cormorant text-4xl font-light" style={{ color: SEV_STYLE[s].dot }}>
                {counts[s]}
              </span>
              <span className="font-inter text-xs uppercase tracking-[0.2em] text-white">{s}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 font-inter text-xs uppercase tracking-[0.15em] transition-colors ${
                filter === f
                  ? "border-[#f59e0b]/50 bg-[#f59e0b]/[0.1] text-[#f59e0b]"
                  : "border-white/10 text-white hover:text-[#a3a3a3]"
              }`}
            >
              {f === "ALL" ? "All risks" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Register rows */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08]">
        {/* column header (desktop) */}
        <div className="hidden grid-cols-[110px_1fr_160px_120px] gap-4 border-b border-white/[0.08] bg-[#0d0d0d] px-6 py-3 lg:grid">
          <span className="font-inter text-[11px] uppercase tracking-[0.2em] text-white">Severity</span>
          <span className="font-inter text-[11px] uppercase tracking-[0.2em] text-white">Risk</span>
          <span className="font-inter text-[11px] uppercase tracking-[0.2em] text-white">Type</span>
          <span className="font-inter text-[11px] uppercase tracking-[0.2em] text-white">Action</span>
        </div>

        {visible.map((r) => {
          const isOpen = open === r.id;
          const st = SEV_STYLE[r.severity];
          return (
            <div key={r.id} className="reg-reveal border-b border-white/[0.06] last:border-b-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : r.id)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-white/[0.02] lg:grid-cols-[110px_1fr_160px_120px]"
              >
                {/* severity */}
                <span className="flex items-center gap-2.5">
                  <span className="h-2 w-2 flex-none rounded-full" style={{ background: st.dot }} />
                  <span className={`font-inter text-[11px] font-medium uppercase tracking-[0.12em] ${st.text}`}>
                    {r.severity}
                  </span>
                </span>
                {/* name */}
                <span className="col-span-2 font-inter text-sm text-white lg:col-span-1 lg:text-base">{r.name}</span>
                {/* type (desktop) — coloured by category */}
                <span className="hidden items-center gap-2 font-inter text-xs lg:flex">
                  <span className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: TYPE_COLOR[r.type] }} />
                  <span style={{ color: TYPE_COLOR[r.type] }}>{r.type}</span>
                </span>
                {/* action (desktop) */}
                <span className="hidden font-inter text-xs uppercase tracking-[0.1em] text-[#f59e0b] lg:block">
                  {r.action}
                </span>
              </button>

              {/* expanded detail */}
              <div
                className="grid overflow-hidden transition-all duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 lg:pl-[126px]">
                    <p className="max-w-3xl font-inter text-sm leading-relaxed text-[#a3a3a3]">{r.desc}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="mr-1 font-inter text-[11px] uppercase tracking-[0.18em] text-white">
                        Frameworks
                      </span>
                      {r.refs.map((ref) => (
                        <span
                          key={ref}
                          className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-[#a3a3a3]"
                        >
                          {ref}
                        </span>
                      ))}
                      <span className="ml-2 lg:hidden">
                        <span className="rounded-md border border-[#f59e0b]/25 bg-[#f59e0b]/[0.08] px-2 py-0.5 font-inter text-[11px] uppercase tracking-[0.1em] text-[#f59e0b]">
                          {r.action}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="reg-reveal mt-6 font-inter text-xs text-white">
        Type · Threat = external capability, controls raise cost · Vulnerability = addressable condition ·
        Capability gap = missing defensive function · Governance = structural failure amplifying the rest.
      </p>
    </section>
  );
}
