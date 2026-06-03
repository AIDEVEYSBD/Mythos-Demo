// Single source of truth for the deck's sections (this replaces a slide deck).
// Add new entries here as sections are built — the navbar and scroll-spy pick
// them up automatically. `id` must match the DOM id on each section element.

export interface SectionMeta {
  num: string;
  id: string;
  title: string;
}

export const SECTIONS: SectionMeta[] = [
  { num: "01", id: "introduction", title: "Introduction" },
  { num: "02", id: "how-different", title: "What Changed" },
  { num: "03", id: "acceleration", title: "The Acceleration" },
  { num: "04", id: "asymmetry", title: "The Asymmetry" },
  { num: "05", id: "grc-impact", title: "GRC Impact" },
  { num: "06", id: "risk-register", title: "Risk Register" },
  { num: "07", id: "program", title: "The Program" },
  { num: "08", id: "actions", title: "Priority Actions" },
  { num: "09", id: "questions", title: "Know Your Program" },
  { num: "10", id: "human-turn", title: "The Human Turn" },
  { num: "11", id: "board-close", title: "The Board Briefing" },
];
