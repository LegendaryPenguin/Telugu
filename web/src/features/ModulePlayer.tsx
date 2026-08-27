import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { modulePhrases, moduleById } from "../content/course";
import type { CourseModule } from "../content/course";
import { allPhrases } from "../content";
import type { Phrase } from "../content/types";
import { SpeakButton, MicButton, Devanagari } from "../ui/controls";
import { DuoButton, BottomBar, ResultBar, Penguin } from "../ui/duo";
import { tts, stt } from "../speech";
import { recordAttempt, recordModuleResult, gradePhrase, getState, useAppState } from "../store";
import { isDue } from "../srs/scheduler";
import Sounds from "./Sounds";

// A module compiles into a linear list of steps the learner taps through:
//   • primer — the pronunciation intro (Module 0)
//   • teach  — meet one phrase (hear it, see meaning, say it)     [lessons only]
//   • listen — hear Telugu, pick the English (auto-corrected)     [check]
//   • speak  — English prompt → type it back / say it             [check]
//   • build  — arrange the words into the sentence                [check]
// Lessons open with a short WARM-UP of due phrases from earlier modules, so
// review is continuous (fed by FSRS). Every check grades the phrase's card.

type Step =
  | { kind: "primer" }
  | { kind: "teach"; phrase: Phrase }
  | { kind: "listen"; phrase: Phrase; options: string[]; review?: boolean }
  | { kind: "speak"; phrase: Phrase; review?: boolean }
  | { kind: "build"; phrase: Phrase; tiles: string[]; answer: string[]; review?: boolean };

const WARMUP_CAP = 5;

// ── deterministic helpers (stable across re-renders) ──
function tokenize(roman: string): string[] {
  return roman.replace(/[?.!,]/g, "").trim().split(/\s+/).filter(Boolean);
}
function normalizeRoman(s: string): string {
  return s.toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim();
}
function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}
function romanMatches(input: string, target: string): boolean {
  const a = normalizeRoman(input);
  const b = normalizeRoman(target);
  if (!a) return false;
  if (a === b) return true;
  return editDistance(a, b) <= Math.max(1, Math.floor(b.length * 0.15));
}
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = (seed + 1) >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function optionsFor(p: Phrase, pool: Phrase[], seed: number): string[] {
  const others = pool.filter((x) => x.en !== p.en);
  const distractors = seededShuffle(others, seed)
    .map((x) => x.en)
    .filter((en, i, a) => a.indexOf(en) === i)
    .slice(0, 3);
  return seededShuffle([p.en, ...distractors], seed + 7);
}
function buildTiles(p: Phrase, pool: Phrase[], seed: number): { tiles: string[]; answer: string[] } {
  const answer = tokenize(p.roman);
  const answerSet = new Set(answer.map((w) => w.toLowerCase()));
  const decoyWords = pool.flatMap((x) => tokenize(x.roman)).filter((w) => !answerSet.has(w.toLowerCase()));
  const decoys = seededShuffle([...new Set(decoyWords)], seed).slice(0, answer.length >= 4 ? 1 : 2);
  return { tiles: seededShuffle([...answer, ...decoys], seed + 3), answer };
}

function coreSteps(m: CourseModule): Step[] {
  if (m.kind === "primer") return [{ kind: "primer" }];
  const phrases = modulePhrases(m);
  const steps: Step[] = [];
  if (m.kind === "lesson") for (const p of phrases) steps.push({ kind: "teach", phrase: p });
  phrases.forEach((p, i) => {
    if (i % 2 === 0) steps.push({ kind: "listen", phrase: p, options: optionsFor(p, phrases, i) });
    else if (tokenize(p.roman).length >= 3) steps.push({ kind: "build", phrase: p, ...buildTiles(p, phrases, i) });
    else steps.push({ kind: "speak", phrase: p });
  });
  return steps;
}
function warmUpSteps(m: CourseModule, now: number): Step[] {
  if (m.kind === "primer") return [];
  const cards = getState().cards;
  const own = new Set(modulePhrases(m).map((p) => p.id));
  const pool = allPhrases();
  const due = pool
    .filter((p) => cards[p.id] && isDue(cards[p.id], now) && !own.has(p.id))
    .sort((a, b) => cards[a.id].dueAt - cards[b.id].dueAt)
    .slice(0, WARMUP_CAP);
  return due.map((p, i) =>
    i % 2 === 0
      ? { kind: "listen", phrase: p, options: optionsFor(p, pool, i + 101), review: true }
      : { kind: "speak", phrase: p, review: true }
  );
}

export default function ModulePlayer({ moduleId, onExit }: { moduleId: string; onExit: () => void }) {
  const m = moduleById(moduleId);
  const rate = useAppState((s) => s.settings.speakRate);

  const { steps, warmups } = useMemo(() => {
    if (!m) return { steps: [] as Step[], warmups: 0 };
    const w = warmUpSteps(m, Date.now());
    return { steps: [...w, ...coreSteps(m)], warmups: w.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const recorded = useRef(false);

  const done = i >= steps.length;
  const step: Step | undefined = steps[i];

  useEffect(() => {
    if (step && (step.kind === "teach" || step.kind === "listen")) tts.speak(step.phrase.te, { rate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const totalChecks = steps.filter((s) => s.kind !== "teach" && s.kind !== "primer").length;
  const pct = totalChecks ? Math.round((correct / totalChecks) * 100) : 100;

  useEffect(() => {
    if (done && !recorded.current) {
      recorded.current = true;
      recordModuleResult(moduleId, pct, Date.now());
    }
  }, [done, moduleId, pct]);

  function advance() {
    setI((n) => n + 1);
  }
  function finishCheck(phrase: Phrase, isCorrect: boolean) {
    gradePhrase(phrase.id, isCorrect ? 4 : 0, Date.now());
    if (isCorrect) setCorrect((c) => c + 1);
    advance();
  }

  if (!m) return null;

  // ── Results ────────────────────────────────────────────────────────────────
  if (done) {
    const passed = pct >= 80;
    return <Results m={m} correct={correct} total={totalChecks} pct={pct} passed={passed} onExit={onExit} onRedo={() => { recorded.current = false; setCorrect(0); setI(0); }} />;
  }

  const progressPct = Math.round((i / steps.length) * 100);
  const inWarmup = i < warmups;

  return (
    <div>
      {/* Top bar: exit + progress */}
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="rounded-full p-1 text-duo-hare transition hover:text-duo-wolf active:scale-90" aria-label="Exit">
          <X size={26} strokeWidth={3} />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-duo-swan">
          <div className="h-full rounded-full bg-duo-blue transition-all duration-300" style={{ width: `${Math.max(progressPct, 4)}%` }} />
        </div>
      </div>

      {inWarmup && (
        <div className="mt-3 rounded-full bg-duo-yellow/20 px-3 py-1.5 text-center text-xs font-extrabold uppercase tracking-wide text-duo-yellowDark">
          Warm-up · quick review
        </div>
      )}

      <div className="pb-40 pt-6">
        {step?.kind === "primer" && <PrimerStep onNext={advance} />}
        {step?.kind === "teach" && <TeachStep key={i} phrase={step.phrase} onNext={advance} />}
        {step?.kind === "listen" && <ListenStep key={i} phrase={step.phrase} options={step.options} onDone={(c) => finishCheck(step.phrase, c)} />}
        {step?.kind === "speak" && <SpeakStep key={i} phrase={step.phrase} onDone={(c) => finishCheck(step.phrase, c)} />}
        {step?.kind === "build" && <BuildStep key={i} phrase={step.phrase} tiles={step.tiles} answer={step.answer} onDone={(c) => finishCheck(step.phrase, c)} />}
      </div>
    </div>
  );
}

// ── Results ──────────────────────────────────────────────────────────────────
function Results({ m, correct, total, pct, passed, onExit, onRedo }: { m: CourseModule; correct: number; total: number; pct: number; passed: boolean; onExit: () => void; onRedo: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <MascotResult passed={passed} isPrimer={m.kind === "primer"} />
      <h2 className="text-2xl font-black text-duo-eel">{m.title} — done!</h2>
      {total > 0 && (
        <div className="text-lg font-extrabold text-duo-wolf">
          <span className="text-duo-green">{correct}</span> / {total} checks ·{" "}
          <span className={passed ? "text-duo-correctInk" : "text-duo-yellowDark"}>{pct}%</span>
        </div>
      )}
      <p className="max-w-sm text-sm font-semibold text-duo-wolf">
        {m.kind === "primer"
          ? "Now start Module 1 — you'll build up from here, phrase by phrase."
          : passed
          ? "Nicely done. These phrases resurface as warm-ups later so they stick."
          : "Worth a redo — hitting ~80% is what makes it stick. Misses come back soon as warm-ups."}
      </p>
      <div className="flex flex-col gap-2 pt-2">
        <DuoButton variant="blue" onClick={onExit} className="px-10">Continue</DuoButton>
        {m.kind !== "primer" && (
          <DuoButton variant="ghost" onClick={onRedo}>Redo</DuoButton>
        )}
      </div>
    </div>
  );
}
function MascotResult({ passed, isPrimer }: { passed: boolean; isPrimer: boolean }) {
  return <Penguin size={120} mood={isPrimer || passed ? "cheer" : "happy"} />;
}

// ── Steps ────────────────────────────────────────────────────────────────────

function StepHeading({ text }: { text: string }) {
  return <h2 className="mb-5 text-xl font-extrabold text-duo-eel">{text}</h2>;
}

function PrimerStep({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <Sounds />
      <BottomBar>
        <DuoButton variant="blue" full onClick={onNext}>Start the course</DuoButton>
      </BottomBar>
    </div>
  );
}

function TeachStep({ phrase: p, onNext }: { phrase: Phrase; onNext: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") { e.preventDefault(); onNext(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext]);

  return (
    <div>
      <StepHeading text="New phrase" />
      <div className="rounded-2xl border-2 border-duo-swan bg-white p-6 text-center">
        <div className="text-3xl font-black text-duo-eel">{p.roman}</div>
        <Devanagari te={p.te} className="mt-1 text-xl" />
        <div className="mt-2 text-lg font-bold text-duo-wolf">{p.en}</div>
        {p.literal && <div className="mt-1 text-sm font-semibold text-duo-hare">lit. {p.literal}</div>}
        <div className="mt-4 flex items-center justify-center gap-3">
          <SpeakButton text={p.te} />
          <MicButton targetScript={p.te} onScored={(s) => recordAttempt({ phraseId: p.id, score: s.overall, at: Date.now() })} />
        </div>
        {p.note && <div className="mt-3 rounded-xl bg-duo-polar px-3 py-2 text-sm font-semibold text-duo-wolf">{p.note}</div>}
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-duo-hare">Say it out loud a couple of times, then continue.</p>
      <BottomBar>
        <DuoButton variant="blue" full onClick={onNext}>Continue</DuoButton>
      </BottomBar>
    </div>
  );
}

function ListenStep({ phrase: p, options, onDone }: { phrase: Phrase; options: string[]; onDone: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);

  function doCheck() {
    if (selected == null || checked != null) return;
    setChecked(options[selected] === p.en);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (checked != null) {
        if (e.key === "Enter") { e.preventDefault(); onDone(checked); }
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) { e.preventDefault(); setSelected(n - 1); }
      else if (e.key === "Enter") { e.preventDefault(); doCheck(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div>
      <StepHeading text="What does this mean?" />
      <div className="mb-5 flex items-center justify-center rounded-2xl border-2 border-duo-swan bg-white py-6">
        <SpeakButton text={p.te} />
      </div>

      <div className="grid gap-3">
        {options.map((opt, idx) => {
          const isAnswer = opt === p.en;
          const chosen = idx === selected;
          let cls = "border-duo-swan bg-white text-duo-eel hover:bg-duo-polar";
          if (checked != null) {
            if (isAnswer) cls = "border-duo-green bg-duo-correctBg text-duo-correctInk";
            else if (chosen) cls = "border-duo-red bg-duo-wrongBg text-duo-wrongInk";
            else cls = "border-duo-swan bg-white text-duo-hare";
          } else if (chosen) {
            cls = "border-duo-blue bg-duo-blue/10 text-duo-blue";
          }
          return (
            <button
              key={opt}
              disabled={checked != null}
              onClick={() => setSelected(idx)}
              className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-bold transition active:translate-y-[2px] active:border-b-2 ${cls}`}
            >
              <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-current text-xs sm:flex">{idx + 1}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {checked == null ? (
        <BottomBar>
          <DuoButton variant="blue" full disabled={selected == null} onClick={doCheck}>Check</DuoButton>
        </BottomBar>
      ) : (
        <ResultBar
          correct={checked}
          title={checked ? "Nicely done!" : "Correct answer:"}
          detail={checked ? p.note : <><span className="font-black">{p.roman}</span> — {p.en}{p.note ? ` · ${p.note}` : ""}</>}
          onContinue={() => onDone(checked)}
        />
      )}
    </div>
  );
}

function SpeakStep({ phrase: p, onDone }: { phrase: Phrase; onDone: (correct: boolean) => void }) {
  const [typed, setTyped] = useState("");
  const [verdict, setVerdict] = useState<null | { correct: boolean; heard?: string }>(null);

  function submitTyped() {
    if (!typed.trim() || verdict) return;
    setVerdict({ correct: romanMatches(typed, p.roman) });
  }

  return (
    <div>
      <StepHeading text="Say it in Telugu" />
      <div className="rounded-2xl border-2 border-duo-swan bg-white p-6 text-center">
        <div className="text-2xl font-black text-duo-eel">{p.en}</div>

        {!verdict ? (
          <form onSubmit={(e) => { e.preventDefault(); submitTyped(); }} className="mt-5 flex flex-col gap-3">
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="type it (e.g. etla unnav)"
              className="rounded-2xl border-2 border-duo-swan bg-white px-4 py-3 text-center text-lg font-bold text-duo-eel placeholder:text-duo-hare focus:border-duo-blue focus:outline-none"
            />
            {stt.available() && (
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-duo-hare">
                <span>or say it aloud:</span>
                <MicButton
                  targetScript={p.te}
                  onScored={(s) => {
                    recordAttempt({ phraseId: p.id, score: s.overall, at: Date.now() });
                    setVerdict({ correct: s.overall >= 70, heard: s.heardText });
                  }}
                />
              </div>
            )}
            <button type="button" onClick={() => setVerdict({ correct: false })} className="text-xs font-bold text-duo-hare underline hover:text-duo-wolf">
              I don't know — show me
            </button>
          </form>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="text-2xl font-black text-duo-green">{p.roman}</div>
            <Devanagari te={p.te} className="text-xl" />
            <div className="flex items-center justify-center gap-3">
              <SpeakButton text={p.te} />
              <MicButton targetScript={p.te} onScored={(s) => recordAttempt({ phraseId: p.id, score: s.overall, at: Date.now() })} />
            </div>
            {p.note && <div className="text-sm font-semibold text-duo-wolf">{p.note}</div>}
          </div>
        )}
      </div>

      {!verdict ? (
        <BottomBar>
          <DuoButton variant="blue" full disabled={!typed.trim()} onClick={submitTyped}>Check</DuoButton>
        </BottomBar>
      ) : (
        <ResultBar
          correct={verdict.correct}
          title={verdict.correct ? "Nailed it!" : "Here it is:"}
          detail={verdict.heard ? `heard “${verdict.heard}”` : verdict.correct ? undefined : `${p.roman} — ${p.en}`}
          onContinue={() => onDone(verdict.correct)}
        />
      )}
    </div>
  );
}

function BuildStep({ phrase: p, tiles, answer, onDone }: { phrase: Phrase; tiles: string[]; answer: string[]; onDone: (correct: boolean) => void }) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const placedSet = new Set(placed);
  const correct = useMemo(
    () => placed.map((idx) => tiles[idx]).join(" ").toLowerCase() === answer.join(" ").toLowerCase(),
    [placed, tiles, answer]
  );

  return (
    <div>
      <StepHeading text="Build the sentence" />
      <div className="mb-4 rounded-2xl border-2 border-duo-swan bg-white p-4 text-center text-lg font-black text-duo-eel">{p.en}</div>

      {/* Answer line */}
      <div className="mb-4 flex min-h-[3.25rem] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-duo-swan bg-duo-polar p-3">
        {placed.length === 0 && <span className="text-sm font-semibold text-duo-hare">tap the words below…</span>}
        {placed.map((idx, pos) => (
          <button
            key={pos}
            disabled={checked != null}
            onClick={() => setPlaced((arr) => arr.filter((_, k) => k !== pos))}
            className="rounded-xl border-2 border-b-4 border-duo-swan bg-white px-3 py-1.5 font-bold text-duo-eel active:translate-y-[2px] active:border-b-2"
          >
            {tiles[idx]}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {tiles.map((t, idx) => (
          <button
            key={idx}
            disabled={placedSet.has(idx) || checked != null}
            onClick={() => setPlaced((arr) => [...arr, idx])}
            className={`rounded-xl border-2 border-b-4 px-3 py-1.5 font-bold transition active:translate-y-[2px] active:border-b-2 ${
              placedSet.has(idx) ? "border-duo-swan bg-duo-polar text-duo-polar" : "border-duo-swan bg-white text-duo-eel hover:bg-duo-polar"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {checked == null ? (
        <BottomBar>
          <DuoButton variant="blue" full disabled={placed.length === 0} onClick={() => setChecked(correct)}>Check</DuoButton>
        </BottomBar>
      ) : (
        <ResultBar
          correct={checked}
          title={checked ? "Correct!" : "Correct answer:"}
          detail={<><span className="font-black">{p.roman}</span>{p.note ? ` · ${p.note}` : ""}</>}
          onContinue={() => onDone(checked)}
        />
      )}
    </div>
  );
}
