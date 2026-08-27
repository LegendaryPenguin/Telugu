// Spaced-repetition scheduler.
//
// Front-end: short "learning steps" (and relearning steps on a lapse) so new or
// forgotten cards get within-session distributed practice with expanding
// retrieval before graduating to day-scale intervals.
//
// Day-scale engine: FSRS (Free Spaced Repetition Scheduler) — its DSR
// (Difficulty/Stability/Retrievability) model reaches the same retention as SM-2
// with ~20–30% fewer reviews, and optimizes to a target retention directly
// instead of SM-2's fixed ease heuristics. We disable FSRS's own short-term
// steps (enable_short_term:false) because the learning/relearning steps above
// are our front-end; FSRS owns everything from the first graduation onward.
//
// Grades: 0 = again, 3 = hard, 4 = good, 5 = easy.

import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card as FsrsCard,
  type FSRS,
  type Grade
} from "ts-fsrs";

export interface CardState {
  phase: "learning" | "review";
  step: number; // index into the learning-steps ladder
  reps: number; // successful review reps (after graduation)
  intervalDays: number; // last day-scale interval (for display)
  dueAt: number; // epoch ms
  lapses: number;
  // FSRS memory state — 0 until the card first graduates to review.
  stability: number;
  difficulty: number;
  lastReview: number; // epoch ms of last review, 0 if none
}

const MIN = 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

// Minutes between learning-step reviews before a card graduates to day-scale.
const LEARNING_STEPS_MIN = [1, 10];
const RELEARN_STEP_MIN = 10;

// FSRS Rating for each of our grades.
const RATING: Record<0 | 3 | 4 | 5, Grade> = {
  0: Rating.Again,
  3: Rating.Hard,
  4: Rating.Good,
  5: Rating.Easy
};

// ── FSRS instance (rebuilt only when desired retention changes) ─────────────
let requestRetention = 0.9;
let _fsrs: FSRS | null = null;
function engine(): FSRS {
  if (!_fsrs) {
    _fsrs = fsrs(
      generatorParameters({
        request_retention: requestRetention,
        enable_short_term: false, // our learning/relearning steps are the short-term front-end
        enable_fuzz: false // deterministic intervals (predictable previews + testable)
      })
    );
  }
  return _fsrs;
}

// Let the UI expose a "desired retention" slider (0.7–0.97). Higher = more
// reviews, better recall. Callers update this when the setting changes.
export function setDesiredRetention(r: number): void {
  const clamped = Math.min(0.97, Math.max(0.7, r));
  if (clamped !== requestRetention) {
    requestRetention = clamped;
    _fsrs = null;
  }
}
export function getDesiredRetention(): number {
  return requestRetention;
}

export function newCard(now: number): CardState {
  return {
    phase: "learning",
    step: 0,
    reps: 0,
    intervalDays: 0,
    dueAt: now,
    lapses: 0,
    stability: 0,
    difficulty: 0,
    lastReview: 0
  };
}

export function isDue(card: CardState, now: number): boolean {
  return card.dueAt <= now;
}

// Legacy cards saved before this scheduler shape — fill missing fields so old
// progress keeps working. Cards from the SM-2 era have no FSRS memory state;
// we seed a rough stability from their last interval so FSRS can continue
// rather than resetting their progress.
function normalize(card: CardState): CardState {
  const phase = card.phase ?? "review";
  const intervalDays = card.intervalDays ?? 0;
  return {
    phase,
    step: card.step ?? 0,
    reps: card.reps ?? 0,
    intervalDays,
    dueAt: card.dueAt ?? 0,
    lapses: card.lapses ?? 0,
    stability: card.stability ?? 0,
    difficulty: card.difficulty ?? 0,
    lastReview: card.lastReview ?? 0
  };
}

// Reconstruct an FSRS Card from our stored state (for a card that has review history).
function toReviewCard(card: CardState): FsrsCard {
  return {
    due: new Date(card.dueAt),
    stability: card.stability > 0 ? card.stability : Math.max(1, card.intervalDays || 1),
    difficulty: card.difficulty > 0 ? card.difficulty : 5,
    elapsed_days: 0,
    scheduled_days: card.intervalDays || 0,
    learning_steps: 0,
    reps: card.reps,
    lapses: card.lapses,
    state: State.Review,
    last_review: card.lastReview ? new Date(card.lastReview) : undefined
  };
}

// Apply an FSRS rating and return the resulting review-phase CardState.
// Uses the card's existing memory state if it has any, else starts fresh.
function fsrsApply(card: CardState, rating: Grade, now: number): CardState {
  const f = engine();
  const base = card.stability > 0 ? toReviewCard(card) : createEmptyCard(now);
  const { card: nc } = f.next(base, now, rating);
  return {
    phase: "review",
    step: 0,
    reps: nc.reps,
    lapses: nc.lapses,
    intervalDays: nc.scheduled_days,
    stability: nc.stability,
    difficulty: nc.difficulty,
    lastReview: now,
    dueAt: nc.due.getTime()
  };
}

export function schedule(input: CardState, grade: 0 | 3 | 4 | 5, now: number): CardState {
  const card = normalize(input);

  if (card.phase === "learning") {
    if (grade === 0) {
      // Again: back to the first learning step.
      return { ...card, step: 0, dueAt: now + LEARNING_STEPS_MIN[0] * MIN };
    }
    if (grade === 3) {
      // Hard: repeat the current step.
      const m = LEARNING_STEPS_MIN[Math.min(card.step, LEARNING_STEPS_MIN.length - 1)];
      return { ...card, dueAt: now + m * MIN };
    }
    if (grade === 4) {
      const next = card.step + 1;
      if (next < LEARNING_STEPS_MIN.length) {
        return { ...card, step: next, dueAt: now + LEARNING_STEPS_MIN[next] * MIN };
      }
      // Finished the ladder → graduate to FSRS day-scale.
      return fsrsApply(card, Rating.Good, now);
    }
    // Easy: graduate immediately.
    return fsrsApply(card, Rating.Easy, now);
  }

  // ── review phase ──
  if (grade === 0) {
    // Lapse: update FSRS memory (decays stability, bumps difficulty + lapses),
    // then drop into a short relearning step instead of FSRS's day interval so
    // the card gets a within-session retry.
    const updated = fsrsApply(card, Rating.Again, now);
    return { ...updated, phase: "learning", step: 0, dueAt: now + RELEARN_STEP_MIN * MIN };
  }

  return fsrsApply(card, RATING[grade], now);
}

// Human label for what a given grade will do to a card right now (e.g. "10m",
// "1d", "4d") — shown on the grade buttons so self-grading is informed. Computed
// by running the real scheduler so the label always matches actual behavior.
export function previewLabel(card: CardState, grade: 0 | 3 | 4 | 5, now: number): string {
  const next = schedule(card, grade, now);
  const delta = Math.max(0, next.dueAt - now);
  if (delta < 60 * MIN) return `${Math.max(1, Math.round(delta / MIN))}m`;
  if (delta < DAY) return `${Math.round(delta / (60 * MIN))}h`;
  if (delta < 30 * DAY) return `${Math.round(delta / DAY)}d`;
  return `${Math.round(delta / (30 * DAY))}mo`;
}
