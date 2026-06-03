"use client";

import { useState } from "react";
import IntroAnimation from "@/components/IntroAnimation";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import ScrollSnap from "@/components/ScrollSnap";
import SectionFade from "@/components/SectionFade";
import OriginsSection from "@/components/OriginsSection";
import HowIsDifferentSection from "@/components/HowIsDifferentSection";
import AccelerationSection from "@/components/AccelerationSection";
import AsymmetrySection from "@/components/AsymmetrySection";
import GrcImpactSection from "@/components/GrcImpactSection";
import RiskRegisterSection from "@/components/RiskRegisterSection";
import ProgramSection from "@/components/ProgramSection";
import ActionsSection from "@/components/ActionsSection";
import QuestionsSection from "@/components/QuestionsSection";
import HumanTurnSection from "@/components/HumanTurnSection";
import BoardCloseSection from "@/components/BoardCloseSection";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <main>
      {/* Drifting aurora field behind every (now transparent) section. */}
      <AuroraBackground />

      {/* Intro slides up on "enter", revealing the main page beneath. */}
      {!introDone && <IntroAnimation onComplete={() => setIntroDone(true)} />}

      {/* Persistent deck navbar (covered by the intro until it slides away). */}
      <Navbar />

      {/* Snappy "lock to viewport" catch as each section scrolls into view. */}
      <ScrollSnap />

      {/* Content sits above the aurora (z-0) on its own layer. Sections are
          transparent, so the aurora shows through between and behind them.
          Sections cross-fade as they scroll in; each registers in sections.ts. */}
      <div className="relative z-10">
        <SectionFade>
          <OriginsSection shannonImageSrc="/Roberts-Claude-Shannon.webp" />
        </SectionFade>

      <SectionFade>
        <HowIsDifferentSection />
      </SectionFade>

      <SectionFade>
        <AccelerationSection />
      </SectionFade>

      <SectionFade>
        <AsymmetrySection />
      </SectionFade>

      <SectionFade>
        <GrcImpactSection />
      </SectionFade>

      <SectionFade>
        <RiskRegisterSection />
      </SectionFade>

      <SectionFade>
        <ProgramSection />
      </SectionFade>

      <SectionFade>
        <ActionsSection />
      </SectionFade>

      <SectionFade>
        <QuestionsSection />
      </SectionFade>

      <SectionFade>
        <HumanTurnSection />
      </SectionFade>

      <SectionFade>
        <BoardCloseSection />
      </SectionFade>
      </div>
    </main>
  );
}
