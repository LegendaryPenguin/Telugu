import { useEffect, useMemo, useState } from "react";
import { allPhrases } from "../content";
import type { Phrase } from "../content/types";
import { tts } from "../speech";
import { getState, bumpStreak } from "../store";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Q {
  phrase: Phrase;
  options: string[]; // English options
}

function buildQuiz(pool: Phrase[], n: number): Q[] {
  const picks = shuffle(pool).slice(0, Math.min(n, pool.length));
  return picks.map((phrase) => {
    const distractors = shuffle(pool.filter((p) => p.id !== phrase.id))
      .slice(0, 3)
      .map((p) => p.en);
    return { phrase, options: shuffle([phrase.en, ...distractors]) };
  });
}

export default function Quiz() {
  const pool = useMemo(() => allPhrases(), []);
  const [quiz, setQuiz] = useState<Q[]>(() => buildQuiz(pool, 8));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  function choosePick(q: Q, opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === q.phrase.en) setScore((s) => s + 1);
    bumpStreak(Date.now());
  }
  function advance() {
    setPicked(null);
    setIdx((i) => i + 1);
  }

  // Keyboard: 1–4 to pick, Enter/Space to advance. Scoped to this screen.
  useEffect(() => {
    if (idx >= quiz.length) return;
    const q = quiz[idx];
    function onKey(e: KeyboardEvent) {
      if (!picked) {
        const n = Number(e.key);
        if (n >= 1 && n <= q.options.length) {
          e.preventDefault();
          choosePick(q, q.options[n - 1]);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, picked, quiz]);

  // Auto-play the prompt on each new question — it's a listening test.
  useEffect(() => {
    if (idx < quiz.length) tts.speak(quiz[idx].phrase.te, { rate: getState().settings.speakRate });
  }, [idx, quiz]);

  if (pool.length < 4) {
    return <div className="rounded-xl bg-slate-800/60 p-6 text-slate-300">Add a few more phrases first.</div>;
  }

  if (idx >= quiz.length) {
    return (
      <div className="rounded-xl bg-slate-800/60 p-6 text-center">
        <div className="text-2xl font-bold text-white">
          {score} / {quiz.length}
        </div>
        <p className="mt-2 text-slate-300">
          {score === quiz.length ? "Perfect ear! 👂" : "Keep listening — replay the ones you missed in the phrasebook."}
        </p>
        <button
          onClick={() => {
            setQuiz(buildQuiz(pool, 8));
            setIdx(0);
            setScore(0);
            setPicked(null);
          }}
          className="mt-4 rounded-full bg-teal-600 px-5 py-2 font-medium text-white transition hover:bg-teal-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          Again
        </button>
      </div>
    );
  }

  const q = quiz[idx];

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-400">
        Question {idx + 1} of {quiz.length}
      </div>
      <div className="rounded-2xl bg-slate-800/60 p-6 text-center">
        <p className="text-slate-300">Listen and pick the meaning:</p>
        <button
          onClick={() => tts.speak(q.phrase.te, { rate: getState().settings.speakRate })}
          className="mx-auto mt-4 block rounded-full bg-teal-600 px-6 py-3 text-lg font-medium text-white transition hover:bg-teal-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        >
          ▶ Play again
        </button>
      </div>

      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = opt === q.phrase.en;
          const show = picked != null;
          return (
            <button
              key={opt}
              onClick={() => choosePick(q, opt)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                show
                  ? isCorrect
                    ? "bg-emerald-700 text-white"
                    : opt === picked
                    ? "bg-rose-700 text-white"
                    : "bg-slate-800 text-slate-400"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              <span className="hidden h-5 w-5 shrink-0 items-center justify-center rounded bg-black/20 text-xs text-slate-300 sm:flex">
                {i + 1}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="flex items-center justify-between">
          <div className="text-slate-300">
            Answer: <span className="font-semibold text-teal-300">{q.phrase.roman}</span>
          </div>
          <button
            onClick={advance}
            className="rounded-full bg-teal-600 px-5 py-2 font-medium text-white transition hover:bg-teal-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
