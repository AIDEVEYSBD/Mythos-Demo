"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * IntroAnimation — a time-driven cinematic opener for "CLAUDE MYTHOS".
 *
 * Everything is choreographed against a single wall-clock (performance.now)
 * read once per frame, so visuals, audio and DOM text stay in lockstep.
 *
 * Timeline (seconds from mount):
 *   Phase 1 — Infall       0.0 → 6.5   layered streams of REAL, readable text
 *                                       (code / book & paper titles / prose / math)
 *                                       fall straight inward and compress; the
 *                                       singularity forms FROM the gathering text
 *   Phase 2 — Singularity  6.5 → 6.9   blinding compressed core, audio hard-cuts
 *   Phase 3 — Supernova    6.9         a colorful FLUID nebula blooms outward and
 *                                       settles into a drifting background wash
 *   Phase 4 — Emergence    7.1 → 9.2   "CLAUDE MYTHOS" grows from a point out of the
 *                                       blast and STAYS; orange subtitle + enter button
 */

interface IntroAnimationProps {
  onComplete: () => void;
}

/* ----------------------------- Timeline (s) ------------------------------ */
const T_FLOW_DURATION = 2.8; // text keeps spawning across the first ~2.8s
const T_CONVERGE_END = 6.5; // all mass has compressed into the singularity
const T_BURST = 6.9; // supernova fires (0.4s singularity hold before it)
const T_LETTER_GROW_START = 7.1; // letters begin growing out of the blast
const T_LETTER_GROW_END = 8.5;
const T_TITLE_IN = 7.3; // DOM title opacity 0 -> 1 (then holds forever)
const T_TITLE_DONE = 8.3;
const T_SUB_IN = 8.6; // orange subtitle fades in
const T_SUB_DONE = 9.2;
const T_ENTER_IN = 9.4; // orange enter button fades in
const T_ENTER_DONE = 10.0;

/* ------------------------------- Scene config ---------------------------- */
const PARTICLE_COUNT = 1000; // text sprites (<= 1200 ceiling); fewer reads cleaner
const NEBULA_COUNT = 46; // soft fluid clouds in the supernova
const CAM_Z = 60;
const FOV = 45;

const ANTHROPIC_ORANGE = "#D97757"; // brand orange — "Anthropic made it"

/* Font faces so each stream reads as what it actually is. */
const MONO =
  "'SF Mono', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace";
const SANS = "'Inter', 'Segoe UI', system-ui, sans-serif";

/** The drifting fragments that stream inward during Phase 1 — all real text. */
const FRAGMENTS: { text: string; font: string }[] = [
  // --- Real code (monospace, so it reads like VSCode) ---
  { text: "import torch.nn as nn", font: MONO },
  { text: "const model = await load(path)", font: MONO },
  { text: "async def forward(self, x):", font: MONO },
  { text: "self.attn = MultiHeadAttention(dim)", font: MONO },
  { text: "attention_weights = softmax(scores)", font: MONO },
  { text: "q, k, v = qkv.chunk(3, dim=-1)", font: MONO },
  { text: "scores = q @ k.transpose(-2, -1)", font: MONO },
  { text: "return self.norm(x + residual)", font: MONO },
  { text: "embeddings = self.embed(tokens)", font: MONO },
  { text: "logits = model(input_ids)", font: MONO },
  { text: "with torch.no_grad():", font: MONO },
  { text: "for epoch in range(num_epochs):", font: MONO },
  { text: "loss.backward()", font: MONO },
  { text: "optimizer.step()", font: MONO },
  { text: "x = F.relu(self.linear(x))", font: MONO },
  { text: "probs = F.softmax(logits, dim=-1)", font: MONO },
  { text: "<|endoftext|>", font: MONO },
  // --- Real book titles ---
  { text: "Gödel, Escher, Bach", font: SANS },
  { text: "The Society of Mind", font: SANS },
  { text: "I Am a Strange Loop", font: SANS },
  { text: "Superintelligence", font: SANS },
  { text: "Thinking, Fast and Slow", font: SANS },
  { text: "The Alignment Problem", font: SANS },
  // --- Real papers / articles ---
  { text: "Attention Is All You Need", font: SANS },
  { text: "Computing Machinery and Intelligence", font: SANS },
  { text: "A Mathematical Theory of Communication", font: SANS },
  { text: "Language Models are Few-Shot Learners", font: SANS },
  { text: "Deep Residual Learning for Recognition", font: SANS },
  // --- Prose ---
  { text: "what does it mean to understand", font: SANS },
  { text: "the nature of consciousness", font: SANS },
  { text: "I think, therefore I am", font: SANS },
  { text: "to predict the next token", font: SANS },
  // --- Math (real expressions) ---
  { text: "P(x | y) = P(y | x) P(x) / P(y)", font: SANS },
  { text: "softmax(z)_i = e^{z_i} / Σ e^{z_j}", font: SANS },
  { text: "∇θ J(θ)", font: SANS },
  { text: "argmax P(w | context)", font: SANS },
];

/* Nebula hues for the fluid supernova bloom (cosmic + a little brand orange). */
const NEBULA_COLORS: [number, number, number][] = [
  [1.0, 0.47, 0.34], // anthropic-ish orange
  [1.0, 0.42, 0.78], // magenta
  [0.42, 0.55, 1.0], // blue
  [0.3, 0.9, 0.95], // teal
  [0.68, 0.4, 1.0], // violet
  [1.0, 0.8, 0.45], // gold
  [0.92, 0.95, 1.0], // cool white
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Normalize t within [a,b] to 0..1. */
const range = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
/** Accelerating ease-in — slow start, fast finish (infall toward the hole). */
const easeIn = (p: number) => p * p;
const smoothstep = (p: number) => p * p * (3 - 2 * p);
/** Overshooting ease-out — gives the growing letters a "pop". */
const easeOutBack = (p: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);

  // Guards so the affordance only fires onComplete once it's actually shown.
  const enterReadyRef = useRef(false);
  const completedRef = useRef(false);
  const finalizedRef = useRef(false);

  // Drives the slide-up exit that reveals the main page beneath.
  const [exiting, setExiting] = useState(false);

  // Unmount the intro (called once the slide-up finishes, with a timeout
  // fallback in case transitionend never fires).
  const finalize = () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    onComplete();
  };

  // Shared affordance handler (button click + keypress both route here).
  const handleEnter = () => {
    if (completedRef.current || !enterReadyRef.current) return;
    completedRef.current = true;
    setExiting(true); // slide the intro up; finalize() runs when it lands
    window.setTimeout(finalize, 950);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ---- Inject Google Fonts so the component is self-contained ---------- */
    const FONT_HREF =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300&family=Inter:wght@400;500&display=swap";
    let injectedFontLink: HTMLLinkElement | null = null;
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
      injectedFontLink = link;
    }

    /* ---- Renderer / scene / camera --------------------------------------- */
    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x0a0a0a, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 1000);
    camera.position.set(0, 0, CAM_Z);
    camera.lookAt(0, 0, 0);

    // World half-extents at the z=0 plane (where everything converges/forms).
    const halfH = Math.tan((FOV * Math.PI) / 180 / 2) * CAM_Z;
    let aspect = width / height;
    let halfW = halfH * aspect;
    const cornerDist = Math.sqrt(halfW * halfW + halfH * halfH);
    const worldPerPixel = (2 * halfH) / height;

    /* ---- Phase 1/2: readable text sprites -------------------------------- */
    // Pool of canvas textures (one per fragment), reused across all sprites.
    const fragmentTextures = FRAGMENTS.map((f) =>
      makeTextTexture(f.text, f.font)
    );

    const spriteGroup = new THREE.Group();
    scene.add(spriteGroup);

    const sprites: THREE.Sprite[] = [];
    const spriteMats: THREE.SpriteMaterial[] = [];

    // Per-particle infall parameters (straight radial fall, varied speeds).
    const pBirth = new Float32Array(PARTICLE_COUNT); // when it enters the flow
    const pDur = new Float32Array(PARTICLE_COUNT); // travel time (varied speed)
    const pR0 = new Float32Array(PARTICLE_COUNT); // spawn radius (layered)
    const pDirX = new Float32Array(PARTICLE_COUNT); // unit direction from center
    const pDirY = new Float32Array(PARTICLE_COUNT);
    const pZ0 = new Float32Array(PARTICLE_COUNT); // spawn depth (parallax layers)
    const pBaseH = new Float32Array(PARTICLE_COUNT); // sprite height (world)
    const pBaseW = new Float32Array(PARTICLE_COUNT); // sprite width (world)

    const baseSprite = 17 * worldPerPixel; // ~17px tall — comfortably readable

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const mi = i % fragmentTextures.length;
      const { texture, aspect: texAspect } = fragmentTextures[mi];
      // Normal blending (NOT additive) so overlapping lines stay crisp & legible.
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        color: new THREE.Color(0.82, 0.88, 1.0),
      });
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;

      // Three loose depth bands for parallax volume.
      const layer = i % 3;
      const sizeScale = 1.1 - layer * 0.2 + Math.random() * 0.15;
      const h = baseSprite * sizeScale;
      pBaseH[i] = h;
      pBaseW[i] = h * texAspect;

      pBirth[i] = Math.random() * T_FLOW_DURATION; // stream in over ~2.8s
      pDur[i] = 3.2 + Math.random() * 0.5; // varied speed; all arrive by ~6.5s

      const angle = Math.random() * Math.PI * 2;
      pDirX[i] = Math.cos(angle);
      pDirY[i] = Math.sin(angle);
      pR0[i] = cornerDist * (1.0 + layer * 0.2 + Math.random() * 0.22);
      pZ0[i] = (Math.random() - 0.5) * (10 + layer * 8);

      sprites.push(sprite);
      spriteMats.push(mat);
      spriteGroup.add(sprite);
    }

    /* ---- Singularity core (forms FROM the compressing text) -------------- */
    const coreTexture = makeRadialTexture(0.25);
    const coreMaterial = new THREE.SpriteMaterial({
      map: coreTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      color: new THREE.Color(0.9, 0.98, 1.0),
    });
    const core = new THREE.Sprite(coreMaterial);
    core.scale.set(0.01, 0.01, 1);
    scene.add(core);

    /* ---- Phase 3: fluid nebula (soft clouds, NOT square particles) ------- */
    // Many large, very soft, additive radial sprites overlap into a gaseous
    // wash that blooms outward then SETTLES into a dim drifting background.
    const nebulaTexture = makeRadialTexture(0.0); // extra-soft feathering
    const nebula: {
      sprite: THREE.Sprite;
      mat: THREE.SpriteMaterial;
      dirX: number;
      dirY: number;
      maxR: number;
      rate: number;
      baseSize: number;
      delay: number;
      peak: number;
      floor: number;
      decay: number;
      driftAmp: number;
      driftFreq: number;
      phase: number;
    }[] = [];
    for (let i = 0; i < NEBULA_COUNT; i++) {
      const col = NEBULA_COLORS[i % NEBULA_COLORS.length];
      const mat = new THREE.SpriteMaterial({
        map: nebulaTexture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        color: new THREE.Color(col[0], col[1], col[2]),
      });
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;
      const ang = Math.random() * Math.PI * 2;
      nebula.push({
        sprite,
        mat,
        dirX: Math.cos(ang),
        dirY: Math.sin(ang),
        maxR: 4 + Math.random() * halfW * 0.85,
        rate: 3 + Math.random() * 3,
        baseSize: 22 + Math.random() * 40,
        delay: Math.random() * 0.18,
        peak: 0.18 + Math.random() * 0.28,
        floor: 0.04 + Math.random() * 0.06, // persistent background level
        decay: 1.1 + Math.random() * 1.6,
        driftAmp: 2 + Math.random() * 6,
        driftFreq: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
      sprite.position.z = -8 - Math.random() * 18; // sit behind the core/text
      scene.add(sprite);
    }

    /* ---- Web Audio: sub-bass rumble that hard-cuts at convergence -------- */
    let audioCtx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;
    try {
      const AC: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtx = new AC();
      const now = audioCtx.currentTime;

      osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(40, now);
      osc.frequency.linearRampToValueAtTime(58, now + T_CONVERGE_END);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.8, now + T_CONVERGE_END); // build...
      gain.gain.setValueAtTime(0.0, now + T_CONVERGE_END); // ...HARD CUT to silence

      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + T_CONVERGE_END + 0.05);

      if (audioCtx.state === "suspended") void audioCtx.resume();
    } catch {
      audioCtx = null;
      osc = null;
    }

    /* ---- Interaction: keypress dismisses (button handles clicks) --------- */
    const onKey = () => handleEnter();
    window.addEventListener("keydown", onKey);

    /* ---- Resize ---------------------------------------------------------- */
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      aspect = w / h;
      halfW = halfH * aspect;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    /* ---- Animation loop -------------------------------------------------- */
    const startMs = performance.now();
    let rafId = 0;
    const tmpColor = new THREE.Color();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = (performance.now() - startMs) / 1000;

      /* DOM layers — set directly via refs (no React re-render per frame). */
      if (titleRef.current) {
        // Grow from a point out of the blast (reverse-squeezed), then HOLD.
        const g = easeOutBack(range(t, T_LETTER_GROW_START, T_LETTER_GROW_END));
        const scale = 0.04 + 0.96 * g;
        titleRef.current.style.transform = `scale(${scale})`;
        titleRef.current.style.opacity = String(range(t, T_TITLE_IN, T_TITLE_DONE));
      }
      if (subtitleRef.current)
        subtitleRef.current.style.opacity = String(range(t, T_SUB_IN, T_SUB_DONE));
      if (enterRef.current)
        enterRef.current.style.opacity = String(range(t, T_ENTER_IN, T_ENTER_DONE));

      if (t >= T_ENTER_IN) enterReadyRef.current = true;

      if (t < T_BURST) {
        /* ----- Phases 1 & 2: readable infall + compressing singularity --- */
        spriteGroup.visible = true;

        let arrived = 0;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const local = (t - pBirth[i]) / pDur[i];
          const mat = spriteMats[i];
          const sprite = sprites[i];

          if (local <= 0) {
            sprite.visible = false;
            continue;
          }
          sprite.visible = true;

          const lp = clamp01(local);
          const e = easeIn(lp); // accelerate toward center
          const radius = pR0[i] * (1 - e);
          // Straight radial fall — no spiral. Stays horizontal & readable.
          sprite.position.set(
            pDirX[i] * radius,
            pDirY[i] * radius,
            pZ0[i] * (1 - e)
          );
          sprite.scale.set(pBaseW[i], pBaseH[i], 1); // constant size, never stretched

          if (lp >= 0.985) arrived++;

          // Readable while travelling; dissolve into the singularity at the core.
          const born = clamp01(local / 0.18);
          const dissolve = 1 - smoothstep(clamp01((e - 0.82) / 0.18));
          mat.opacity = born * 0.95 * dissolve;
          const warm = clamp01((e - 0.6) / 0.4);
          tmpColor.setRGB(0.82 + 0.18 * warm, 0.88 + 0.1 * warm, 1.0);
          mat.color.copy(tmpColor);
        }

        // The singularity's glow is born from the compressed mass.
        const arrivedFrac = arrived / PARTICLE_COUNT;
        if (t < T_CONVERGE_END) {
          const glow = smoothstep(arrivedFrac);
          coreMaterial.opacity = glow * 0.95;
          const cs = 0.2 + glow * 9;
          core.scale.set(cs, cs, 1);
        } else {
          const pulse = 1 + 0.1 * Math.sin((t - T_CONVERGE_END) * 42);
          coreMaterial.opacity = 1;
          const cs = 9.5 * pulse;
          core.scale.set(cs, cs, 1);
        }
      } else {
        /* ----- Phase 3: supernova fluid bloom (background nebula) -------- */
        spriteGroup.visible = false;
        const tau = t - T_BURST;

        // Core flashes white, then is consumed by the expanding fluid.
        coreMaterial.opacity = Math.max(0, 1 - tau * 5);
        const ccs = 9.5 * (1 + tau * 5);
        core.scale.set(ccs, ccs, 1);

        for (let i = 0; i < nebula.length; i++) {
          const n = nebula[i];
          const lt = tau - n.delay;
          if (lt <= 0) {
            n.sprite.visible = false;
            continue;
          }
          n.sprite.visible = true;
          // Explosive expansion that decelerates (fast then graceful), plus a
          // slow living drift so the gas keeps breathing in the background.
          const reach = 1 - Math.exp(-n.rate * lt);
          const r = n.maxR * reach;
          const driftX = Math.sin(lt * n.driftFreq + n.phase) * n.driftAmp;
          const driftY = Math.cos(lt * n.driftFreq * 0.8 + n.phase) * n.driftAmp;
          n.sprite.position.x = n.dirX * r + driftX;
          n.sprite.position.y = n.dirY * r + driftY;
          const sz = n.baseSize * (0.5 + 0.5 * reach);
          n.sprite.scale.set(sz, sz, 1);
          // Bloom bright, then settle to a dim, persistent background floor.
          const rampUp = clamp01(lt / 0.12);
          n.mat.opacity =
            rampUp * (n.floor + (n.peak - n.floor) * Math.exp(-lt * n.decay));
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    /* ---- Cleanup --------------------------------------------------------- */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);

      try {
        osc?.stop();
      } catch {
        /* already stopped */
      }
      osc?.disconnect();
      void audioCtx?.close();

      fragmentTextures.forEach(({ texture }) => texture.dispose());
      spriteMats.forEach((m) => m.dispose());
      nebula.forEach((n) => n.mat.dispose());
      nebulaTexture.dispose();
      coreTexture.dispose();
      coreMaterial.dispose();
      scene.clear();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }

      if (injectedFontLink && injectedFontLink.parentNode) {
        injectedFontLink.parentNode.removeChild(injectedFontLink);
      }
    };
    // Intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mountRef}
      onTransitionEnd={(e) => {
        if (e.propertyName === "transform" && exiting) finalize();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "#0a0a0a",
        overflow: "hidden",
        transform: exiting ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 850ms cubic-bezier(0.7, 0, 0.2, 1)",
        willChange: "transform",
      }}
    >
      {/* The persistent composition: title, orange subtitle, orange enter button.
          The fluid nebula lives in the WebGL canvas behind all of this. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          pointerEvents: "none",
        }}
      >
        {/* CLAUDE MYTHOS — grows from a point out of the supernova, then stays. */}
        <h1
          ref={titleRef}
          style={{
            fontFamily: "'Cormorant Garamond', var(--font-cormorant), serif",
            fontWeight: 300,
            fontSize: "clamp(2.75rem, 9vw, 7rem)",
            letterSpacing: "0.3em",
            paddingLeft: "0.3em", // counter letter-spacing for true centering
            color: "#ffffff",
            margin: 0,
            lineHeight: 1,
            opacity: 0,
            transform: "scale(0.04)",
            transformOrigin: "center center",
            willChange: "transform, opacity",
            textShadow: "0 0 32px rgba(180,230,255,0.4)",
          }}
        >
          CLAUDE MYTHOS
        </h1>

        {/* Subtitle in Anthropic orange. */}
        <div
          ref={subtitleRef}
          style={{
            fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
            fontWeight: 500,
            fontSize: "0.95rem",
            letterSpacing: "0.04em",
            color: ANTHROPIC_ORANGE,
            opacity: 0,
          }}
        >
          Anthropic&apos;s upcoming flagship model
        </div>

        {/* Small orange enter button with a white arrow. */}
        <button
          ref={enterRef}
          type="button"
          onClick={handleEnter}
          aria-label="Enter"
          style={{
            marginTop: "0.5rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.55rem",
            background: ANTHROPIC_ORANGE,
            color: "#ffffff",
            border: "none",
            borderRadius: "9999px",
            padding: "0.55rem 1.4rem",
            fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
            fontWeight: 500,
            fontSize: "0.8rem",
            letterSpacing: "0.18em",
            textTransform: "lowercase",
            cursor: "pointer",
            pointerEvents: "auto",
            opacity: 0,
            boxShadow: "0 0 24px rgba(217,119,87,0.45)",
          }}
        >
          enter
          {/* White arrow */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" y1="12" x2="20" y2="12" />
            <polyline points="13 5 20 12 13 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Helpers                                                                  */
/* ======================================================================== */

/** Render a text fragment onto a canvas and wrap it as a sprite map. */
function makeTextTexture(
  text: string,
  fontStack: string
): {
  texture: THREE.CanvasTexture;
  aspect: number;
} {
  const fontPx = 48;
  const pad = 12;

  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d")!;
  mctx.font = `${fontPx}px ${fontStack}`;
  const textW = Math.ceil(mctx.measureText(text).width);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(2, textW + pad * 2);
  canvas.height = fontPx + pad * 2;

  const ctx = canvas.getContext("2d")!;
  ctx.font = `${fontPx}px ${fontStack}`; // re-apply after resize cleared state
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(235,242,255,1)";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return { texture, aspect: canvas.width / canvas.height };
}

/**
 * Soft radial-gradient texture used for the core and the fluid nebula.
 * `coreStop` controls how solid the center is (0 = extra-soft/gaseous).
 */
function makeRadialTexture(coreStop: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(Math.max(0.0001, coreStop), "rgba(255,255,255,0.7)");
  g.addColorStop(0.5, "rgba(255,255,255,0.22)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}
