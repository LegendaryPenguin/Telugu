import { useEffect, useMemo, useState } from "react";
import { allPhrases, allBuiltInPhrases } from "../content";
import { SpeakButton, MicButton, Devanagari } from "../ui/controls";
import { ensureCard, updateCard, getState, recordAttempt, bumpStreak, useAppState } from "../store";
import { tts } from "../speech";
import { schedule, isDue, previewLabel, newCard } from "../srs/scheduler";
import { phraseFrequencyRank } from "../content/frequency";
import type { Phrase } from "../content/types";

// How many brand-new phrases to introduce per session. Keeping this modest
// avoids cognitive overload and leaves room for spaced review of older items.
const NEW_PER_DAY = 8;

type Mode = "intro" | "produce" | "listen";
interface Item {
  phrase: Phrase;
  mode: Mode;
  isNew: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build the day's queue: due reviews interleaved with a capped set of new cards.
// Interleaving (mixing items and cue types) is a "desirable difficulty" — it
// feels harder but produces stronger, more flexible long-term memory than
// blocking one deck at a time.
function buildQueue(now: number): Item[] {
  const cards = getState().cards;
  const all = allPhrases();
  const due = shuffle(all.filter((p) => cards[p.id] && isDue(cards[p.id], now)));
  // New cards ordered by, in turn:
  //  1. hand-curated survival priority (pedagogy comes first);
  //  2. real-world word frequency as a tie-breaker within a priority band, so a
  //     complete beginner meets the most-used phrases first (standard-spelling
  //     list, so Telangana-only forms fall back to curated deck order);
  //  3. original deck order as the final, stable fallback.
  const fresh = allBuiltInPhrases()
    .filter((p) => !cards[p.id])
    .map((p, i) => ({ p, i, freq: phraseFrequencyRank(p.te) }))
    .sort(
      (a, b) =>
        (a.p.priority ?? 100) - (b.p.priority ?? 100) || a.freq - b.freq || a.i - b.i
    )
    .slice(0, NEW_PER_DAY)
    .map((x) => x.p);

  const items: Item[] = [];
  let di = 0;
  let ni = 0;
  let reviewSeen = 0;
  while (di < due.length || ni < fresh.length) {
    // Weave in ~3 reviews per new card so old material stays interleaved.
    for (let k = 0; k < 3 && di < due.length; k++) {
      items.push({ phrase: due[di++], mode: reviewSeen++ % 2 === 0 ? "produce" : "listen", isNew: false });
    }
    if (ni < fresh.length) items.push({ phrase: fresh[ni++], mode: "intro", isNew: true });
  }
  return items;
}

function GradeButton({ label, sub, onClick, color }: { label: string; sub: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center rounded-lg py-2.5 font-medium text-white transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${color}`}
    >
      <span>{label}</span>
      <span className="text-[11px] font-normal text-white/70">{sub}</span>
    </button>
  );
}

function WhyThisWorks() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 text-sm">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-2 text-slate-300">
        <span>Why this session is built this way</span>
        <span className="text-slate-500">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="space-y-1.5 border-t border-slate-700 px-4 py-3 text-slate-400">
          <li>
            <b className="text-slate-300">Retrieval, not re-reading.</b> You try to say it from memory <i>before</i> the answer
            shows. Struggling to recall is what builds durable memory (the testing effect).
          </li>
          <li>
            <b className="text-slate-300">Spacing.</b> New words come back after minutes, then days — each successful recall
            stretches the gap. Spaced practice beats cramming for long-term retention.
          </li>
          <li>
            <b className="text-slate-300">Interleaving.</b> Reviews from different topics and two cue types (speak-from-English
            vs. understand-what-you-hear) are mixed, which trains flexible recall.
          </li>
          <li>
            <b className="text-slate-300">Say it out loud.</b> Producing speech (not just reading) is what you actually need with
            her — and the production effect makes it stick harder.
          </li>
        </ul>
      )}
    </div>
  );
}

function StartHere() {
  return (
    <div className="rounded-2xl border border-teal-800/60 bg-teal-900/20 p-4 text-sm text-teal-50">
      <div className="font-semibold text-teal-200">New here? Start in 30 seconds.</div>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-teal-100/90">
        <li>
          Tap <b>Sounds</b> (bottom bar) first — it shows how to pronounce our spelling (2 min). You never read Telugu script.
        </li>
        <li>Then come back here and do this short session each day. It picks what to review automatically.</li>
        <li>Every card: try to say it out loud, then reveal and copy the audio. Rate yourself honestly.</li>
      </ol>
      <div className="mt-2 text-teal-200/80">Goal #1: enough to text and talk with her. Little and often beats cramming.</div>
    </div>
  );
}

export default function Today() {
  useAppState((s) => s.cards);
  const now = Date.now();
  const firstRun = Object.keys(getState().cards).length === 0;
  const queue = useMemo(() => buildQueue(now), []); // build once per visit

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, learned: 0 });

  function applyGrade(it: Item, g: 0 | 3 | 4 | 5) {
    const card = ensureCard(it.phrase.id, Date.now());
    updateCard(it.phrase.id, schedule(card, g, Date.now()));
    bumpStreak(Date.now());
    setStats((s) => (it.isNew ? { ...s, learned: s.learned + 1 } : { ...s, reviewed: s.reviewed + 1 }));
    setRevealed(false);
    setIdx((i) => i + 1);
  }

  // Keyboard flow (desktop): Space/Enter reveals, then 1–4 grade. Makes drilling
  // fast, like Anki/Duolingo. Listener is scoped to this screen (unmounts on tab
  // change) and there are no text inputs here to conflict with.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (idx >= queue.length) return;
      const it = queue[idx];
      const answered = it.mode === "intro" || revealed;
      if (!answered) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setRevealed(true);
        }
        return;
      }
      const grades: Record<string, 0 | 3 | 4 | 5> = { "1": 0, "2": 3, "3": 4, "4": 5 };
      if (e.key in grades) {
        e.preventDefault();
        applyGrade(it, grades[e.key]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, revealed, queue]);

  // Auto-play listen-cards: the task IS to hear it, so don't make them tap Play.
  useEffect(() => {
    if (idx < queue.length && queue[idx].mode === "listen") {
      tts.speak(queue[idx].phrase.te, { rate: getState().settings.speakRate });
    }
  }, [idx, queue]);

  if (queue.length === 0) {
    return (
      <div className="space-y-4">
        <WhyThisWorks />
        <div className="rounded-xl bg-slate-800/60 p-6 text-center">
          <div className="text-2xl">🎉</div>
          <p className="mt-2 text-slate-200">
            You're all caught up — nothing due and no new cards queued. Come back later, or use Talk/Shadow to keep the ear warm.
          </p>
        </div>
      </div>
    );
  }

  if (idx >= queue.length) {
    return (
      <div className="rounded-xl bg-slate-800/60 p-6 text-center">
        <div className="text-2xl">✅</div>
        <p className="mt-2 text-slate-200">
          Session done — {stats.learned} new, {stats.reviewed} reviewed.
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Little and often wins. Coming back tomorrow is worth more than doubling up today.
        </p>
      </div>
    );
  }

  const item = queue[idx];
  const p = item.phrase;
  // The card state used to preview what each grade will schedule (a fresh card
  // for brand-new items). Cheap, and it makes self-grading informed.
  const cardForPreview = getState().cards[p.id] ?? newCard(now);
  const progressPct = Math.round((idx / queue.length) * 100);

  const grade = (g: 0 | 3 | 4 | 5) => applyGrade(item, g);

  // Cue text depends on the retrieval mode (interleaving modalities).
  const cue =
    item.mode === "intro"
      ? "New phrase — study it, then cover it and say it aloud."
      : item.mode === "produce"
      ? "Say this in Telugu (out loud, before revealing):"
      : "Listen — what does it mean? Then say it back.";

  const showAnswer = item.mode === "intro" || revealed;

  return (
    <div className="space-y-4">
      {firstRun && idx === 0 && <StartHere />}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-teal-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          {idx + 1} / {queue.length}
        </span>
        <span>
          {item.isNew ? (
            <span className="rounded-full bg-emerald-800/60 px-2 py-0.5 text-emerald-300">new</span>
          ) : (
            <span className="rounded-full bg-slate-700 px-2 py-0.5">{item.mode === "listen" ? "understand" : "speak"}</span>
          )}
        </span>
      </div>

      <div className="rounded-2xl bg-slate-800/60 p-6 text-center">
        <div className="text-lg text-slate-300">{cue}</div>

        {/* The cue itself: English for produce/intro; audio for listen. */}
        {item.mode === "listen" ? (
          <div className="mt-3 flex justify-center">
            <SpeakButton text={p.te} />
          </div>
        ) : (
          <div className="mt-2 text-2xl font-bold text-white">{p.en}</div>
        )}

        {!showAnswer ? (
          <div className="mt-5">
            <button
              onClick={() => setRevealed(true)}
              className="rounded-full bg-teal-600 px-5 py-2 font-medium text-white transition hover:bg-teal-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              Reveal answer
            </button>
            <div className="mt-2 hidden text-[11px] text-slate-600 sm:block">or press Space</div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="text-2xl font-semibold text-teal-300">{p.roman}</div>
            <Devanagari te={p.te} className="text-xl" />
            {item.mode === "listen" && <div className="text-slate-300">{p.en}</div>}
            {p.literal && <div className="text-sm text-slate-500">lit. {p.literal}</div>}
            <div className="flex items-center justify-center gap-3">
              <SpeakButton text={p.te} />
              <MicButton
                targetScript={p.te}
                onScored={(s) => recordAttempt({ phraseId: p.id, score: s.overall, at: Date.now() })}
              />
            </div>
            {p.note && <div className="text-sm text-slate-400">{p.note}</div>}
          </div>
        )}
      </div>

      {showAnswer && (
        <>
          <div className="text-center text-xs text-slate-500">
            {item.isNew ? "How well could you say it without looking?" : "Rate honestly — grading yourself hard is what schedules it right."}
          </div>
          <div className="grid grid-cols-4 gap-2">
            <GradeButton label="Again" sub={previewLabel(cardForPreview, 0, now)} onClick={() => grade(0)} color="bg-rose-700 hover:bg-rose-600" />
            <GradeButton label="Hard" sub={previewLabel(cardForPreview, 3, now)} onClick={() => grade(3)} color="bg-amber-700 hover:bg-amber-600" />
            <GradeButton label="Good" sub={previewLabel(cardForPreview, 4, now)} onClick={() => grade(4)} color="bg-teal-700 hover:bg-teal-600" />
            <GradeButton label="Easy" sub={previewLabel(cardForPreview, 5, now)} onClick={() => grade(5)} color="bg-emerald-700 hover:bg-emerald-600" />
          </div>
          <div className="hidden text-center text-[11px] text-slate-600 sm:block">press 1–4 to rate</div>
        </>
      )}

      {idx === 0 && !firstRun && <WhyThisWorks />}
    </div>
  );
}
