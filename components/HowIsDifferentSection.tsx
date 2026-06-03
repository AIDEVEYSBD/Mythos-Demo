"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealBatch } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------- Content data ---------------------------- */

interface Stage {
  heading: string;
  body: string;
  note?: string;
}

const STAGES: Stage[] = [
  {
    heading: "It starts with comprehension.",
    body: "Mythos reasons about a codebase at a depth earlier models could not reach — not pattern-matching against known signatures, but modelling what the code does, why it exists, and how it behaves when its assumptions break.",
  },
  {
    heading: "Flaws surface as a byproduct.",
    body: "At that depth of understanding, vulnerabilities are no longer something to scan for. They fall out of comprehension itself — including classes of flaw that no signature or linter would have flagged.",
  },
  {
    heading: "No security curriculum required.",
    body: "Mythos was not trained to hunt vulnerabilities; it was trained to understand code. The flaws were always present. Mythos is simply the first system capable enough to see them at scale.",
    note: "OWASP TOP 10 : 2025 · SURFACED AS A BYPRODUCT OF CODE COMPREHENSION",
  },
];

interface Differentiator {
  k: string;
  title: string;
  body: string;
  stat?: string;
}

// The three capabilities that make Mythos a step-change, not an increment.
const DIFFERENTIATORS: Differentiator[] = [
  {
    k: "01",
    title: "Exploits without scaffolding",
    body: "In Anthropic's lab testing, Mythos generated 181 working Firefox exploits where Claude Opus 4.6 succeeded just twice under identical conditions — a step-change in autonomy and reliability, not a marginal gain.",
    stat: "181 vs 2",
  },
  {
    k: "02",
    title: "Complex, chained vulnerabilities",
    body: "Mythos identifies flaws composed of multiple primitives chained together — for example, several memory-corruption bugs combined into a single working exploit path that no individual finding would reveal.",
    stat: "Multi-stage",
  },
  {
    k: "03",
    title: "“One-shot” capability",
    body: "It accomplishes substantially more from a single prompt — without elaborate scaffolding, agent frameworks, or hand-tuned configuration. The barrier to operating it collapses toward a sentence of English.",
    stat: "Single prompt",
  },
];

const OWASP: { code: string; name: string }[] = [
  { code: "A01", name: "Broken Access Control" },
  { code: "A02", name: "Cryptographic Failures" },
  { code: "A03", name: "Injection" },
  { code: "A04", name: "Insecure Design" },
  { code: "A05", name: "Security Misconfiguration" },
  { code: "A06", name: "Vulnerable & Outdated Components" },
  { code: "A07", name: "Auth & Identification Failures" },
  { code: "A08", name: "Software & Data Integrity Failures" },
  { code: "A09", name: "Logging & Monitoring Failures" },
  { code: "A10", name: "Server-Side Request Forgery" },
];

// The code the particles are sampled from (and the editor renders).
const CODE_LINES = [
  "int validate_session(request_t *req) {",
  "    char token[64];",
  "    // copy the session token from the header",
  "    strcpy(token, req->header);",
  "    if (lookup(token) == NULL) {",
  "        return DENY;",
  "    }",
  "    user_t *u = current_user();",
  "    if (u->role >= ROLE_ADMIN) {",
  "        grant_all(u);",
  "    }",
  "    return ALLOW;",
  "}",
];

// Figures from Anthropic's Project Glasswing update (anthropic.com/glasswing,
// May 2026). Every number here is from Anthropic or independent validation.
const METRICS: { stat: string; color: string; label: string; sub: string }[] = [
  {
    stat: "10,000+",
    color: "#f59e0b", // amber
    label: "High- or critical-severity vulnerabilities",
    sub: "Across systemically important software · since the Glasswing launch",
  },
  {
    stat: "23,019",
    color: "#38bdf8", // sky
    label: "Issues across 1,000+ open-source projects",
    sub: "6,202 of them high- or critical-severity",
  },
  {
    stat: ">90%",
    color: "#2dd4bf", // teal — validated, trustworthy
    label: "Of validated findings were true positives",
    sub: "1,752 high/critical findings checked by independent security firms — not “AI slop”",
  },
  {
    stat: "27 yrs",
    color: "#ffffff",
    label: "Age of the OpenBSD bug",
    sub: "Survived decades of expert human review. Found by Mythos.",
  },
  {
    stat: "16 yrs",
    color: "#ffffff",
    label: "Age of the FFmpeg bug",
    sub: "Found alongside Linux kernel flaws chained autonomously",
  },
  {
    stat: "83.1%",
    color: "#a78bfa", // violet
    label: "CyberGym vulnerability-discovery score",
    sub: "vs Claude Opus 4.6 at 66.6% · Anthropic benchmark",
  },
];

// The people behind the briefing — credibility against the "is this hype?"
// reflex. These are contributing authors named in the source document.
const CONTRIBUTORS: { name: string; role: string }[] = [
  { name: "Jen Easterly", role: "Former Director, CISA" },
  { name: "Bruce Schneier", role: "Security technologist · Harvard Kennedy School" },
  { name: "Chris Inglis", role: "Former National Cyber Director, The White House" },
  { name: "Phil Venables", role: "Former CISO, Google Cloud" },
  { name: "Heather Adkins", role: "CISO, Google" },
  { name: "Rob Joyce", role: "Former Cybersecurity Director, NSA" },
];

/* --------------------------------- Helpers ------------------------------- */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (p: number) =>
  p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

const COL_CODE: [number, number, number] = [0.45, 0.74, 1.0]; // cool cyan (code)
const COL_OWASP: [number, number, number] = [1.0, 0.62, 0.06]; // amber (flaws)

// VS Code Dark+ token coloring.
const KW = new Set(["int", "char", "if", "return", "void"]);
const TYPES = new Set(["request_t", "user_t"]);
const CONSTS = new Set(["NULL", "DENY", "ALLOW", "ROLE_ADMIN"]);
const FNS = new Set([
  "validate_session",
  "strcpy",
  "lookup",
  "current_user",
  "grant_all",
]);

function highlight(line: string) {
  const ci = line.indexOf("//");
  const code = ci >= 0 ? line.slice(0, ci) : line;
  const comment = ci >= 0 ? line.slice(ci) : "";
  const parts = code.split(/(\w+|\s+|[^\w\s])/).filter(Boolean);
  const nodes = parts.map((t, i) => {
    if (/^\s+$/.test(t)) return <Fragment key={i}>{t}</Fragment>;
    let cls = "text-[#d4d4d4]";
    if (KW.has(t)) cls = "text-[#569cd6]";
    else if (TYPES.has(t)) cls = "text-[#4ec9b0]";
    else if (CONSTS.has(t)) cls = "text-[#4fc1ff]";
    else if (FNS.has(t)) cls = "text-[#dcdcaa]";
    else if (/^\d+$/.test(t)) cls = "text-[#b5cea8]";
    return (
      <span key={i} className={cls}>
        {t}
      </span>
    );
  });
  if (comment)
    nodes.push(
      <span key="c" className="text-[#6a9955]">
        {comment}
      </span>
    );
  return nodes;
}

/** Rasterize the code and return filled-pixel positions as {u,v} in 0..1. */
function sampleCode(wpx: number, hpx: number): { u: number; v: number }[] {
  const W = Math.min(1200, Math.max(2, Math.round(wpx)));
  const H = Math.min(900, Math.max(2, Math.round(hpx)));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const padX = W * 0.12; // mimic the line-number gutter + padding
  const padY = H * 0.08;
  const lineH = (H - padY * 2) / CODE_LINES.length;
  const fontPx = Math.floor(lineH * 0.74);
  ctx.font = `${fontPx}px ui-monospace, monospace`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  CODE_LINES.forEach((ln, i) =>
    ctx.fillText(ln, padX, padY + lineH * (i + 0.5))
  );
  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: { u: number; v: number }[] = [];
  for (let y = 0; y < H; y += 3) {
    for (let x = 0; x < W; x += 3) {
      if (data[(y * W + x) * 4 + 3] > 128) pts.push({ u: x / W, v: y / H });
    }
  }
  return pts;
}

/** Rasterize the OWASP card's text and return filled-pixel positions as {u,v}.
 *  This is the particle DESTINATION — the swarm re-forms into the vulnerability
 *  list, mirroring the layout of the real card that resolves on top of it. */
function sampleOwasp(wpx: number, hpx: number): { u: number; v: number }[] {
  const W = Math.min(1200, Math.max(2, Math.round(wpx)));
  const H = Math.min(1400, Math.max(2, Math.round(hpx)));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";

  // Geometry tuned to echo OwaspCard's padding (~p-8) and divide-y rows.
  const padX = W * 0.1;
  const padTop = H * 0.06;
  const padBottom = H * 0.06;

  // Header: "OWASP TOP 10 · 2025"
  const headerPx = Math.floor(H * 0.026);
  ctx.font = `600 ${headerPx}px ui-monospace, monospace`;
  ctx.fillText("OWASP TOP 10 · 2025", padX, padTop + headerPx);

  // Ten rows: "A0x   <name>"
  const rowsTop = padTop + headerPx * 2.6;
  const rowH = (H - rowsTop - padBottom) / OWASP.length;
  const rowPx = Math.floor(rowH * 0.4);
  OWASP.forEach((o, i) => {
    const y = rowsTop + rowH * (i + 0.5);
    ctx.font = `${rowPx}px ui-monospace, monospace`;
    ctx.fillText(o.code, padX, y);
    ctx.font = `${rowPx}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(o.name, padX + W * 0.18, y);
  });

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: { u: number; v: number }[] = [];
  for (let y = 0; y < H; y += 3) {
    for (let x = 0; x < W; x += 3) {
      if (data[(y * W + x) * 4 + 3] > 128) pts.push({ u: x / W, v: y / H });
    }
  }
  return pts;
}

/* ================================ Component ============================== */

export default function HowIsDifferentSection() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const codePanelRef = useRef<HTMLDivElement>(null);
  const owaspCardRef = useRef<HTMLDivElement>(null);
  const owaspInnerRef = useRef<HTMLDivElement>(null);

  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);
  const stage3Ref = useRef<HTMLDivElement>(null);

  const progressRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  /* ---- Detect mobile (drives layout + particle count) ------------------ */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* ---- Heading reveal + metrics cards stagger -------------------------- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      revealBatch(".diff-reveal", { start: "top 85%", stagger: 0.12, duration: 0.8 });
      revealBatch(".metric-card", { start: "top 85%", stagger: 0.1, y: 30, duration: 0.6 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  /* ---- Three.js particle system + scroll scrub ------------------------- */
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const N = isMobile ? 500 : 1200;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    let W = mountEl.clientWidth || window.innerWidth;
    let H = mountEl.clientHeight || window.innerHeight;
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -W / 2,
      W / 2,
      H / 2,
      -H / 2,
      -1000,
      1000
    );
    camera.position.z = 10;

    // Source = the code (sampled glyph pixels on desktop). Destination = the
    // OWASP zone on the right. Stored as fractions of W/H so resize is trivial.
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const fxs = new Float32Array(N);
    const fys = new Float32Array(N);
    const fxe = new Float32Array(N);
    const fye = new Float32Array(N);
    const delay = new Float32Array(N);
    const phase = new Float32Array(N);
    const wave = new Float32Array(N);

    // SOURCE = the code editor's glyphs (desktop), so the particle cloud
    // literally has the shape of the code before it disperses.
    let codePts: { u: number; v: number }[] = [];
    let lf = 0.05,
      wf = 0.42,
      tf = 0.18,
      hf = 0.64;
    if (!isMobile && codePanelRef.current) {
      const el = codePanelRef.current;
      lf = el.offsetLeft / W;
      wf = el.offsetWidth / W;
      tf = el.offsetTop / H;
      hf = el.offsetHeight / H;
      codePts = sampleCode(el.offsetWidth, el.offsetHeight);
    }

    // DESTINATION = the OWASP card's text, measured from the real card so the
    // swarm re-forms into the vulnerability list before the card resolves on
    // top of it. Fractions are relative to the canvas (W/H) for resize safety.
    let owaspPts: { u: number; v: number }[] = [];
    let le = 0.06,
      we = 0.4,
      te = 0.1,
      he = 0.7;
    if (!isMobile && owaspInnerRef.current) {
      const mountRect = mountEl.getBoundingClientRect();
      const cardRect = owaspInnerRef.current.getBoundingClientRect();
      le = (cardRect.left - mountRect.left) / W;
      te = (cardRect.top - mountRect.top) / H;
      we = cardRect.width / W;
      he = cardRect.height / H;
      owaspPts = sampleOwasp(cardRect.width, cardRect.height);
    }

    for (let i = 0; i < N; i++) {
      if (codePts.length) {
        // Stride across the WHOLE glyph set so the full code shape is covered
        // (plain i % len would only sample the top slice when pts > N).
        const pt = codePts[Math.floor((i * codePts.length) / N)];
        fxs[i] = lf + pt.u * wf - 0.5;
        fys[i] = 0.5 - (tf + pt.v * hf);
      } else {
        // Mobile / fallback: scatter across the left zone.
        fxs[i] = lerp(-0.46, -0.06, Math.random());
        fys[i] = lerp(-0.32, 0.32, Math.random());
      }
      if (owaspPts.length) {
        const pe = owaspPts[Math.floor((i * owaspPts.length) / N)];
        fxe[i] = le + pe.u * we - 0.5;
        fye[i] = 0.5 - (te + pe.v * he);
      } else {
        // Mobile / fallback: scatter across the right zone.
        fxe[i] = lerp(0.06, 0.45, Math.random());
        fye[i] = lerp(-0.4, 0.4, Math.random());
      }
      delay[i] = Math.random();
      phase[i] = Math.random() * Math.PI * 2;
      wave[i] = lerp(0.015, 0.05, Math.random());
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isMobile ? 2.4 : 2.8,
      vertexColors: true,
      transparent: true,
      opacity: isMobile ? 0.9 : 0, // desktop fades in as the code dissolves
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      sizeAttenuation: false,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const updateParticles = (p: number, tSec: number) => {
      for (let i = 0; i < N; i++) {
        // Hold in the code shape until ~0.32, then re-form into the OWASP list.
        // Staggered by delay so the swarm flows rather than snapping as a block;
        // all particles have arrived (e=1) by ~p=0.88, before the card resolves.
        const e = easeInOut(clamp01((p - 0.32 - delay[i] * 0.1) / 0.46));
        const flight = Math.sin(e * Math.PI);
        positions[i * 3] = lerp(fxs[i] * W, fxe[i] * W, e);
        positions[i * 3 + 1] =
          lerp(fys[i] * H, fye[i] * H, e) +
          Math.sin(tSec * 0.55 + phase[i]) * wave[i] * H * flight;
        positions[i * 3 + 2] = 0;
        colors[i * 3] = lerp(COL_CODE[0], COL_OWASP[0], e);
        colors[i * 3 + 1] = lerp(COL_CODE[1], COL_OWASP[1], e);
        colors[i * 3 + 2] = lerp(COL_CODE[2], COL_OWASP[2], e);
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    };

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const tSec = performance.now() / 1000;
      const p = isMobile ? 0.5 + 0.45 * Math.sin(tSec * 0.25) : progressRef.current;
      updateParticles(p, tSec);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      W = mountEl.clientWidth;
      H = mountEl.clientHeight;
      renderer.setSize(W, H);
      camera.left = -W / 2;
      camera.right = W / 2;
      camera.top = H / 2;
      camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    /* ---- Scroll-driven overlays (desktop only) ------------------------- */
    let st: ScrollTrigger | undefined;

    const setOp = (el: HTMLElement | null, op: number, ty = 14) => {
      if (!el) return;
      el.style.opacity = String(op);
      el.style.transform = `translateY(${(1 - op) * ty}px)`;
    };

    const updateOverlays = (p: number) => {
      // Stage copy: stage1 over the code, stage2 mid-flight, stage3 as the list lands.
      setOp(stage1Ref.current, range(p, 0, 0.05) * (1 - range(p, 0.28, 0.34)));
      setOp(stage2Ref.current, range(p, 0.4, 0.46) * (1 - range(p, 0.62, 0.68)));
      setOp(stage3Ref.current, range(p, 0.78, 0.86));
      // Code editor dissolves into particles; OWASP card resolves only once the
      // swarm has re-formed into the list (particles arrive by ~0.88).
      if (codePanelRef.current)
        codePanelRef.current.style.opacity = String(1 - range(p, 0.06, 0.3));
      if (owaspCardRef.current)
        owaspCardRef.current.style.opacity = String(range(p, 0.84, 0.96));
      // Particles fade in as the code fades out, then dim behind the resolving
      // card so its text stays legible while a faint glow remains at the edges.
      material.opacity = range(p, 0.12, 0.3) * (1 - 0.6 * range(p, 0.88, 1));
    };

    if (!isMobile && pinRef.current) {
      st = ScrollTrigger.create({
        trigger: pinRef.current,
        pin: pinRef.current,
        start: "top top",
        // Cinematic pacing: more scroll-room (the dissolve→re-form unfolds
        // slowly and deliberately) and a heavier scrub so the swarm glides with
        // momentum and keeps settling for a beat after the scroll comes to rest.
        end: "+=360%",
        scrub: 3,
        anticipatePin: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          updateOverlays(self.progress);
        },
      });
      updateOverlays(0);
      ScrollTrigger.refresh();
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      st?.kill();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mountEl) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, [isMobile]);

  /* --------------------------- Reusable fragments ------------------------ */

  const CodeEditor = (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] shadow-2xl shadow-black/50">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-black/40 bg-[#252526] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="ml-3 font-mono text-xs text-[#a0a0a0]">
          auth/session.c
        </span>
      </div>
      {/* code body */}
      <div className="flex font-mono text-[13px] leading-relaxed lg:text-[15px]">
        <div className="select-none bg-[#1e1e1e] px-3 py-4 text-right text-[#495162]">
          {CODE_LINES.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="overflow-x-auto px-4 py-4">
          {CODE_LINES.map((ln, i) => (
            <div key={i}>{highlight(ln)}</div>
          ))}
        </pre>
      </div>
    </div>
  );

  const OwaspCard = (
    <div
      ref={owaspInnerRef}
      className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#0d0d0d]/90 p-7 shadow-2xl shadow-black/50 backdrop-blur-sm lg:p-8"
    >
      <p className="font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
        OWASP Top 10 · 2025
      </p>
      <div className="mt-5 divide-y divide-white/[0.06]">
        {OWASP.map((o) => (
          <div key={o.code} className="flex items-baseline gap-4 py-2.5">
            <span className="w-9 flex-none font-mono text-base text-[#f59e0b]">
              {o.code}
            </span>
            <span className="font-inter text-base text-white lg:text-lg">
              {o.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  /* -------------------------------- Render ------------------------------- */
  return (
    <section
      id="how-different"
      ref={rootRef}
      className="relative scroll-mt-16 bg-transparent"
    >
      {/* Section marker */}
      <div className="diff-reveal absolute left-8 top-24 z-10 flex items-center gap-4 lg:left-24">
        <span className="font-cormorant text-3xl leading-none text-[#f59e0b]">
          02
        </span>
        <span className="h-px w-12 bg-white/15" />
        <span className="font-inter text-xs font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          What Changed
        </span>
      </div>

      {/* ===== Opening heading (full viewport, centered) ================== */}
      <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
        <p className="diff-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          Claude Mythos · What Changed
        </p>
        <h2 className="diff-reveal mt-6 font-cormorant text-6xl font-light leading-tight text-white lg:text-7xl">
          How is Mythos Different?
        </h2>
        <p className="diff-reveal mt-8 max-w-[600px] font-inter text-xl leading-relaxed text-[#a3a3a3]">
          Every model learns to read code. Mythos learned to understand it. The
          difference turned out to matter more than anyone expected.
        </p>
      </div>

      {/* ===== Scrollytelling block ====================================== */}
      {!isMobile ? (
        <div className="relative">
          {/* ScrollTrigger pins this panel (scroll-lock) for 300% of scroll. */}
          <div ref={pinRef} className="relative h-screen w-full overflow-hidden">
            {/* particle canvas */}
            <div ref={canvasMountRef} className="absolute inset-0" />

            {/* Code editor (left) — dissolves into particles */}
            <div
              ref={codePanelRef}
              className="pointer-events-none absolute left-[5%] top-[18%] w-[42%]"
            >
              {CodeEditor}
            </div>

            {/* OWASP card (right) — resolves at progress 0.65+ */}
            <div
              ref={owaspCardRef}
              className="pointer-events-none absolute right-[5%] top-1/2 flex w-[42%] -translate-y-1/2 justify-end opacity-0"
            >
              {OwaspCard}
            </div>

            {/* Stage 1 — right */}
            <div
              ref={stage1Ref}
              className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-end pr-8 opacity-0 lg:pr-16"
            >
              <div className="max-w-[340px]">
                <h3 className="font-cormorant text-4xl text-white lg:text-5xl">
                  {STAGES[0].heading}
                </h3>
                <p className="mt-5 font-inter text-base leading-relaxed text-[#a3a3a3] lg:text-lg">
                  {STAGES[0].body}
                </p>
              </div>
            </div>

            {/* Stage 2 — center */}
            <div
              ref={stage2Ref}
              className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 opacity-0"
            >
              <div className="max-w-[620px] text-center">
                <h3 className="font-cormorant text-4xl text-white lg:text-5xl">
                  {STAGES[1].heading}
                </h3>
                <p className="mt-5 font-inter text-base leading-relaxed text-[#a3a3a3] lg:text-lg">
                  {STAGES[1].body}
                </p>
              </div>
            </div>

            {/* Stage 3 — left */}
            <div
              ref={stage3Ref}
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-8 opacity-0 lg:pl-16"
            >
              <div className="max-w-[340px]">
                <h3 className="font-cormorant text-4xl text-white lg:text-5xl">
                  {STAGES[2].heading}
                </h3>
                <p className="mt-5 font-inter text-base leading-relaxed text-[#a3a3a3] lg:text-lg">
                  {STAGES[2].body}
                </p>
                <p className="mt-5 font-inter text-xs uppercase tracking-[0.18em] text-[#f59e0b]">
                  {STAGES[2].note}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ===== Mobile: stacked static blocks ============================ */
        <div className="px-8 py-16">
          <div className="mb-10">{CodeEditor}</div>
          <div ref={canvasMountRef} className="h-[40vh] w-full" />
          <div className="mt-12 space-y-14">
            {STAGES.map((s, i) => (
              <div key={s.heading} className={i === 1 ? "text-center" : ""}>
                <h3 className="font-cormorant text-4xl text-white">
                  {s.heading}
                </h3>
                <p className="mt-4 font-inter text-base leading-relaxed text-[#a3a3a3]">
                  {s.body}
                </p>
                {s.note && (
                  <p className="mt-4 font-inter text-xs uppercase tracking-[0.18em] text-[#f59e0b]">
                    {s.note}
                  </p>
                )}
              </div>
            ))}
            <div className="flex justify-center">{OwaspCard}</div>
          </div>
        </div>
      )}

      {/* ===== Three step-changes ======================================= */}
      <div className="px-8 pt-28 lg:px-24 lg:pt-36">
        <p className="diff-reveal text-center font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          Why this is a step-change, not an increment
        </p>
        <h3 className="diff-reveal mx-auto mt-5 max-w-3xl text-center font-cormorant text-4xl font-light leading-tight text-white lg:text-5xl">
          Three capabilities set Mythos apart.
        </h3>
        <p className="diff-reveal mx-auto mt-6 max-w-2xl text-center font-inter text-base leading-relaxed text-[#a3a3a3]">
          Many of its attributes existed in earlier models and evolved over the past year. These
          three are what make it categorically different.
        </p>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-3">
          {DIFFERENTIATORS.map((d) => (
            <div
              key={d.k}
              className="diff-reveal flex flex-col rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 lg:p-9"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-cormorant text-4xl font-light text-[#f59e0b]">{d.k}</span>
                {d.stat && (
                  <span className="font-cormorant text-2xl font-light text-white">{d.stat}</span>
                )}
              </div>
              <h4 className="mt-5 font-cormorant text-2xl font-light leading-tight text-white lg:text-3xl">
                {d.title}
              </h4>
              <p className="mt-4 font-inter text-sm leading-relaxed text-[#a3a3a3]">{d.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Metrics cards ============================================= */}
      <div className="px-8 py-28 lg:px-24 lg:py-36">
        <p className="diff-reveal text-center font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          Project Glasswing · The latest figures
        </p>
        <h3 className="diff-reveal mt-5 text-center font-cormorant text-4xl font-light text-white">
          The receipts.
        </h3>
        <p className="diff-reveal mx-auto mt-4 max-w-xl text-center font-inter text-sm leading-relaxed text-white">
          As of Anthropic&apos;s May 2026 Glasswing update — a curated early-access program giving
          critical-software providers Mythos to patch their own products first.
        </p>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-3">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="metric-card rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8"
            >
              <p className="font-cormorant text-5xl leading-none" style={{ color: m.color }}>
                {m.stat}
              </p>
              <p className="mt-4 font-inter text-sm text-white">{m.label}</p>
              <p className="mt-2 font-inter text-xs leading-relaxed text-white">
                {m.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== The bottleneck: finding vs fixing ======================== */}
      <div className="border-t border-white/[0.06] px-8 py-28 lg:px-24 lg:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <p className="diff-reveal font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
            The twist in the data
          </p>
          <h3 className="diff-reveal mx-auto mt-5 max-w-3xl font-cormorant text-4xl font-light leading-tight text-white lg:text-5xl">
            The bottleneck isn&apos;t finding. It&apos;s fixing.
          </h3>
          <figure className="diff-reveal mt-10">
            <blockquote className="mx-auto max-w-3xl font-cormorant text-2xl font-light leading-snug text-white lg:text-3xl">
              &ldquo;The relative ease of finding vulnerabilities compared with the difficulty of
              fixing them amounts to a <span className="text-[#f59e0b]">major challenge for
              cybersecurity</span>.&rdquo;
            </blockquote>
            <figcaption className="mt-6 font-inter text-xs uppercase tracking-[0.25em] text-white">
              Anthropic · Project Glasswing update
            </figcaption>
          </figure>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="diff-reveal rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-7">
            <p className="font-inter text-sm font-semibold text-white">Validated, not hallucinated</p>
            <p className="mt-3 font-inter text-sm leading-relaxed text-[#a3a3a3]">
              Independent security firms checked 1,752 of the high/critical findings — over 90% held
              up as true positives. This isn&apos;t the &ldquo;AI slop&rdquo; that flooded bug
              bounties a year ago.
            </p>
          </div>
          <div className="diff-reveal rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/[0.03] p-7">
            <p className="font-inter text-sm font-semibold text-white">A real exploit, not a theory</p>
            <p className="mt-3 font-inter text-sm leading-relaxed text-white">
              In wolfSSL — a crypto library on billions of devices — Mythos built an exploit to forge
              certificates, enough to stand up a convincing fake bank or email site. Patched; details
              withheld.
            </p>
          </div>
          <div className="diff-reveal rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-7">
            <p className="font-inter text-sm font-semibold text-white">Why this is your problem</p>
            <p className="mt-3 font-inter text-sm leading-relaxed text-[#a3a3a3]">
              Discovery now outruns remediation. The constraint has moved to triage, patch capacity,
              and the maintainers and vendors you depend on — exactly the muscles this program builds.
            </p>
          </div>
        </div>
      </div>

      {/* ===== "This is not hype" — source credibility =================== */}
      <div className="border-t border-white/[0.06] px-8 py-28 lg:px-24 lg:py-36">
        <p className="diff-reveal text-center font-inter text-xs font-medium uppercase tracking-[0.25em] text-[#f59e0b]">
          This is not hype
        </p>
        <h3 className="diff-reveal mx-auto mt-5 max-w-3xl text-center font-cormorant text-4xl font-light leading-tight text-white lg:text-5xl">
          The establishment is sounding the alarm.
        </h3>
        <p className="diff-reveal mx-auto mt-6 max-w-2xl text-center font-inter text-base leading-relaxed text-[#a3a3a3]">
          This briefing isn&apos;t a vendor pitch. It was written by the CSA CISO Community, SANS,
          [un]prompted, and the OWASP Gen AI Security Project — and reviewed by dozens of sitting
          CISOs. Among the contributing authors:
        </p>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-3">
          {CONTRIBUTORS.map((c) => (
            <div key={c.name} className="diff-reveal rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6">
              <p className="font-inter text-base font-semibold text-white">{c.name}</p>
              <p className="mt-2 font-inter text-xs leading-relaxed text-[#a3a3a3]">{c.role}</p>
            </div>
          ))}
        </div>

        <p className="diff-reveal mx-auto mt-12 max-w-3xl text-center font-inter text-xs leading-relaxed text-white">
          Sources: Anthropic, &ldquo;Project Glasswing&rdquo; (anthropic.com/glasswing) and its May 2026
          update · The &ldquo;AI Vulnerability Storm: Building a Mythos-ready Security Program&rdquo; ·
          CSA CISO Community, SANS, [un]prompted, OWASP Gen AI Security Project · v0.95, April 2026 ·
          CC BY-NC 4.0
        </p>
      </div>
    </section>
  );
}
