// Generates a trimmed Telugu word-frequency list used to ground new-card
// introduction order in real usage data.
//
//   npm run gen-frequency
//
// Source: HermitDave FrequencyWords, 2018 Telugu (te_full), derived from the
// OpenSubtitles2018 corpus — CC-BY-SA-4.0. Subtitle-derived, so ordering by it
// optimizes for BOTH everyday conversation and the cinema-subtitle endgame.
// Repo: https://github.com/hermitdave/FrequencyWords
//
// We keep only the top N forms (the long tail is noise/rare) and only tokens
// that actually contain Telugu script, then bundle them as a rank list.
//
// Caveat: these are STANDARD-spelling surface forms. Telangana colloquial
// spellings (e.g. ఉన్నవ్ vs ఉన్నావు) won't all match — so this is used only as a
// tie-breaking ordering signal on top of the hand-curated survival-first
// priorities, never as the sole order.

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "content", "frequency-te.json");
const URL = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/te/te_full.txt";
const TOP_N = 3000;

const hasTelugu = (s) => /[ఀ-౿]/.test(s);

async function main() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching frequency list`);
  const text = await res.text();

  const words = [];
  for (const line of text.split("\n")) {
    const word = line.split(/\s+/)[0]?.trim();
    if (!word || !hasTelugu(word)) continue;
    words.push(word);
    if (words.length >= TOP_N) break;
  }

  writeFileSync(OUT, JSON.stringify(words));
  console.log(`Wrote ${words.length} ranked Telugu words → ${OUT}`);
}

main();
