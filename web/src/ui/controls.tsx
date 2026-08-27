import { useState } from "react";
import { tts, stt } from "../speech";
import type { PronunciationScore } from "../speech";
import { useAppState } from "../store";
import { scoreBand } from "../speech/similarity";
import { toDevanagari } from "../content/devanagari";

// Devanagari reading of a Telugu phrase — a precise pronunciation aid for anyone
// who reads Hindi. Hidden when the setting is off.
export function Devanagari({ te, className = "" }: { te: string; className?: string }) {
  const on = useAppState((s) => s.settings.showDevanagari);
  if (!on) return null;
  return (
    <div lang="hi" title="Read it like Hindi" className={`text-amber-200/90 ${className}`}>
      {toDevanagari(te)}
    </div>
  );
}

// ── Play a phrase (with an optional slow toggle) ────────────────────────────
export function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const [speaking, setSpeaking] = useState(false);
  // Subscribe to the rate so the speed slider takes effect immediately.
  const rate = useAppState((s) => s.settings.speakRate);
  return (
    <span className={`inline-flex gap-1 ${className}`}>
      <button
        onClick={() => {
          setSpeaking(true);
          tts.speak(text, { rate, onEnd: () => setSpeaking(false) });
        }}
        className={`rounded-full bg-teal-600 hover:bg-teal-500 px-3 py-1.5 text-sm font-medium text-white transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 ${
          speaking ? "animate-pulse" : ""
        }`}
        aria-label="Play audio"
      >
        {/* Label stays fixed width — only the icon pulses — so the row never reflows. */}
        ▶ Listen
      </button>
      <button
        onClick={() => tts.speak(text, { rate: 0.55 })}
        className="rounded-full bg-slate-700 hover:bg-slate-600 px-3 py-1.5 text-sm text-slate-200 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        aria-label="Play slowly"
        title="Play slowly"
      >
        🐢
      </button>
    </span>
  );
}

// ── Record an attempt and show a pronunciation score ────────────────────────
export function MicButton({
  targetScript,
  onScored
}: {
  targetScript: string;
  onScored?: (s: PronunciationScore) => void;
}) {
  const [state, setState] = useState<"idle" | "listening" | "error">("idle");
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [err, setErr] = useState<string>("");

  async function record() {
    if (!stt.available()) {
      setState("error");
      setErr("Speech recognition isn't supported in this browser. Try Chrome.");
      return;
    }
    setState("listening");
    setScore(null);
    setErr("");
    try {
      const result = await stt.scoreAttempt(targetScript);
      setScore(result);
      setState("idle");
      onScored?.(result);
    } catch (e: any) {
      setState("error");
      setErr(
        e?.message === "no-speech"
          ? "Didn't catch that — try speaking a little louder."
          : `Couldn't score that (${e?.message ?? "error"}).`
      );
    }
  }

  const band = score ? scoreBand(score.overall) : null;

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={record}
        disabled={state === "listening"}
        className={`rounded-full px-4 py-1.5 text-sm font-medium text-white transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
          state === "listening" ? "bg-rose-600 animate-pulse" : "bg-indigo-600 hover:bg-indigo-500"
        }`}
      >
        {state === "listening" ? "🎙 Listening…" : "🎙 Say it"}
      </button>
      {score && band && (
        <div className="text-sm">
          <span className={`font-semibold ${band.color}`}>
            {score.overall}/100 · {band.label}
          </span>
          {score.heardText && (
            <span className="text-slate-400"> — heard: “{score.heardText}”</span>
          )}
        </div>
      )}
      {state === "error" && <div className="text-sm text-rose-400">{err}</div>}
    </div>
  );
}
