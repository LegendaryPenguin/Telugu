# Server

A tiny zero-dependency Node server (Node 18+). It holds your API keys so they
never reach the browser, proxies the LLM, optionally synthesizes cloud audio,
and serves the built web app in production.

## Run

```bash
cd server
cp .env.example .env      # then fill in a key
npm start                 # loads .env, listens on :8787
```

The web app talks to it at `/api/*` (Vite proxies this in dev).

## LLM: quickest free start (Gemini)

The default provider is **Google Gemini**, which has a free tier that needs no
credit card and is plenty for daily personal practice:

1. Get a key at https://aistudio.google.com/apikey
2. In `.env`: `LLM_PROVIDER=gemini` and `GEMINI_API_KEY=<your key>`
3. `npm start` — the startup log should print `LLM: gemini`.

## LLM: fully local / offline (no key)

Run a model on your own machine — nothing leaves it. Any OpenAI-compatible
runner works ([Ollama](https://ollama.com), LM Studio, llama.cpp):

```bash
ollama pull llama3.1        # or qwen2.5, gemma2
ollama serve                # OpenAI-compatible server on :11434
```

Then in `.env`:

```
LLM_PROVIDER=openai
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3.1
OPENAI_API_KEY=             # leave blank — local needs no key
```

Trade-off: small local models are noticeably weaker at Telangana dialect than
Gemini/Claude. Good for privacy and offline; Gemini is better for quality.

### Local TTS (advanced)

The in-app voice already uses free neural audio (edge-tts, pre-generated) plus
the browser voice as a fallback — no server needed. If you want to self-host a
Telugu voice instead, run a Python service ([Parler-TTS](https://github.com/huggingface/parler-tts)
or AI4Bharat [Indic-TTS](https://github.com/AI4Bharat/Indic-TTS)) and expose an
HTTP endpoint that returns audio, then point a small `/api/tts` provider at it.
This needs Python + ideally a GPU, so it's an optional power-user path rather
than part of the default setup.

## Endpoints

- `GET  /api/health` — reports configured LLM provider + TTS mode
- `POST /api/chat`   — `{ messages: [...] }` → `{ content }`
- `POST /api/tts`    — `{ text }` → `{ mime, audio (base64) }` (only if a cloud TTS is configured)

## What needs the server?

- **Talk** (conversation) and **Add phrase** need the LLM configured.
- **Phrasebook / Review / Shadow / Quiz** work with no server at all (browser speech).
- Cloud TTS is an optional quality upgrade; without it the app uses the free
  in-browser Telugu voice.

See `.env.example` for every option, including Gemini (free), a local model
(Ollama / LM Studio), Anthropic, 0G's OpenAI-compatible router, or upgrading the
voice to Sarvam / Google.
