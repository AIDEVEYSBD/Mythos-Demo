/**
 * AuroraBackground — a fixed, full-viewport field of slowly drifting colour
 * that sits behind every section (sections are transparent, so this shows
 * through). Deep, dark base + low-opacity amber / indigo / teal / violet blobs
 * give the deck a "frontier lab" ambience without fighting the content.
 *
 * Purely presentational and non-interactive (pointer-events: none, aria-hidden).
 */
export default function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Deep base gradient — a touch of indigo at the top, near-black below. */}
      <div className="absolute inset-0 bg-[radial-gradient(130%_120%_at_50%_-10%,#0d0c14_0%,#0a0a0c_42%,#080808_100%)]" />

      {/* Colour blobs. Large and soft, with bright centres anchored near the
          margins so colour bleeds toward the middle without a hotspot landing
          on body text. Each drifts on its own clock. */}
      <div
        className="aurora-blob"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.38), transparent 65%)",
          top: "-18%",
          left: "-10%",
          width: "78vw",
          height: "78vw",
          animationName: "auroraDrift1",
          animationDuration: "26s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.36), transparent 65%)",
          top: "-6%",
          right: "-16%",
          width: "70vw",
          height: "70vw",
          animationName: "auroraDrift2",
          animationDuration: "32s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          background: "radial-gradient(circle, rgba(20,184,166,0.32), transparent 65%)",
          bottom: "-24%",
          left: "-2%",
          width: "72vw",
          height: "72vw",
          animationName: "auroraDrift3",
          animationDuration: "30s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.32), transparent 65%)",
          bottom: "-12%",
          right: "-8%",
          width: "62vw",
          height: "62vw",
          animationName: "auroraDrift1",
          animationDuration: "38s",
        }}
      />

      {/* Vignette — soft; just enough to settle the far edges without killing
          the colour. Lighter than a true vignette so the aurora stays present. */}
      <div className="absolute inset-0 bg-[radial-gradient(135%_135%_at_50%_50%,transparent_68%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
