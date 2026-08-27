// Zero-dependency Node server (Node 18+ has global fetch).
// Responsibilities:
//   • /api/chat   — proxy to an LLM, holding the key server-side
//   • /api/tts    — optional cloud text-to-speech (Sarvam / Google), returns audio
//   • /api/health — reports which capabilities are configured
//   • static      — serves web/dist in production
//
// Provider selection is by env (see server/.env.example). Nothing here is
// hardcoded to one vendor, so you can point the LLM at Anthropic, OpenAI,
// Groq, Together, Sarvam chat, or 0G's OpenAI-compatible router.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8787;
const DIST = path.resolve(__dirname, "../web/dist");

// ── env ─────────────────────────────────────────────────────────────────────
const LLM_PROVIDER =
  process.env.LLM_PROVIDER ||
  (process.env.ANTHROPIC_API_KEY ? "anthropic" : process.env.GEMINI_API_KEY ? "gemini" : "openai");
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Google Gemini — has a generous free tier and speaks the OpenAI-compatible
// protocol, so it flows through the same code path as any OpenAI endpoint.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// Resolve the effective OpenAI-compatible endpoint. `gemini` is just OpenAI-
// compatible with Google's base URL/key/model; local runners (Ollama, LM Studio,
// llama.cpp) are OpenAI-compatible too — point OPENAI_BASE_URL at them.
function openAiTarget() {
  if (LLM_PROVIDER === "gemini") {
    return { baseUrl: GEMINI_BASE_URL, apiKey: GEMINI_API_KEY, model: GEMINI_MODEL };
  }
  return { baseUrl: OPENAI_BASE_URL, apiKey: OPENAI_API_KEY, model: OPENAI_MODEL };
}

const TTS_PROVIDER = process.env.TTS_PROVIDER || "none"; // none | sarvam | google
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_TTS_MODEL = process.env.SARVAM_TTS_MODEL || "bulbul:v2";
const SARVAM_SPEAKER = process.env.SARVAM_SPEAKER || "anushka";
const GOOGLE_TTS_KEY = process.env.GOOGLE_TTS_KEY;
const GOOGLE_TTS_VOICE = process.env.GOOGLE_TTS_VOICE || "te-IN-Chirp3-HD-Kore";

function llmConfigured() {
  if (LLM_PROVIDER === "anthropic") return !!ANTHROPIC_API_KEY;
  // Local runners often need no key, so a base URL that isn't the OpenAI default
  // counts as configured even without one.
  const { baseUrl, apiKey } = openAiTarget();
  return !!apiKey || baseUrl !== "https://api.openai.com/v1";
}
function ttsConfigured() {
  if (TTS_PROVIDER === "sarvam") return !!SARVAM_API_KEY;
  if (TTS_PROVIDER === "google") return !!GOOGLE_TTS_KEY;
  return false;
}

// ── helpers ───────────────────────────────────────────────────────────────
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data ? JSON.parse(data) : {}));
    req.on("error", reject);
  });
}

// ── LLM ──────────────────────────────────────────────────────────────────
async function callLlm(messages) {
  if (LLM_PROVIDER === "anthropic") {
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
    const rest = messages.filter((m) => m.role !== "system");
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 512, system, messages: rest })
    });
    if (!r.ok) throw new Error(`anthropic ${r.status}: ${await r.text()}`);
    const data = await r.json();
    return data.content?.map((c) => c.text).join("") ?? "";
  }

  // OpenAI-compatible (OpenAI, Gemini, Groq, Together, Sarvam chat, 0G router,
  // local Ollama/LM Studio, …)
  const { baseUrl, apiKey, model } = openAiTarget();
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`; // local runners may need no key
  const r = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, max_tokens: 512, messages })
  });
  if (!r.ok) throw new Error(`openai-compatible ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ── TTS ────────────────────────────────────────────────────────────────────
// Returns { mime, base64 }.
async function callTts(text) {
  if (TTS_PROVIDER === "sarvam") {
    const r = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-subscription-key": SARVAM_API_KEY },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: "te-IN",
        speaker: SARVAM_SPEAKER,
        model: SARVAM_TTS_MODEL
      })
    });
    if (!r.ok) throw new Error(`sarvam ${r.status}: ${await r.text()}`);
    const data = await r.json();
    return { mime: "audio/wav", base64: data.audios?.[0] };
  }

  if (TTS_PROVIDER === "google") {
    const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "te-IN", name: GOOGLE_TTS_VOICE },
        audioConfig: { audioEncoding: "MP3" }
      })
    });
    if (!r.ok) throw new Error(`google ${r.status}: ${await r.text()}`);
    const data = await r.json();
    return { mime: "audio/mpeg", base64: data.audioContent };
  }

  throw new Error("TTS not configured");
}

// ── static file serving (production) ────────────────────────────────────────
const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png"
};
function serveStatic(req, res) {
  if (!fs.existsSync(DIST)) {
    json(res, 404, { error: "Web app not built. Run `npm run build` in web/." });
    return;
  }
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let filePath = path.join(DIST, urlPath === "/" ? "index.html" : urlPath);
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403).end();
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, "index.html"); // SPA fallback
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

// ── router ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = (req.url || "").split("?")[0];

  if (url === "/api/health") {
    return json(res, 200, {
      ok: llmConfigured(),
      provider: llmConfigured() ? LLM_PROVIDER : undefined,
      tts: ttsConfigured() ? TTS_PROVIDER : "browser"
    });
  }

  if (url === "/api/chat" && req.method === "POST") {
    if (!llmConfigured()) return json(res, 503, { error: "LLM not configured. See server/.env.example." });
    try {
      const { messages } = await readBody(req);
      const content = await callLlm(messages || []);
      return json(res, 200, { content });
    } catch (e) {
      return json(res, 502, { error: String(e.message || e) });
    }
  }

  if (url === "/api/tts" && req.method === "POST") {
    if (!ttsConfigured()) return json(res, 503, { error: "Cloud TTS not configured." });
    try {
      const { text } = await readBody(req);
      const { mime, base64 } = await callTts(text || "");
      if (!base64) throw new Error("no audio returned");
      return json(res, 200, { mime, audio: base64 });
    } catch (e) {
      return json(res, 502, { error: String(e.message || e) });
    }
  }

  if (url.startsWith("/api/")) return json(res, 404, { error: "unknown endpoint" });

  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`telugu server on http://localhost:${PORT}`);
  console.log(`  LLM: ${llmConfigured() ? LLM_PROVIDER : "NOT CONFIGURED"}`);
  console.log(`  TTS: ${ttsConfigured() ? TTS_PROVIDER : "browser (client-side)"}`);
});
