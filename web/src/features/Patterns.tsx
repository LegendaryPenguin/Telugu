import { useState } from "react";
import { PATTERNS } from "../content/patterns";
import { SpeakButton, MicButton } from "../ui/controls";

export default function Patterns() {
  const [idx, setIdx] = useState(0);
  const p = PATTERNS[idx];

  return (
    <div className="space-y-4">
      <p className="text-slate-400">
        Learn the rule once, make endless sentences. These are the patterns spoken Telangana Telugu leans on most.
      </p>

      <div className="flex flex-wrap gap-2">
        {PATTERNS.map((pat, i) => (
          <button
            key={pat.id}
            onClick={() => setIdx(i)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              i === idx ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {pat.title}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-800/60 p-5 space-y-4">
        <div>
          <div className="text-sm uppercase tracking-wide text-teal-400">Pattern</div>
          <div className="mt-1 font-mono text-xl text-white">{p.formula}</div>
        </div>
        <p className="text-slate-300">{p.explain}</p>

        <div className="space-y-2">
          {p.examples.map((ex, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/50 px-4 py-2">
              <div className="min-w-0">
                <div className="font-semibold text-white">{ex.roman}</div>
                <div className="text-sm text-slate-400">{ex.en}</div>
              </div>
              <SpeakButton text={ex.te} />
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-indigo-900/30 border border-indigo-800 p-3">
          <div className="text-sm font-medium text-indigo-200">🎯 Your turn</div>
          <div className="mt-1 text-slate-200">{p.yourTurn}</div>
          <div className="mt-2">
            {/* Score the attempt against the first example as a loose target. */}
            <MicButton targetScript={p.examples[0].te} />
          </div>
        </div>
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
          {idx + 1} / {PATTERNS.length}
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(PATTERNS.length - 1, i + 1))}
          disabled={idx === PATTERNS.length - 1}
          className="rounded-full bg-slate-800 px-4 py-2 text-slate-200 disabled:opacity-40 hover:bg-slate-700"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
