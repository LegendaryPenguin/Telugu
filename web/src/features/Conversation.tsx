import { useEffect, useRef, useState } from "react";
import { chat, llmHealth, type ChatMessage } from "../llm";
import { tts, stt } from "../speech";
import { getState } from "../store";
import { telanganaStyleGuide } from "../content/dialect";
import { DuoButton } from "../ui/duo";

// The model is asked to answer as strict JSON so we can (a) drive TTS from the
// Telugu script and (b) show romanization + a gentle correction.
interface Turn {
  te: string;
  roman: string;
  en: string;
  correction?: string;
}

const PERSONAS = [
  { id: "gf", label: "Girlfriend (sweet)", desc: "warm, affectionate, casual" },
  { id: "friend", label: "Friend (chill)", desc: "relaxed buddy, jokes around" },
  { id: "shop", label: "Shopkeeper", desc: "practical, transactional" }
];

// Guided role-plays. Picking one sets the scene and has the partner open.
const SCENARIOS = [
  { id: "morning", label: "☀️ Good-morning text", scene: "It's morning. You are texting each other good morning, sweetly and casually." },
  { id: "plandate", label: "📅 Plan a date", scene: "You are planning where to go this weekend — suggest a plan and settle the details." },
  { id: "missed", label: "🥺 You missed each other", scene: "You haven't talked all day and both missed each other; be affectionate." },
  { id: "comfort", label: "💛 She had a bad day", scene: "She had a rough day. Comfort her gently and ask what happened." },
  { id: "food", label: "🍜 Deciding what to eat", scene: "You're deciding what to eat together tonight; go back and forth on options." }
];

function systemPrompt(personaDesc: string, scene?: string): string {
  return [
    "You are a native speaker of TELANGANA-dialect Telugu helping someone learn to SPEAK Telugu",
    "so they can talk with their girlfriend. Right now you are role-playing as their conversation",
    `partner with this personality: ${personaDesc}.`,
    scene ? `Scene: ${scene}` : "",
    "",
    telanganaStyleGuide(),
    "",
    "Also:",
    "- Keep each reply SHORT (1–2 sentences) so it's easy to respond to.",
    "- If the learner made a mistake in their Telugu, add a brief, kind correction. If they did well, praise briefly.",
    "",
    "Respond with ONLY a JSON object, no other text, in exactly this shape:",
    '{"te":"<your reply in Telugu script>","roman":"<romanization>","en":"<English meaning>","correction":"<short tip on their message, or empty>"}'
  ].join("\n");
}

export default function Conversation() {
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [turns, setTurns] = useState<{ who: "you" | "them"; text: string; turn?: Turn }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [health, setHealth] = useState<{ ok: boolean; provider?: string } | null>(null);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    llmHealth().then(setHealth);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  function parseTurn(raw: string): Turn {
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      const obj = JSON.parse(match ? match[0] : raw);
      return { te: obj.te ?? "", roman: obj.roman ?? "", en: obj.en ?? "", correction: obj.correction || undefined };
    } catch {
      return { te: "", roman: raw, en: "" };
    }
  }

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", content: text };
    const nextHistory: ChatMessage[] =
      history.length === 0
        ? [{ role: "system", content: systemPrompt(persona.desc) }, userMsg]
        : [...history, userMsg];

    setTurns((t) => [...t, { who: "you", text }]);
    setHistory(nextHistory);
    setBusy(true);
    try {
      const reply = await chat(nextHistory);
      const turn = parseTurn(reply.content);
      setHistory((h) => [...h, { role: "assistant", content: reply.content }]);
      setTurns((t) => [...t, { who: "them", text: turn.roman, turn }]);
      if (turn.te) tts.speak(turn.te, { rate: getState().settings.speakRate });
    } catch (e: any) {
      setTurns((t) => [...t, { who: "them", text: `⚠️ ${e?.message ?? "error"}` }]);
    } finally {
      setBusy(false);
    }
  }

  async function startScenario(scene: string) {
    if (busy) return;
    setTurns([]);
    setBusy(true);
    // Kickoff turn is kept in history for context but not rendered as a bubble.
    const sys: ChatMessage = { role: "system", content: systemPrompt(persona.desc, scene) };
    const kickoff: ChatMessage = {
      role: "user",
      content: "(Open the conversation with a short, natural first line that fits the scene.)"
    };
    const base = [sys, kickoff];
    setHistory(base);
    try {
      const reply = await chat(base);
      const turn = parseTurn(reply.content);
      setHistory((h) => [...h, { role: "assistant", content: reply.content }]);
      setTurns([{ who: "them", text: turn.roman, turn }]);
      if (turn.te) tts.speak(turn.te, { rate: getState().settings.speakRate });
    } catch (e: any) {
      setTurns([{ who: "them", text: `⚠️ ${e?.message ?? "error"}` }]);
    } finally {
      setBusy(false);
    }
  }

  async function speakInput() {
    if (!stt.available()) return;
    setListening(true);
    try {
      // Reuse the recognizer to capture the user's Telugu; we don't score here,
      // just transcribe and send it into the conversation.
      const result = await stt.scoreAttempt("");
      if (result.heardText) send(result.heardText);
    } catch {
      /* ignore */
    } finally {
      setListening(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {health && !health.ok && (
        <div className="rounded-2xl border-2 border-duo-swan bg-duo-polar p-3 text-sm font-semibold text-duo-wolf">
          Conversation needs the local server running with an LLM key. Quickest free option: a{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="font-bold text-duo-blue underline">
            Gemini API key
          </a>{" "}
          in <code>server/.env</code> (no card needed). See <code>server/README.md</code>. The rest of the app works
          without it.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setPersona(p);
              setHistory([]);
              setTurns([]);
            }}
            className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${
              persona.id === p.id
                ? "border-duo-blue bg-duo-blue text-white"
                : "border-duo-swan bg-white text-duo-wolf hover:bg-duo-polar"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => startScenario(sc.scene)}
            disabled={busy}
            className="rounded-full border-2 border-duo-swan bg-white px-3 py-1.5 text-xs font-bold text-duo-wolf transition hover:bg-duo-polar disabled:opacity-40"
            title="Start a guided role-play"
          >
            {sc.label}
          </button>
        ))}
      </div>

      <div className="min-h-[240px] max-h-[50vh] space-y-3 overflow-y-auto rounded-2xl border-2 border-duo-swan bg-duo-polar p-4">
        {turns.length === 0 && (
          <p className="mt-8 text-center font-semibold text-duo-hare">
            Say hi to start. Type in romanized Telugu (or English), or tap the mic. They'll reply in Telugu with
            audio + meaning.
          </p>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.who === "you" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                t.who === "you" ? "bg-duo-blue text-white" : "border-2 border-duo-swan bg-white text-duo-eel"
              }`}
            >
              <div className="font-bold">{t.text}</div>
              {t.turn && (
                <>
                  {t.turn.en && <div className={`mt-1 text-sm font-semibold ${t.who === "you" ? "text-white/80" : "text-duo-wolf"}`}>{t.turn.en}</div>}
                  {t.turn.te && (
                    <button
                      onClick={() => tts.speak(t.turn!.te, { rate: getState().settings.speakRate })}
                      className={`mt-1 text-xs font-bold hover:underline ${t.who === "you" ? "text-white/90" : "text-duo-blue"}`}
                    >
                      ▶ replay
                    </button>
                  )}
                  {t.turn.correction && (
                    <div className="mt-2 rounded-xl bg-duo-yellow/20 px-2 py-1 text-xs font-bold text-duo-yellowDark">
                      💡 {t.turn.correction}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="text-sm font-semibold text-duo-hare">…typing</div>}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={speakInput}
          disabled={!stt.available() || listening}
          className={`rounded-full px-3 py-2 text-lg text-white transition ${listening ? "animate-pulse bg-duo-red" : "bg-duo-blue hover:brightness-105"} disabled:opacity-40`}
          title={stt.available() ? "Speak" : "Speech input needs Chrome"}
        >
          🎙
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Type in romanized Telugu or English…"
          className="flex-1 rounded-full border-2 border-duo-swan bg-white px-4 py-2 font-semibold text-duo-eel placeholder:text-duo-hare focus:border-duo-blue focus:outline-none"
        />
        <DuoButton variant="blue" onClick={() => send(input)} disabled={busy}>
          Send
        </DuoButton>
      </div>
    </div>
  );
}
