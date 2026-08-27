// Word-frequency ranking, used to order which brand-new cards a learner meets
// first. Grounded in real usage (OpenSubtitles-derived), so common everyday
// words surface before rare ones.
//
// This is only a TIE-BREAKER on top of the hand-curated survival-first
// `priority` — see buildQueue in features/Today.tsx. Two important caveats:
//   • The list is STANDARD-spelling. Many Telangana colloquial forms won't
//     match, so we fall back gracefully (unranked → treated as low frequency).
//   • A phrase is multi-word; we rank it by its MOST common token, since one
//     high-frequency word makes the whole phrase approachable.
//
// Regenerate the underlying list with: npm run gen-frequency

import ranked from "./frequency-te.json";

// word → 0-based rank (0 = most frequent). Built once at module load.
const RANK = new Map<string, number>();
(ranked as string[]).forEach((word, i) => {
  if (!RANK.has(word)) RANK.set(word, i);
});

// Sentinel for "not in the list" — sorts after everything ranked.
export const UNRANKED = Number.MAX_SAFE_INTEGER;

// Split Telugu text into word tokens, dropping punctuation/latin/whitespace.
function tokens(te: string): string[] {
  return te.split(/[^ఀ-౿]+/).filter(Boolean);
}

export function wordRank(word: string): number {
  return RANK.get(word) ?? UNRANKED;
}

// Rank a whole phrase by its most frequent word. A phrase with any common word
// is easier to approach than one made entirely of rare words.
export function phraseFrequencyRank(te: string): number {
  let best = UNRANKED;
  for (const t of tokens(te)) {
    const r = wordRank(t);
    if (r < best) best = r;
  }
  return best;
}
