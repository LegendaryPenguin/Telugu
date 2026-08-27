import { CINEMA_LADDER, RESOURCES } from "../content/resources";

const KIND_ICON: Record<string, string> = {
  youtube: "▶️",
  dictionary: "📕",
  tool: "🛠️",
  watch: "🎬",
  music: "🎵",
  list: "📋"
};

export default function Watch() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">The road to cinema</h2>
        <p className="text-slate-400">
          Movies are the goal, not the starting line. Here's the order that actually works.
        </p>
      </div>

      <ol className="space-y-2">
        {CINEMA_LADDER.map((s, i) => (
          <li key={i} className="rounded-xl bg-slate-800/60 p-4">
            <div className="font-semibold text-teal-300">{s.step}</div>
            <div className="text-sm text-slate-300">{s.detail}</div>
          </li>
        ))}
      </ol>

      {RESOURCES.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-sm text-slate-400">
          Hand-picked channels, films, and tools are being verified and will appear here.
        </div>
      ) : (
        RESOURCES.map((group) => (
          <div key={group.id}>
            <h3 className="mb-2 font-semibold text-white">{group.title}</h3>
            <div className="space-y-2">
              {group.items.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl bg-slate-800/60 p-3 transition hover:bg-slate-700/60"
                >
                  <div className="flex items-center gap-2">
                    <span>{KIND_ICON[r.kind] ?? "🔗"}</span>
                    <span className="font-medium text-teal-300">{r.title}</span>
                    {r.level && (
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] uppercase text-slate-300">
                        {r.level}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">{r.why}</div>
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
