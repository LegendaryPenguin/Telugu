import { useState } from "react";
import { DECKS } from "../content";
import type { Deck, Phrase } from "../content/types";
import { SpeakButton, MicButton, Devanagari } from "../ui/controls";
import { recordAttempt, useAppState, removeCustomPhrase } from "../store";
import type { CustomPhrase } from "../store";

function PhraseRow({ p, onDelete }: { p: Phrase; onDelete?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-slate-800/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-white">{p.roman}</div>
          <Devanagari te={p.te} />
          <div className="text-slate-300">{p.en}</div>
        </div>
        <SpeakButton text={p.te} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <MicButton
          targetScript={p.te}
          onScored={(s) => recordAttempt({ phraseId: p.id, score: s.overall, at: Date.now() })}
        />
        {(p.literal || p.note) && (
          <button onClick={() => setOpen((o) => !o)} className="text-sm text-teal-400 hover:underline">
            {open ? "hide notes" : "notes"}
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="text-sm text-rose-400 hover:underline">
            remove
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 space-y-1 text-sm text-slate-400">
          {p.literal && (
            <div>
              <span className="text-slate-500">literal:</span> {p.literal}
            </div>
          )}
          {p.note && <div>{p.note}</div>}
        </div>
      )}
    </div>
  );
}

function DeckView({ deck }: { deck: Deck }) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-bold text-white">{deck.title}</h2>
        <p className="text-slate-400">{deck.description}</p>
      </div>
      {deck.phrases.map((p) => (
        <PhraseRow key={p.id} p={p} />
      ))}
    </div>
  );
}

export default function Phrasebook() {
  const custom = useAppState((s) => s.custom) as CustomPhrase[];
  const [active, setActive] = useState<string>(DECKS[0].id);
  const activeDeck = DECKS.find((d) => d.id === active);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {DECKS.map((d) => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              active === d.id ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {d.title}
          </button>
        ))}
        {custom.length > 0 && (
          <button
            onClick={() => setActive("custom")}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              active === "custom" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            My phrases ({custom.length})
          </button>
        )}
      </div>

      {active === "custom" ? (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white">My phrases</h2>
          {custom.map((p) => (
            <PhraseRow key={p.id} p={p} onDelete={() => removeCustomPhrase(p.id)} />
          ))}
        </div>
      ) : (
        activeDeck && <DeckView deck={activeDeck} />
      )}
    </div>
  );
}
