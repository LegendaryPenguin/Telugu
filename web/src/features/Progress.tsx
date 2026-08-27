import { useAppState, setSpeakRate, setShowDevanagari, setDesiredRetention, exportData, importData } from "../store";
import { allPhrases } from "../content";
import { scoreBand } from "../speech/similarity";
import { toDevanagari } from "../content/devanagari";

function Backup() {
  function download() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "telugu-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((t) => {
      alert(importData(t) ? "Backup restored." : "Couldn't read that backup file.");
    });
  }
  return (
    <div className="rounded-2xl bg-slate-800/60 p-4">
      <h3 className="mb-2 font-semibold text-white">Backup</h3>
      <p className="mb-3 text-sm text-slate-400">
        Progress lives in this browser. Export to move it to another device or keep it safe.
      </p>
      <div className="flex flex-wrap gap-2">
        <button onClick={download} className="rounded-full bg-teal-600 px-4 py-1.5 text-sm text-white hover:bg-teal-500">
          Export
        </button>
        <label className="cursor-pointer rounded-full bg-slate-700 px-4 py-1.5 text-sm text-slate-200 hover:bg-slate-600">
          Import
          <input type="file" accept="application/json" onChange={upload} className="hidden" />
        </label>
      </div>
    </div>
  );
}

function Milestone({
  n,
  title,
  desc,
  pct,
  locked
}: {
  n: number;
  title: string;
  desc: string;
  pct: number;
  locked?: boolean;
}) {
  return (
    <div className={`mb-3 ${locked ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="font-medium text-white">
          {locked ? "🔒 " : ""}
          {n}. {title}
        </div>
        <div className="text-sm text-teal-300">{pct}%</div>
      </div>
      <div className="text-xs text-slate-400">{desc}</div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-800/60 p-4 text-center">
      <div className="text-3xl font-bold text-teal-300">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

export default function Progress() {
  const streak = useAppState((s) => s.streak);
  const cards = useAppState((s) => s.cards);
  const attempts = useAppState((s) => s.attempts);
  const rate = useAppState((s) => s.settings.speakRate);
  const showDev = useAppState((s) => s.settings.showDevanagari);
  const retention = useAppState((s) => s.settings.desiredRetention ?? 0.9);

  const phrases = allPhrases();
  const seen = Object.keys(cards).length;
  const learned = Object.values(cards).filter((c) => c.reps >= 2).length;

  // Best score per phrase → find the weakest handful to nudge practice.
  const bestByPhrase = new Map<string, number>();
  for (const a of attempts) {
    bestByPhrase.set(a.phraseId, Math.max(bestByPhrase.get(a.phraseId) ?? 0, a.score));
  }
  const spokenScores = [...bestByPhrase.values()];
  const avg = spokenScores.length ? Math.round(spokenScores.reduce((x, y) => x + y, 0) / spokenScores.length) : null;

  const weakest = [...bestByPhrase.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([id, score]) => ({ phrase: phrases.find((p) => p.id === id), score }))
    .filter((x) => x.phrase);

  // Rough, motivational readiness estimates for the two milestones.
  const speakReady = Math.min(100, Math.round((learned / 60) * 100));
  const spokenAttempts = attempts.length;
  const cinemaReady = Math.min(
    100,
    Math.round(((seen / Math.max(1, phrases.length)) * 60 + Math.min(spokenAttempts, 40)) / 1)
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-teal-900/40 to-slate-800/60 p-4">
        <h3 className="mb-3 font-semibold text-white">Your pathway</h3>
        <Milestone
          n={1}
          title="Talk with her"
          desc="Hold a casual Telangana conversation."
          pct={speakReady}
        />
        <Milestone
          n={2}
          title="Watch Telugu cinema with subtitles"
          desc="Follow dialogue and pick up new words from film."
          pct={cinemaReady}
          locked={speakReady < 40}
        />
        <p className="mt-2 text-xs text-slate-400">
          Estimates from what you've learned & practiced — they're a nudge, not a grade.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Day streak 🔥" value={streak.count} />
        <Stat label="Phrases started" value={`${seen}/${phrases.length}`} />
        <Stat label="Learned" value={learned} />
        <Stat label="Avg pronunciation" value={avg != null ? `${avg}` : "—"} />
      </div>

      {weakest.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold text-white">Sounds to work on</h3>
          <div className="space-y-2">
            {weakest.map(({ phrase, score }) => {
              const band = scoreBand(score);
              return (
                <div key={phrase!.id} className="flex items-center justify-between rounded-xl bg-slate-800/60 px-4 py-2">
                  <div>
                    <div className="font-medium text-white">{phrase!.roman}</div>
                    <div className="text-sm text-slate-400">{phrase!.en}</div>
                  </div>
                  <div className={`font-semibold ${band.color}`}>{score}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-slate-800/60 p-4">
        <h3 className="mb-2 font-semibold text-white">Playback speed</h3>
        <input
          type="range"
          min={0.5}
          max={1.1}
          step={0.05}
          value={rate}
          onChange={(e) => setSpeakRate(parseFloat(e.target.value))}
          className="w-full accent-teal-500"
        />
        <div className="text-sm text-slate-400">{rate.toFixed(2)}× — lower is slower and clearer for practice.</div>
      </div>

      <div className="rounded-2xl bg-slate-800/60 p-4">
        <h3 className="mb-2 font-semibold text-white">Review strength</h3>
        <input
          type="range"
          min={0.8}
          max={0.95}
          step={0.01}
          value={retention}
          onChange={(e) => setDesiredRetention(parseFloat(e.target.value))}
          className="w-full accent-teal-500"
        />
        <div className="text-sm text-slate-400">
          Target recall {Math.round(retention * 100)}% — higher means more frequent reviews and stronger memory; lower means
          fewer reviews. The scheduler (FSRS) spaces each card to hit this.
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Show Devanagari</h3>
            <p className="text-sm text-slate-400">
              Read phrases like Hindi <span lang="hi" className="text-amber-200/90">{toDevanagari("తెలుగు")}</span> — most
              accurate pronunciation cue if you read Devanagari.
            </p>
          </div>
          <button
            onClick={() => setShowDevanagari(!showDev)}
            className={`h-7 w-12 shrink-0 rounded-full p-0.5 transition ${showDev ? "bg-teal-500" : "bg-slate-600"}`}
            aria-pressed={showDev}
            aria-label="Toggle Devanagari"
          >
            <div className={`h-6 w-6 rounded-full bg-white transition-transform ${showDev ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>

      <Backup />
    </div>
  );
}
