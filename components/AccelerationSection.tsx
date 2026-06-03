"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------- Content data ---------------------------- */

// The collapse of "time to exploit" — the Zero Day Clock metaphor. Each point
// maps a year to how long defenders historically had between a vulnerability
// becoming known and a working exploit existing. Midnight = zero days.
interface ClockStop {
  year: string;
  ttx: string; // human-readable time-to-exploit
  note: string;
}

const CLOCK_STOPS: ClockStop[] = [
  { year: "2016", ttx: "Months", note: "DARPA Cyber Grand Challenge — machines first patch and exploit autonomously" },
  { year: "2021", ttx: "Weeks", note: "Mass-exploitation of disclosed CVEs becomes routine within weeks" },
  { year: "2024", ttx: "Days", note: "Exploit-from-patch-diff shrinks the window to days" },
  { year: "2025", ttx: "Hours", note: "Autonomous agents reproduce and weaponize zero-days in hours" },
  { year: "2026", ttx: "Minutes", note: "The Zero Day Clock reaches midnight — exploitation at machine speed" },
];

// The documented run-up to Mythos. "The acceleration, not the starting gun."
interface Event {
  date: string;
  title: string;
  detail: string;
  stat?: string;
  mythos?: boolean;
}

const TIMELINE: Event[] = [
  {
    date: "Jun 2025",
    title: "XBOW tops the HackerOne leaderboard",
    detail: "The first autonomous system to outrank every human researcher on the platform's US leaderboard.",
    stat: "#1",
  },
  {
    date: "Aug 2025",
    title: "Google Big Sleep finds 20 real zero-days",
    detail: "Each vulnerability found and reproduced autonomously across projects including FFmpeg and ImageMagick.",
    stat: "20",
  },
  {
    date: "Aug 2025",
    title: "DARPA AIxCC finals at DEF CON 33",
    detail: "54 vulnerabilities surfaced in four hours of compute across 54 million lines of code.",
    stat: "54 in 4h",
  },
  {
    date: "Sep 2025",
    title: "The singularity warning",
    detail: "Adkins (CISO, Google) and Evron (CEO, Knostic) warn that autonomous discovery and exploitation is roughly six months away.",
    stat: "~6 mo",
  },
  {
    date: "Nov 2025",
    title: "First AI-orchestrated espionage campaign",
    detail: "A Chinese state-sponsored group used Claude Code to run full attack chains — recon through exfiltration — autonomously across ~30 global targets (detected mid-September).",
    stat: "~30 targets",
  },
  {
    date: "Feb 2026",
    title: "Hundreds of high-severity bugs; an 8-minute breach",
    detail: "500+ high-severity vulnerabilities reported in open source. AISLE found 12 OpenSSL zero-days — one a CVSS 9.8 dating to 1998. Sysdig documented admin access in eight minutes; Gambit reported the AI-led compromise of Mexican government infrastructure.",
    stat: "8 min",
  },
  {
    date: "Mar 2026",
    title: "The Zero Day Clock launches; open source is overwhelmed",
    detail: "Sergej Epp and others publish the Zero Day Clock, showing time-to-exploit collapsing below a day. Linux kernel bug reports climb from 2 to 10 a week — once hallucinated, now all verified real; curl reverses its AI-slop stance as report quality rises.",
    stat: "< 1 day",
  },
  {
    date: "Mar 2026",
    title: "Defensive tooling ships",
    detail: "The same capability turns inward: Claude Code Security (Anthropic) and Codex Security (OpenAI) enter research preview, and Knostic open-sources OpenAnt with free scans for open-source projects.",
    stat: "Defense",
  },
  {
    date: "Apr 7, 2026",
    title: "Claude Mythos Preview & Project Glasswing",
    detail: "Anthropic announces Mythos Preview alongside Glasswing — thousands of zero-days across every major OS and browser, and a 27-year-old OpenBSD bug found at last.",
    stat: "Launch",
    mythos: true,
  },
  {
    date: "May 2026",
    title: "Glasswing's first numbers land",
    detail: "Anthropic reports 10,000+ high/critical-severity vulnerabilities, and 23,019 issues across 1,000+ open-source projects. In wolfSSL — a crypto library on billions of devices — Mythos built a working certificate-forgery exploit. Finding has outrun fixing.",
    stat: "10,000+",
    mythos: true,
  },
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function AccelerationSection() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  // Clock DOM handles, updated imperatively each scroll frame (no re-render).
  const minuteHandRef = useRef<SVGGElement>(null);
  const hourHandRef = useRef<SVGGElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const ttxRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const stopDotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const ARC_LEN = 2 * Math.PI * 130; // circumference of the progress ring (r=130)

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ---- Zero Day Clock: pinned, scrubbed toward midnight ------------- */
      const render = (p: number) => {
        // The clock hands sweep from ~9:00 (far from midnight) to 12:00 sharp.
        // Minute hand does several full turns; hour hand creeps to 12.
        const startHour = 9; // 2016 sits the hands well back from midnight
        const hour = startHour + (12 - startHour) * p; // → 12 at p=1
        const minuteTurns = 6; // dramatic spin-up of the minute hand
        // Minute hand: starts at 12, spins exactly `minuteTurns` revolutions and
        // lands back on 12 at p=1 (so the deck reads "9:00 → midnight" correctly).
        const minuteDeg = p * minuteTurns * 360;
        // Hour hand: a float hour already encodes its fractional sweep, so the
        // angle is simply (hour % 12) * 30 — no double-count, no overshoot past 12.
        const hourDeg = (hour % 12) * 30;

        if (minuteHandRef.current)
          minuteHandRef.current.setAttribute("transform", `rotate(${minuteDeg} 200 200)`);
        if (hourHandRef.current)
          hourHandRef.current.setAttribute("transform", `rotate(${hourDeg} 200 200)`);

        // Progress ring fills clockwise from 12 o'clock.
        if (arcRef.current)
          arcRef.current.style.strokeDashoffset = String(ARC_LEN * (1 - p));

        // Center glow intensifies as midnight nears.
        if (glowRef.current) glowRef.current.setAttribute("opacity", String(0.12 + 0.5 * p * p));

        // Readout: snap to the nearest clock stop for the year + time-to-exploit.
        const idx = Math.min(CLOCK_STOPS.length - 1, Math.floor(p * CLOCK_STOPS.length + 0.0001));
        const stop = CLOCK_STOPS[Math.max(0, idx)];
        if (yearRef.current) yearRef.current.textContent = stop.year;
        if (ttxRef.current) {
          ttxRef.current.textContent = stop.ttx;
          // Color shifts toward amber as the window collapses.
          ttxRef.current.style.color = idx >= CLOCK_STOPS.length - 2 ? "#f59e0b" : "#ffffff";
        }
        if (noteRef.current) noteRef.current.textContent = stop.note;

        stopDotRefs.current.forEach((dot, i) => {
          if (!dot) return;
          const active = i <= idx;
          dot.style.background = active ? "#f59e0b" : "rgba(255,255,255,0.18)";
          dot.style.boxShadow = i === idx ? "0 0 14px rgba(245,158,11,0.9)" : "none";
        });
      };

      render(0);

      ScrollTrigger.create({
        trigger: pinRef.current,
        pin: pinRef.current,
        start: "top top",
        end: "+=260%",
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate: (self) => render(clamp01(self.progress)),
      });

      /* ---- Reveal-on-scroll for heading + timeline (replays) ----------- */
      revealBatch(".accel-reveal", { start: "top 85%", stagger: 0.1 });

      // The timeline's vertical spine draws itself as you scroll through it.
      const spine = rootRef.current?.querySelector<HTMLElement>(".accel-spine");
      if (spine) {
        gsap.fromTo(
          spine,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: spine, start: "top 80%", end: "bottom 60%", scrub: true },
          }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, [ARC_LEN]);

  return (
    <section id="acceleration" ref={rootRef} className="relative scroll-mt-16 bg-transparent">
      {/* Section marker */}
      <div className="accel-reveal absolute left-8 top-24 z-10 flex items-center gap-4 lg:left-24">
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">03</span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          The Acceleration
        </span>
      </div>

      {/* ===== Opening statement ========================================= */}
      <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
        <p className="accel-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          The trend, not the moment
        </p>
        <h2 className="accel-reveal mt-6 max-w-4xl font-cormorant text-5xl font-light leading-tight text-white lg:text-7xl">
          Mythos is the acceleration,
          <br />
          not the starting gun.
        </h2>
        <p className="accel-reveal mt-8 max-w-[640px] font-inter text-xl leading-relaxed text-[#a3a3a3]">
          For more than a year, autonomous systems have been finding and weaponizing
          vulnerabilities faster than defenders can respond. The window between a flaw
          existing and an exploit existing has been collapsing toward zero.
        </p>
      </div>

      {/* ===== Zero Day Clock (pinned, scrubbed) ========================= */}
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
        <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-12 px-8 lg:flex-row lg:gap-24">
          {/* The clock */}
          <div className="relative flex-none">
            <svg width="380" height="380" viewBox="0 0 400 400" className="h-[300px] w-[300px] lg:h-[380px] lg:w-[380px]">
              {/* soft center glow */}
              <circle ref={glowRef} cx="200" cy="200" r="150" fill="#f59e0b" opacity="0.12" style={{ filter: "blur(40px)" }} />
              {/* outer face */}
              <circle cx="200" cy="200" r="160" fill="#0d0d0d" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              {/* track for the progress ring */}
              <circle cx="200" cy="200" r="130" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              {/* progress ring — fills toward midnight, starts at 12 o'clock */}
              <circle
                ref={arcRef}
                cx="200"
                cy="200"
                r="130"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ARC_LEN}
                strokeDashoffset={ARC_LEN}
                transform="rotate(-90 200 200)"
              />
              {/* hour ticks */}
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                const r1 = 150;
                const r2 = i % 3 === 0 ? 134 : 142;
                return (
                  <line
                    key={i}
                    x1={200 + r1 * Math.sin(a)}
                    y1={200 - r1 * Math.cos(a)}
                    x2={200 + r2 * Math.sin(a)}
                    y2={200 - r2 * Math.cos(a)}
                    stroke={i === 0 ? "#f59e0b" : "rgba(255,255,255,0.25)"}
                    strokeWidth={i === 0 ? 3 : 1.5}
                  />
                );
              })}
              {/* hour hand */}
              <g ref={hourHandRef}>
                <line x1="200" y1="200" x2="200" y2="120" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
              </g>
              {/* minute hand */}
              <g ref={minuteHandRef}>
                <line x1="200" y1="200" x2="200" y2="80" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              </g>
              {/* hub */}
              <circle cx="200" cy="200" r="7" fill="#f59e0b" />
              {/* midnight label */}
              <text x="200" y="60" textAnchor="middle" className="font-inter" fontSize="11" letterSpacing="3" fill="#ffffff">
                MIDNIGHT
              </text>
            </svg>
          </div>

          {/* Readout */}
          <div className="max-w-sm text-center lg:text-left">
            <p className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#f59e0b]">
              The Zero Day Clock
            </p>
            <div ref={yearRef} className="mt-4 font-cormorant text-6xl font-light leading-none text-white lg:text-7xl">
              2016
            </div>
            <p className="mt-6 font-inter text-xs uppercase tracking-[0.25em] text-white">
              Time from disclosure to working exploit
            </p>
            <div ref={ttxRef} className="mt-2 font-cormorant text-5xl font-light leading-none text-white lg:text-6xl">
              Months
            </div>
            <p ref={noteRef} className="mt-8 min-h-[3.5rem] max-w-xs font-inter text-sm leading-relaxed text-[#a3a3a3]">
              DARPA Cyber Grand Challenge — machines first patch and exploit autonomously
            </p>
            <p className="mt-6 font-inter text-[11px] uppercase tracking-[0.2em] text-white">
              Scroll to advance the clock
            </p>
          </div>
        </div>

        {/* stop progress dots */}
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-6">
          {CLOCK_STOPS.map((s, i) => (
            <div key={s.year} className="flex flex-col items-center gap-2">
              <div
                ref={(el) => {
                  stopDotRefs.current[i] = el;
                }}
                className="h-2.5 w-2.5 rounded-full transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />
              <span className="font-inter text-[10px] uppercase tracking-[0.15em] text-white">{s.year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== The documented timeline =================================== */}
      <div className="px-8 py-28 lg:px-24 lg:py-36">
        <p className="accel-reveal text-center font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          The run-up · 2025 → 2026
        </p>
        <h3 className="accel-reveal mx-auto mt-5 max-w-3xl text-center font-cormorant text-4xl font-light leading-tight text-white lg:text-5xl">
          A year of escalation, in the record.
        </h3>

        <div className="relative mx-auto mt-20 max-w-4xl">
          {/* vertical spine (draws on scroll) */}
          <div
            className="accel-spine absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px origin-top bg-gradient-to-b from-[#f59e0b] via-[#f59e0b]/40 to-transparent lg:block"
            style={{ transform: "scaleY(0)" }}
          />
          <div className="space-y-10">
            {TIMELINE.map((e) => (
              <div key={e.date + e.title} className="accel-reveal relative lg:pl-16">
                {/* node */}
                <span
                  className={`absolute left-0 top-2 hidden h-4 w-4 -translate-x-[4px] rounded-full border-2 lg:block ${
                    e.mythos ? "border-[#f59e0b] bg-[#f59e0b]" : "border-[#f59e0b]/60 bg-[#0a0a0a]"
                  }`}
                  style={e.mythos ? { boxShadow: "0 0 20px rgba(245,158,11,0.8)" } : undefined}
                />
                <div
                  className={`rounded-2xl border p-6 lg:p-7 ${
                    e.mythos
                      ? "border-[#f59e0b]/40 bg-[#f59e0b]/[0.04] shadow-[0_0_50px_-14px_rgba(245,158,11,0.5)]"
                      : "border-white/[0.08] bg-[#0d0d0d]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <p className="font-inter text-xs font-medium uppercase tracking-[0.2em] text-[#f59e0b]">
                        {e.date}
                      </p>
                      <h4 className="mt-2 font-cormorant text-2xl font-light text-white lg:text-3xl">{e.title}</h4>
                      <p className="mt-3 font-inter text-sm leading-relaxed text-[#a3a3a3]">{e.detail}</p>
                    </div>
                    {e.stat && (
                      <span
                        className={`flex-none font-cormorant text-3xl font-light leading-none lg:text-4xl ${
                          e.mythos ? "text-[#f59e0b]" : "text-white"
                        }`}
                      >
                        {e.stat}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="accel-reveal mx-auto mt-16 max-w-2xl text-center font-cormorant text-2xl font-light leading-snug text-white lg:text-3xl">
          Each of these predates Mythos. The capability was already here —
          <span className="text-[#f59e0b]"> Mythos simply removed the last constraints.</span>
        </p>

        {/* ---- How to read the clock: a balanced, honest framing --------- */}
        <div className="mx-auto mt-24 max-w-5xl">
          <p className="accel-reveal text-center font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
            How to read this
          </p>
          <h3 className="accel-reveal mx-auto mt-5 max-w-3xl text-center font-cormorant text-3xl font-light leading-tight text-white lg:text-4xl">
            A leading indicator — not yet the damage itself.
          </h3>
          <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="accel-reveal rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 lg:p-9">
              <p className="font-inter text-xs font-medium uppercase tracking-[0.2em] text-[#a3a3a3]">
                Keep it honest
              </p>
              <p className="mt-5 font-inter text-base leading-relaxed text-[#a3a3a3]">
                The collapse in time-to-exploit has not yet produced a proportional rise in impact.
                Most consequential incidents still turn on credential abuse, social engineering, or
                supply-chain compromise — not novel zero-days. The clock points to where attacker
                capability is heading, not a measure of today&apos;s damage.
              </p>
            </div>
            <div className="accel-reveal rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/[0.03] p-8 lg:p-9">
              <p className="font-inter text-xs font-medium uppercase tracking-[0.2em] text-[#f59e0b]">
                But the window is real
              </p>
              <p className="mt-5 font-inter text-base leading-relaxed text-white">
                Even with launch partners like AWS, Apple, Google, Microsoft and the Linux Foundation,
                40+ more organizations, and $100M in committed model credits, curated access can only
                cover so much of the world&apos;s attack surface. Comparable offensive capability is
                expected in other frontier models within months — and in open-weight models within six
                months to a year. The defensive head start is time-limited by definition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
