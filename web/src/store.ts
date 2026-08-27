import { useSyncExternalStore } from "react";
import type { CardState } from "./srs/scheduler";
import { newCard, schedule, setDesiredRetention as applyDesiredRetention } from "./srs/scheduler";
import type { Phrase } from "./content/types";

// ── Persistent app state (localStorage) ─────────────────────────────────────

export interface PronAttempt {
  phraseId: string;
  score: number;
  at: number;
}

export interface CustomPhrase extends Phrase {
  deckId: "custom";
  createdAt: number;
}

// Per-module course progress. `bestPct` is the best module-test score (0–100).
export interface ModuleProgress {
  completed: boolean;
  bestPct: number;
  at: number; // epoch ms of last completion
}

export interface AppState {
  course: Record<string, ModuleProgress>; // keyed by module id
  cards: Record<string, CardState>; // keyed by phrase id (legacy SRS — kept for old backups)
  attempts: PronAttempt[]; // pronunciation history (capped)
  custom: CustomPhrase[]; // user-logged phrases
  streak: { count: number; lastDay: string | null };
  settings: { speakRate: number; showDevanagari: boolean; desiredRetention: number };
}

const KEY = "telugu-speak-state-v1";

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch {
    /* ignore corrupt state */
  }
  return defaults();
}

function defaults(): AppState {
  return {
    course: {},
    cards: {},
    attempts: [],
    custom: [],
    streak: { count: 0, lastDay: null },
    settings: { speakRate: 0.9, showDevanagari: true, desiredRetention: 0.9 }
  };
}

let state: AppState = load();
// Sync the persisted retention target into the scheduler on startup.
applyDesiredRetention(state.settings.desiredRetention ?? 0.9);
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / private mode — keep running in memory */
  }
}

function set(update: (s: AppState) => AppState) {
  state = update(state);
  persist();
  emit();
}

// ── React binding ───────────────────────────────────────────────────────────
export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state)
  );
}

export function getState(): AppState {
  return state;
}

// ── Mutations ─────────────────────────────────────────────────────────────
function todayStr(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function ensureCard(id: string, now: number): CardState {
  if (!state.cards[id]) {
    set((s) => ({ ...s, cards: { ...s.cards, [id]: newCard(now) } }));
  }
  return state.cards[id];
}

export function updateCard(id: string, card: CardState) {
  set((s) => ({ ...s, cards: { ...s.cards, [id]: card } }));
}

// Grade a phrase's spaced-repetition card from a course check. This is how the
// FSRS scheduler stays fed now that reviewing happens *inside* modules — a
// correct check schedules the phrase further out, a miss brings it back soon.
// (0 = again, 3 = hard, 4 = good, 5 = easy.) No streak bump here — the module
// result handles that once, at the end.
export function gradePhrase(phraseId: string, grade: 0 | 3 | 4 | 5, now: number) {
  const card = ensureCard(phraseId, now);
  updateCard(phraseId, schedule(card, grade, now));
}

export function recordAttempt(a: PronAttempt) {
  set((s) => ({ ...s, attempts: [...s.attempts, a].slice(-500) }));
  bumpStreak(a.at);
}

// Record finishing a module's test. Keeps the best score seen and marks it
// complete; bumps the daily streak. Completing is not gated on score (the course
// is open) — the % is feedback, not a lock.
export function recordModuleResult(moduleId: string, pct: number, now: number) {
  set((s) => {
    const prev = s.course[moduleId];
    return {
      ...s,
      course: {
        ...s.course,
        [moduleId]: {
          completed: true,
          bestPct: Math.max(pct, prev?.bestPct ?? 0),
          at: now
        }
      }
    };
  });
  bumpStreak(now);
}

export function bumpStreak(now: number) {
  const today = todayStr(now);
  set((s) => {
    if (s.streak.lastDay === today) return s;
    const yesterday = todayStr(now - 24 * 60 * 60 * 1000);
    const count = s.streak.lastDay === yesterday ? s.streak.count + 1 : 1;
    return { ...s, streak: { count, lastDay: today } };
  });
}

export function addCustomPhrase(p: Omit<CustomPhrase, "deckId" | "createdAt">, now: number) {
  set((s) => ({
    ...s,
    custom: [...s.custom, { ...p, deckId: "custom", createdAt: now }]
  }));
}

export function removeCustomPhrase(id: string) {
  set((s) => ({ ...s, custom: s.custom.filter((c) => c.id !== id) }));
}

export function setSpeakRate(rate: number) {
  set((s) => ({ ...s, settings: { ...s.settings, speakRate: rate } }));
}

export function setShowDevanagari(on: boolean) {
  set((s) => ({ ...s, settings: { ...s.settings, showDevanagari: on } }));
}

export function setDesiredRetention(r: number) {
  applyDesiredRetention(r);
  set((s) => ({ ...s, settings: { ...s.settings, desiredRetention: r } }));
}

export function exportData(): string {
  return JSON.stringify(state, null, 2);
}

// Merge an imported backup into current state (custom phrases de-duped by id,
// cards/attempts merged). Returns true on success.
export function importData(jsonText: string): boolean {
  try {
    const incoming = JSON.parse(jsonText) as Partial<AppState>;
    set((s) => {
      const customById = new Map<string, CustomPhrase>();
      [...s.custom, ...(incoming.custom ?? [])].forEach((c) => customById.set(c.id, c));
      return {
        ...s,
        course: { ...s.course, ...(incoming.course ?? {}) },
        cards: { ...s.cards, ...(incoming.cards ?? {}) },
        attempts: [...s.attempts, ...(incoming.attempts ?? [])].slice(-500),
        custom: [...customById.values()],
        streak: incoming.streak ?? s.streak,
        settings: { ...s.settings, ...(incoming.settings ?? {}) }
      };
    });
    applyDesiredRetention(state.settings.desiredRetention ?? 0.9);
    return true;
  } catch {
    return false;
  }
}

export function bestScoreFor(id: string): number | null {
  const scores = state.attempts.filter((a) => a.phraseId === id).map((a) => a.score);
  return scores.length ? Math.max(...scores) : null;
}
