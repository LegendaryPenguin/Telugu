// The course: one ordered, guided path of modules. This is the whole app now —
// the learner works top to bottom (recommended order, but any module is
// openable). Each lesson module maps to a deck of phrases; review modules
// re-test earlier lessons; the primer is the pronunciation intro.
//
// It's fully data-driven: reorder, retitle, or insert modules by editing the
// COURSE array. Lesson `deckId`s reference decks in ./decks.

import { DECKS } from "./decks";
import type { Phrase } from "./types";

export type ModuleKind = "primer" | "lesson" | "review";

export interface CourseModule {
  id: string;
  title: string;
  goal: string; // one-line "what you'll be able to do"
  kind: ModuleKind;
  deckId?: string; // for lesson modules
  reviewOf?: string[]; // module ids a review pulls from
}

export const COURSE: CourseModule[] = [
  {
    id: "primer",
    title: "Sounds & your Hindi head-start",
    goal: "Pronounce Telugu using sounds you already have in Hindi.",
    kind: "primer"
  },
  { id: "greetings", title: "Greetings & basics", goal: "Greet her and say the words you'll use every day.", kind: "lesson", deckId: "greetings" },
  { id: "affection", title: "Affection & the relationship", goal: "Say you like, love, and miss her.", kind: "lesson", deckId: "affection" },
  { id: "daily", title: "Daily check-ins", goal: "Handle morning-to-night texting and calls.", kind: "lesson", deckId: "daily" },
  { id: "reviewA", title: "Review A", goal: "Lock in Greetings, Affection & Daily check-ins.", kind: "review", reviewOf: ["greetings", "affection", "daily"] },
  { id: "understanding", title: "Keeping the conversation alive", goal: "Rescue a chat when you don't follow.", kind: "lesson", deckId: "understanding" },
  { id: "blocks", title: "Building blocks", goal: "Snap together I / you / what / where to make your own lines.", kind: "lesson", deckId: "blocks" },
  { id: "questions", title: "Asking questions", goal: "Keep her talking — ask, don't just answer.", kind: "lesson", deckId: "questions" },
  { id: "reviewB", title: "Review B", goal: "Lock in Conversation, Building blocks & Questions.", kind: "review", reviewOf: ["understanding", "blocks", "questions"] },
  { id: "feelings", title: "Feelings", goal: "Say how you feel — happy, sad, tired, angry.", kind: "lesson", deckId: "feelings" },
  { id: "flirting", title: "Sweet talk", goal: "Compliment and tease, sweetly.", kind: "lesson", deckId: "flirting" },
  { id: "plans", title: "Time & plans", goal: "Make plans and say when.", kind: "lesson", deckId: "plans" },
  { id: "reviewC", title: "Review C", goal: "Lock in Feelings, Sweet talk & Plans.", kind: "review", reviewOf: ["feelings", "flirting", "plans"] },
  { id: "food", title: "Food & eating", goal: "Order, share, and talk about food together.", kind: "lesson", deckId: "food" }
];

// Cap on how many phrases a review module tests, so reviews stay short.
const REVIEW_CAP = 10;

function deckPhrases(deckId: string): Phrase[] {
  return DECKS.find((d) => d.id === deckId)?.phrases ?? [];
}

// The phrases a module teaches or tests. Lessons return their deck in order;
// reviews gather the referenced lessons' phrases, most-important first (by
// `priority`), capped so a review is a quick checkpoint, not a slog.
export function modulePhrases(m: CourseModule): Phrase[] {
  if (m.kind === "lesson" && m.deckId) return deckPhrases(m.deckId);
  if (m.kind === "review" && m.reviewOf) {
    const pool = m.reviewOf.flatMap((id) => {
      const mod = COURSE.find((x) => x.id === id);
      return mod?.deckId ? deckPhrases(mod.deckId) : [];
    });
    // Stable sort by priority (lower first), keep original order within a tier.
    return pool
      .map((p, i) => ({ p, i }))
      .sort((a, b) => (a.p.priority ?? 100) - (b.p.priority ?? 100) || a.i - b.i)
      .slice(0, REVIEW_CAP)
      .map((x) => x.p);
  }
  return [];
}

export function moduleById(id: string): CourseModule | undefined {
  return COURSE.find((m) => m.id === id);
}

// Display label: primer = "Intro", lessons numbered 1..N in order, reviews = "★".
export function moduleLabel(m: CourseModule): string {
  if (m.kind === "primer") return "Intro";
  if (m.kind === "review") return "★";
  let n = 0;
  for (const x of COURSE) {
    if (x.kind === "lesson") {
      n++;
      if (x.id === m.id) return String(n);
    }
  }
  return "";
}
