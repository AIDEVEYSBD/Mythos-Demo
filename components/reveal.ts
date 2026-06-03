import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface RevealOpts {
  /** Vertical offset (px) the elements rise from. */
  y?: number;
  /** ScrollTrigger start position. */
  start?: string;
  /** Stagger between elements in a batch. */
  stagger?: number;
  /** Reveal duration (seconds). */
  duration?: number;
}

/**
 * Reveal-on-scroll that REPLAYS in both directions.
 *
 * Elements animate in when they enter the viewport (scrolling down), and reset
 * to their hidden state when you scroll back up past them — so scrolling up
 * reverses the animation and scrolling down again replays it. Elements you've
 * already scrolled past (downward) stay visible, so the deck never flickers
 * while reading forward.
 *
 * Call inside a `gsap.context(() => { ... }, rootRef)` so the triggers it
 * creates are reverted on unmount. Selectors are global class names (unique per
 * section), so no scoping is required.
 */
export function revealBatch(selector: string, opts: RevealOpts = {}): void {
  const { y = 28, start = "top 85%", stagger = 0.08, duration = 0.7 } = opts;

  gsap.set(selector, { opacity: 0, y });

  const show = (batch: Element[]) =>
    gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration,
      ease: "power2.out",
      stagger,
      overwrite: true,
    });

  const hide = (batch: Element[]) =>
    gsap.to(batch, {
      opacity: 0,
      y,
      duration: duration * 0.45,
      ease: "power2.in",
      overwrite: true,
    });

  ScrollTrigger.batch(selector, {
    start,
    onEnter: show,
    onLeaveBack: hide,
  });
}
