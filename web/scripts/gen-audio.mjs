// One-time (idempotent) generator for bundled phrase audio.
//
// Scans src/ for every Telugu-script string literal the app might speak, then
// downloads a free MP3 for each into public/audio/<hash>.mp3 and writes a
// manifest. Playback then needs no AI, no API key, and no device Telugu voice.
//
//   npm run gen-audio           # skip clips that already exist
//   npm run gen-audio -- --force  # re-generate everything (use after voice upgrade)
//
// Audio source, in order of preference:
//   1. edge-tts (neural te-IN, free, keyless) — install once with `pip install
//      edge-tts` (or `pipx install edge-tts`). This is the recommended quality tier.
//   2. Google Translate TTS (standard te-IN) — automatic fallback if edge-tts
//      isn't available. Lower quality but no install required.
//
// Note: no provider currently offers a Telangana voice — the Telangana flavor
// lives in the word choice, not the accent. Re-run any time content changes.

import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "src");
const OUT = join(__dirname, "..", "public", "audio");

// Prefer free neural voices via edge-tts (`pip install edge-tts`) — a clear
// quality upgrade. Falls back to Google Translate TTS if edge-tts isn't present.
const EDGE_VOICE = "te-IN-ShrutiNeural"; // te-IN-MohanNeural = male alternative
const FORCE = process.argv.includes("--force"); // regenerate even if a clip exists

// Keep identical to hashText() in src/speech/localAudio.ts.
function hashText(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

// Any single-line quoted string literal containing at least one Telugu codepoint.
const TELUGU_LITERAL = /(["'`])((?:(?!\1)[^\r\n\\])*?[ఀ-౿](?:(?!\1)[^\r\n\\])*?)\1/g;

function collectTexts() {
  const set = new Set();
  for (const file of walk(SRC)) {
    const text = readFileSync(file, "utf8");
    let m;
    while ((m = TELUGU_LITERAL.exec(text))) {
      const s = m[2].trim();
      if (s && s.length <= 200) set.add(s);
    }
  }
  return [...set];
}

// Probe once: is edge-tts on this machine? If yes, use it for everything.
let edgeAvailable = null;
async function detectEdge() {
  if (edgeAvailable !== null) return edgeAvailable;
  try {
    await execFileP("python3", ["-m", "edge_tts", "--list-voices"], { timeout: 15000 });
    edgeAvailable = true;
    console.log(`Using edge-tts neural voice: ${EDGE_VOICE}`);
  } catch {
    edgeAvailable = false;
    console.log("edge-tts not found (install with `pip install edge-tts` for neural quality).");
    console.log("Falling back to Google Translate TTS (standard quality).");
  }
  return edgeAvailable;
}

async function fetchEdge(text, outFile) {
  await execFileP(
    "python3",
    ["-m", "edge_tts", "--voice", EDGE_VOICE, "--text", text, "--write-media", outFile],
    { timeout: 60000 }
  );
  const buf = readFileSync(outFile);
  if (buf.length < 512) throw new Error(`edge-tts wrote suspiciously small file (${buf.length}b)`);
  return buf;
}

async function fetchGoogle(text) {
  const url =
    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=te&q=" + encodeURIComponent(text);
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 512) throw new Error(`suspiciously small (${buf.length}b)`);
  return buf;
}

async function fetchTts(text, outFile) {
  if (await detectEdge()) return fetchEdge(text, outFile);
  const buf = await fetchGoogle(text);
  writeFileSync(outFile, buf);
  return buf;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  mkdirSync(OUT, { recursive: true });
  const texts = collectTexts();
  console.log(`Found ${texts.length} unique Telugu strings.`);

  const manifest = [];
  let made = 0;
  let skipped = 0;
  let failed = 0;

  for (const text of texts) {
    const hash = hashText(text);
    const file = join(OUT, `${hash}.mp3`);
    if (existsSync(file) && !FORCE) {
      manifest.push(hash);
      skipped++;
      continue;
    }
    try {
      await fetchTts(text, file);
      manifest.push(hash);
      made++;
      console.log(`  ✓ ${text.slice(0, 24)}  → ${hash}.mp3`);
      // edge-tts is a local process (no rate-limit risk); Google's endpoint deserves a pause.
      await sleep(edgeAvailable ? 60 : 450);
    } catch (e) {
      failed++;
      console.warn(`  ✗ ${text.slice(0, 24)}  (${e.message})`);
      await sleep(edgeAvailable ? 200 : 1200);
    }
  }

  writeFileSync(join(OUT, "manifest.json"), JSON.stringify([...new Set(manifest)]));
  console.log(`\nDone. ${made} new, ${skipped} existing, ${failed} failed. Manifest: ${manifest.length} clips.`);
  if (failed) process.exitCode = 0; // partial success is fine; re-run to fill gaps
}

main();
