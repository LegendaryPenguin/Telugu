import { DECKS } from "./decks";
import type { Phrase } from "./types";
import { getState } from "../store";

export { DECKS, CONTENT_NEEDS_NATIVE_REVIEW } from "./decks";

// All built-in phrases, flat.
export function allBuiltInPhrases(): Phrase[] {
  return DECKS.flatMap((d) => d.phrases);
}

// Built-in + the user's custom phrases (custom shown as its own deck).
export function allPhrases(): Phrase[] {
  return [...allBuiltInPhrases(), ...getState().custom];
}

export function phraseById(id: string): Phrase | undefined {
  return allPhrases().find((p) => p.id === id);
}
