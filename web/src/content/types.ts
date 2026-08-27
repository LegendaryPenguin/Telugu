// A single learnable item. Three layers:
//   te    — Telugu script (NEVER shown to the user; only drives text-to-speech)
//   roman — romanization (what the user reads)
//   en    — English meaning
// Optional literal/notes help the learner understand structure and Telangana usage.
export interface Phrase {
  id: string;
  te: string;
  roman: string;
  en: string;
  literal?: string; // word-for-word gloss, when the structure is non-obvious
  note?: string; // usage / Telangana-specific note
  tags?: string[];
  // Lower = introduce earlier. Used to front-load survival/high-frequency phrases
  // for a complete beginner regardless of which deck they live in. Default ~100.
  priority?: number;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  // Register + dialect metadata so the LLM and UI stay consistent.
  dialect: "telangana";
  register: "casual" | "clean";
  phrases: Phrase[];
}

// Deck content is authored/generated and should be reviewed by a native speaker
// before being treated as authoritative. See docs/PLAN.md §7.
export interface DeckReviewStatus {
  needsNativeReview: boolean;
}
