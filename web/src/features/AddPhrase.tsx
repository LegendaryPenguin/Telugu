import { useState } from "react";
import { chat } from "../llm";
import { addCustomPhrase } from "../store";
import { SpeakButton } from "../ui/controls";
import { telanganaStyleGuide, TELANGANA_RULES } from "../content/dialect";

interface Generated {
  te: string;
  roman: string;
  en: string;
  note?: string;
  words?: { roman: string; meaning: string }[]; // subtitle breakdown
}

const GEN_SYSTEM =
  "You translate into natural, casual, spoken TELANGANA-dialect Telugu for a learner who cannot read Telugu script.\n\n" +
  telanganaStyleGuide() +
  "\n\nRespond with ONLY a JSON object: " +
  '{"te":"<Telugu script>","roman":"<romanization>","en":"<English meaning>","note":"<short usage/Telangana tip or empty>"}';

export default function AddPhrase() {
  const [mode, setMode] = useState<"say" | "decode" | "subtitle">("say");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Generated | null>(null);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  async function go() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setErr("");
    setResult(null);
    setSaved(false);
    let prompt: string;
    let system = GEN_SYSTEM;
    if (mode === "say") {
      prompt = `The learner wants to say this to their girlfriend: "${text}". Give the Telangana Telugu.`;
    } else if (mode === "decode") {
      prompt =
        `The learner heard/read this Telugu (possibly romanized) and wants to understand it: "${text}". ` +
        `Fill "te" with the Telugu script, "roman" with clean romanization, "en" with the meaning, and "note" with any nuance.`;
    } else {
      // subtitle breakdown — for learning from movies/songs
      system =
        "You help a learner understand a line of Telugu from a movie or song, word by word. " +
        "Films often use Telangana or other dialects — flag dialect/slang in the note.\n\n" +
        TELANGANA_RULES +
        '\n\nRespond with ONLY a JSON object: {"te":"<Telugu script>","roman":"<full romanization>",' +
        '"en":"<full meaning>","words":[{"roman":"<word>","meaning":"<its meaning>"}],"note":"<slang/nuance or empty>"}';
      prompt = `Break down this Telugu line for a learner: "${text}".`;
    }
    try {
      const reply = await chat([
        { role: "system", content: system },
        { role: "user", content: prompt }
      ]);
      const match = reply.content.match(/\{[\s\S]*\}/);
      const obj = JSON.parse(match ? match[0] : reply.content);
      setResult({
        te: obj.te ?? "",
        roman: obj.roman ?? "",
        en: obj.en ?? "",
        note: obj.note || undefined,
        words: Array.isArray(obj.words) ? obj.words : undefined
      });
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong. Is the server running with an LLM key?");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!result) return;
    addCustomPhrase(
      {
        id: `custom-${Date.now()}`,
        te: result.te,
        roman: result.roman,
        en: result.en,
        note: result.note
      },
      Date.now()
    );
    setSaved(true);
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-400">
        This is what makes it <em>your</em> app: build phrases from your real life. They get added to your phrasebook and
        show up in review, quiz, and shadowing.
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setMode("say")}
          className={`rounded-full px-3 py-1.5 text-sm ${mode === "say" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          I want to say…
        </button>
        <button
          onClick={() => setMode("decode")}
          className={`rounded-full px-3 py-1.5 text-sm ${mode === "decode" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          What does this mean?
        </button>
        <button
          onClick={() => setMode("subtitle")}
          className={`rounded-full px-3 py-1.5 text-sm ${mode === "subtitle" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          🎬 Break down a subtitle
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder={
            mode === "say"
              ? "e.g. I really missed you today"
              : mode === "decode"
              ? "e.g. em chestunnav"
              : "paste a line from a movie/song, e.g. nuvvu leni jeevitham"
          }
          className="flex-1 rounded-full bg-slate-800 px-4 py-2 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-teal-600"
        />
        <button
          onClick={go}
          disabled={busy}
          className="rounded-full bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-500 disabled:opacity-40"
        >
          {busy ? "…" : "Go"}
        </button>
      </div>

      {err && <div className="text-sm text-rose-400">{err}</div>}

      {result && (
        <div className="rounded-2xl bg-slate-800/60 p-5 space-y-3">
          <div className="text-2xl font-bold text-teal-300">{result.roman}</div>
          <div className="text-slate-300">{result.en}</div>
          {result.words && result.words.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.words.map((w, i) => (
                <span key={i} className="rounded-lg bg-slate-900/60 px-2 py-1 text-sm">
                  <span className="font-medium text-teal-300">{w.roman}</span>
                  <span className="text-slate-400"> = {w.meaning}</span>
                </span>
              ))}
            </div>
          )}
          {result.note && <div className="text-sm text-slate-400">{result.note}</div>}
          <div className="flex items-center gap-3">
            <SpeakButton text={result.te} />
            <button
              onClick={save}
              disabled={saved}
              className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {saved ? "✓ Saved to phrasebook" : "＋ Save to phrasebook"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
