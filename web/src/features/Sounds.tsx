import { useState } from "react";
import { SpeakButton, MicButton } from "../ui/controls";
import { recordAttempt } from "../store";
import { toDevanagari } from "../content/devanagari";
import { COGNATE_GROUPS, HINDI_LOANS } from "../content/cognates";

// A pronunciation primer written for a native HINDI + English speaker. The key
// insight: Hindi already has almost every sound Telugu uses (retroflex vs dental,
// aspiration, vowel length), so a Hindi speaker starts far ahead of an English-only
// learner. We anchor each sound to its Hindi/Devanagari equivalent.

interface Row {
  spelling: string;
  tip: string;
  hindi: string; // the Hindi anchor
  te: string; // example word (drives audio + Devanagari)
  roman: string;
  en: string;
}

const VOWELS: Row[] = [
  { spelling: "a", tip: "short 'uh', like the a in 'sofa'", hindi: "like अ", te: "మనం", roman: "manam", en: "we" },
  { spelling: "aa", tip: "hold it longer — 'aah'", hindi: "like आ (आम)", te: "నాకు", roman: "naaku", en: "to me" },
  { spelling: "i / ee", tip: "short 'i' / long 'ee'", hindi: "इ / ई", te: "రేపు", roman: "repu", en: "tomorrow" },
  { spelling: "u / oo", tip: "short 'u' / long 'oo'", hindi: "उ / ऊ", te: "చూడు", roman: "choodu", en: "look" },
  { spelling: "e / o", tip: "like 'e' in bed / 'o' in go", hindi: "ए / ओ", te: "పో", roman: "po", en: "go" },
  { spelling: "ai", tip: "like the word 'eye'", hindi: "ऐ", te: "ఏమైంది", roman: "emaindi", en: "what happened" }
];

const CONSONANTS: Row[] = [
  { spelling: "ch / j", tip: "like 'church' / 'jam'", hindi: "च / ज", te: "చెప్పు", roman: "cheppu", en: "tell me" },
  {
    spelling: "t · d · n (retroflex)",
    tip: "tongue curled back — the fuller sound you already make in Hindi.",
    hindi: "exactly ट / ड / ण",
    te: "తిన్నవా",
    roman: "tinnava",
    en: "did you eat"
  },
  {
    spelling: "th / dh (dental)",
    tip: "soft t/d with the tongue at the teeth — NOT English 'th'.",
    hindi: "exactly త / द (as in तू, दिल)",
    te: "అర్థమైందా",
    roman: "arthamainda",
    en: "did you understand"
  },
  {
    spelling: "aspirated (kh, gh, bh, …)",
    tip: "a puff of air after the consonant — same as in Hindi.",
    hindi: "ख, घ, भ (भय = fear)",
    te: "భయంగా",
    roman: "bhayamga",
    en: "scared"
  },
  {
    spelling: "double letters (tt, ll, pp)",
    tip: "hold the consonant a beat longer.",
    hindi: "like पक्का, अच्छा",
    te: "మళ్ళీ",
    roman: "malli",
    en: "again"
  },
  { spelling: "r", tip: "a light tapped/rolled r", hindi: "र", te: "రా", roman: "raa", en: "come" }
];

function SoundRow({ r }: { r: Row }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-duo-swan bg-white p-3">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-extrabold text-duo-blue">{r.spelling}</span>
          <span lang="hi" className="text-sm font-bold text-duo-purpleDark">
            {r.hindi}
          </span>
        </div>
        <div className="text-sm font-semibold text-duo-wolf">{r.tip}</div>
        <div className="mt-1 text-xs font-semibold text-duo-hare">
          e.g. <span className="text-duo-eel">{r.roman}</span>{" "}
          <span lang="hi" className="text-duo-purpleDark">{toDevanagari(r.te)}</span> — {r.en}
        </div>
      </div>
      <SpeakButton text={r.te} />
    </div>
  );
}

function CognateSection() {
  // Default-collapsed so the primer stays scannable; open when you're ready
  // to see just how much vocabulary you already have.
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border-2 border-duo-yellow/50 bg-duo-yellow/10 p-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <div>
          <h3 className="font-extrabold text-duo-eel">Words you already know</h3>
          <p className="text-sm font-semibold text-duo-wolf">
            Sanskrit-rooted vocabulary Hindi shares with Telugu. Learn the pattern once, get dozens of words free.
          </p>
        </div>
        <span className="text-duo-yellowDark">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-4">
          <p className="text-xs font-semibold text-duo-wolf">
            The rule: Telugu keeps the Sanskrit stem and usually adds <b>-m/-am</b> (things) or <b>-(u)ḍu</b> (people). Strip
            that ending and you're often looking at the Hindi word.
          </p>
          {COGNATE_GROUPS.map((g) => (
            <div key={g.title}>
              <div className="mb-1 text-xs font-extrabold uppercase tracking-wide text-duo-yellowDark">{g.title}</div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {g.items.map((c) => (
                  <div key={c.te} className="flex items-center justify-between gap-2 rounded-xl border-2 border-duo-swan bg-white px-2 py-1.5">
                    <div className="min-w-0 text-sm">
                      <span lang="hi" className="font-bold text-duo-purpleDark">{c.hindi}</span>
                      <span className="text-duo-hare"> → </span>
                      <span className="font-bold text-duo-blue">{c.teRoman}</span>
                      <span lang="hi" className="ml-1 text-duo-purpleDark/80">{toDevanagari(c.te)}</span>
                      <div className="truncate text-xs font-semibold text-duo-wolf">{c.en}</div>
                    </div>
                    <SpeakButton text={c.te} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HindiLoansSection() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border-2 border-duo-blue/40 bg-duo-blue/10 p-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <div>
          <h3 className="font-extrabold text-duo-eel">Hindi/Urdu words used in Telangana</h3>
          <p className="text-sm font-semibold text-duo-wolf">
            Hyderabad's street Telugu borrows heavily from Hindi/Urdu — you already say these.
          </p>
        </div>
        <span className="text-duo-blue">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-1">
          {HINDI_LOANS.map((l) => (
            <div key={l.word} className="flex items-center justify-between gap-2 rounded-xl border-2 border-duo-swan bg-white px-3 py-2">
              <div>
                <span className="font-bold text-duo-blue">{l.word}</span>
                <span lang="hi" className="ml-2 font-bold text-duo-purpleDark">{l.hindi}</span>
                <span className="ml-2 text-sm font-semibold text-duo-wolf">— {l.en}</span>
                {l.note && <span className="ml-2 text-xs font-semibold text-duo-hare">({l.note})</span>}
              </div>
            </div>
          ))}
          <p className="pt-1 text-xs font-semibold text-duo-hare">
            These aren't formal Telugu — they're spoken every day in Hyderabad/Telangana speech.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Sounds() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-duo-eel">How to say the sounds</h2>
        <p className="mt-1 font-semibold text-duo-wolf">
          You already speak Hindi — that's a <b className="text-duo-eel">massive</b> head start. Telugu uses almost the same
          sound system, including the retroflex/dental and aspirated consonants that trip up English speakers. You've got
          those already.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-duo-yellow/50 bg-duo-yellow/10 p-4 text-sm font-semibold text-duo-wolf">
        <b className="text-duo-eel">Your shortcut:</b> below each example is the word in <span lang="hi">देवनागरी</span> — read it
        exactly like Hindi and you'll nail the pronunciation. Devanagari captures long vowels and retroflex/dental sounds that
        the English spelling can't.
      </div>

      <div className="rounded-2xl border-2 border-duo-blue/40 bg-duo-blue/10 p-4 text-sm font-semibold text-duo-wolf">
        <b className="text-duo-eel">The one rule:</b> tap ▶ Listen, then say it out loud and copy what you hear. Use 🐢 for a slow
        version. The audio is always the real answer.
      </div>

      <div>
        <h3 className="mb-2 font-extrabold text-duo-eel">Vowels — long vs short</h3>
        <p className="mb-2 text-sm font-semibold text-duo-wolf">
          Same long/short distinction as Hindi (आ vs अ). Doubled vowels (aa, ee, oo) are just held longer — and length changes
          meaning, so don't rush them.
        </p>
        <div className="space-y-2">
          {VOWELS.map((r) => (
            <SoundRow key={r.spelling} r={r} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-extrabold text-duo-eel">Consonants</h3>
        <p className="mb-2 text-sm font-semibold text-duo-wolf">
          Nearly all identical to Hindi. Our English spelling blurs the retroflex/dental difference — the Devanagari doesn't,
          so trust it over the roman.
        </p>
        <div className="space-y-2">
          {CONSONANTS.map((r) => (
            <SoundRow key={r.spelling} r={r} />
          ))}
        </div>
      </div>

      <CognateSection />
      <HindiLoansSection />

      <div className="rounded-2xl border-2 border-duo-swan bg-white p-4">
        <h3 className="font-extrabold text-duo-eel">Rhythm</h3>
        <p className="mt-1 text-sm font-semibold text-duo-wolf">
          Telugu is fairly even — like Hindi, don't hammer one syllable the way English does. Keep it smooth and let the long
          vowels do the work. Endings often glide down softly (unnav, chestunnav).
        </p>
      </div>

      <div className="rounded-2xl border-2 border-duo-green/40 bg-duo-correctBg/50 p-4">
        <h3 className="font-extrabold text-duo-eel">Now try one</h3>
        <p className="mt-1 text-sm font-semibold text-duo-wolf">Read the Devanagari, play it, copy it, then record yourself.</p>
        <div className="mt-3">
          <div className="text-lg font-black text-duo-blue">nuvvu etla unnav?</div>
          <div lang="hi" className="text-lg font-bold text-duo-purpleDark">
            {toDevanagari("నువ్వు ఎట్ల ఉన్నవ్?")}
          </div>
          <div className="text-sm font-semibold text-duo-wolf">How are you?</div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <SpeakButton text="నువ్వు ఎట్ల ఉన్నవ్?" />
          <MicButton
            targetScript="నువ్వు ఎట్ల ఉన్నవ్?"
            onScored={(s) => recordAttempt({ phraseId: "g1", score: s.overall, at: Date.now() })}
          />
        </div>
      </div>

      <div className="rounded-2xl border-2 border-duo-swan bg-duo-polar p-4 text-sm font-semibold text-duo-wolf">
        <b className="text-duo-eel">No sound?</b> Built-in phrases ship with recorded audio, so they should play anywhere. If a
        phrase you added is silent, the free voice needs a Telugu voice on your device — on Mac: System Settings → Accessibility
        → Spoken Content → System Voice → Manage Voices → add “Telugu”, then use Safari.
      </div>
    </div>
  );
}
