/**
 * AuroraBackground — a fixed, full-viewport field of slowly drifting colour
 * that sits behind every section (sections are transparent, so this shows
 * through). Deep, warm-dark base + low-opacity crimson / ember / rose / magenta
 * blobs give the deck a "threat / exploit" ambience without fighting the
 * content. The amber UI accent reads as the brightest note in the same family.
 *
 * Purely presentational and non-interactive (pointer-events: none, aria-hidden).
 */
export default function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Deep base gradient — a touch of warm crimson at the top, near-black below. */}
      <div className="absolute inset-0 bg-[radial-gradient(130%_120%_at_50%_-10%,#140a0c_0%,#0c0809_42%,#080808_100%)]" />

      {/* Colour blobs. Large and soft, with bright centres anchored near the
          margins so colour bleeds toward the middle without a hotspot landing
          on body text. Each drifts on its own clock. */}
      <div
        className="aurora-blob"
        style={{
          background: "radial-gradient(circle, rgba(239,68,68,0.36), transparent 65%)",
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
          background: "radial-gradient(circle, rgba(245,158,11,0.34), transparent 65%)",
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
          background: "radial-gradient(circle, rgba(251,113,133,0.30), transparent 65%)",
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
          background: "radial-gradient(circle, rgba(217,70,239,0.30), transparent 65%)",
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
