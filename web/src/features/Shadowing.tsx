import { useMemo, useState } from "react";
import { allPhrases } from "../content";
import { SpeakButton, MicButton, Devanagari } from "../ui/controls";
import { recordAttempt, bestScoreFor, useAppState } from "../store";
import { scoreBand } from "../speech/similarity";

export default function Shadowing() {
  useAppState((s) => s.attempts);
  const pool = useMemo(() => allPhrases(), []);
  const [idx, setIdx] = useState(0);
  const p = pool[idx];

  if (!p) return <div className="text-slate-300">No phrases yet.</div>;

  const best = bestScoreFor(p.id);
  const band = best != null ? scoreBand(best) : null;

  return (
    <div className="space-y-4">
      <p className="text-slate-400">
        Listen to the native line, then repeat it out loud. You'll get a score for how close you got.
      </p>

      <div className="rounded-2xl bg-slate-800/60 p-6 text-center space-y-4">
        <div className="text-2xl font-bold text-white">{p.roman}</div>
        <Devanagari te={p.te} className="text-xl text-center" />
        <div className="text-slate-300">{p.en}</div>

        <div className="flex items-center justify-center">
          <SpeakButton text={p.te} />
        </div>

        <div className="flex items-center justify-center">
          <MicButton
            targetScript={p.te}
            onScored={(s) => recordAttempt({ phraseId: p.id, score: s.overall, at: Date.now() })}
          />
        </div>

        {best != null && band && (
          <div className="text-sm text-slate-400">
            Your best: <span className={`font-semibold ${band.color}`}>{best}/100</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="rounded-full bg-slate-800 px-4 py-2 text-slate-200 disabled:opacity-40 hover:bg-slate-700"
        >
          ← Prev
        </button>
        <div className="text-sm text-slate-500">
          {idx + 1} / {pool.length}
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(pool.length - 1, i + 1))}
          disabled={idx === pool.length - 1}
          className="rounded-full bg-slate-800 px-4 py-2 text-slate-200 disabled:opacity-40 hover:bg-slate-700"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
