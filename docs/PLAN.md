# Design Plan — Telugu Speaking App

## 1. Purpose

Learn to **speak and understand** colloquial **Telangana** Telugu to converse with my girlfriend.
Reading and writing are explicitly out of scope. Success = holding a casual spoken conversation and
understanding hers.

## 2. Principles that shape the design

1. **Audio-first, script-hidden.** The user never learns Telugu script. But TTS engines need native
   script for correct pronunciation, so content stores script internally and only *displays* romanization
   + English. Content is a 3-layer record: `{ te: "నువ్వు ఎలా ఉన్నావ్", roman: "nuvvu ela unnav", en: "how are you" }`.
2. **Dialect and register beat volume.** Telangana vocabulary + casual couple-speak (light Tenglish) is
   far more useful than a large deck of formal/standard Telugu. Foundation drills stay clean; conversation
   is realistic.
3. **Personalization is the differentiator.** The user logs real situations and real phrases she uses;
   the app generates targeted drills. This is what makes it better than a generic app.
4. **Feedback loops on both meaning and pronunciation.** Speaking practice is only useful if it's judged.

## 3. Architecture

```
web/          React + Vite + TS + Tailwind, PWA-installable
  speech/     pluggable provider interface (TTS + STT + scoring)
  srs/        spaced-repetition scheduler + local progress store
  features/   phrasebook · shadowing · conversation · listening · quiz
  content/    generated decks (JSON) + cached audio blobs
server/       thin proxy holding the Claude API key
content-gen/  offline scripts: Claude → Telangana decks → JSON
docs/         this plan
```

### Speech provider interface (the hybrid strategy)

```ts
interface TtsProvider { speak(script: string, opts?): Promise<AudioBuffer|void>; }
interface SttProvider {
  transcribe(audio: Blob, opts?): Promise<{ text: string }>;
  score?(audio: Blob, referenceScript: string): Promise<PronunciationScore>; // optional
}
```

- **Now (free):** `BrowserTtsProvider` (SpeechSynthesis, `te-IN`), `BrowserSttProvider` (Web Speech API,
  `te-IN`). Zero cost, no keys. Quality for Telugu is variable — acceptable for prototyping.
- **Later (cloud):** `AzureTtsProvider` / `GoogleTtsProvider` (neural Telugu voices), cloud STT, and — if
  supported — Azure **Pronunciation Assessment** for phoneme-level scoring. Swap via config/env only.
- **Scoring fallback** when no assessment API: transcribe user speech → compare against reference with
  phonetic distance + Claude judgment. Coarser but works everywhere.

> ⚠️ TO VERIFY before relying on it: whether Azure Pronunciation Assessment supports `te-IN`. If not, use
> the fallback path above.

### Content generation

Offline script calls Claude to produce Telangana decks as validated JSON (script + roman + en, plus
usage notes and a difficulty tag). Human-in-the-loop review before a deck ships. Audio is pre-generated
once and cached so playback is instant and consistent.

## 4. Features (build order)

1. **Sound foundation** — the Telugu sounds English lacks (retroflex ట/డ, aspiration, phonemic vowel
   length). Minimal pairs, hear → repeat → scored. Clean register.
2. **Phrasebook + SRS** — themed Telangana decks + user's own logged phrases. Card = audio + roman + en.
   Spaced repetition schedules reviews.
3. **Shadowing** — hear native line → repeat → pronunciation score + per-syllable feedback. Core
   "speak and be judged" loop.
4. **Conversation mode (flagship)** — Claude role-plays (e.g. the girlfriend, a friend, a shopkeeper).
   Speaks (TTS), listens to spoken reply (STT), responds naturally, corrects gently. Adjustable
   difficulty + speed. Telangana register, light Tenglish.
5. **Listening comprehension** — natural-speed audio → user shows understanding (pick meaning /
   paraphrase). Speed dial slow→native. Trains understanding *her*.
6. **Progress dashboard** — words mastered, pronunciation trend, streak, weakest sounds → drives what
   gets quizzed next.

### Personalization hooks (woven through)
- "I want to say X" → generate phrase + audio + add to phrasebook + drill.
- "She said Y, what does it mean?" → explain + break down + optionally add to review.

## 5. Tech stack

- Frontend: React + Vite + TypeScript + Tailwind; PWA (installable, offline-capable for cached content).
- Brain: Claude (Anthropic API) — content gen, conversation, meaning-judging. Latest capable model.
- Speech: browser APIs now → Azure/Google neural later (pluggable).
- Storage: local (IndexedDB/SQLite-wasm) for SRS state + progress; cached audio blobs. Single user, no
  heavy infra.
- Server: minimal Node/Express proxy for the Claude key (and cloud speech keys once added).

## 6. Roadmap

- **Phase 0** — scaffold repo, speech interface stubs, content schema. *(this doc + skeleton)*
- **Phase 1 (MVP)** — content pipeline + phrasebook + audio + SRS + basic quiz.
- **Phase 2** — shadowing + pronunciation scoring.
- **Phase 3** — conversation mode.
- **Phase 4** — listening comprehension + dashboard + polish.

## 7. Provider research findings (2026)

Resolved from a web survey — drives the cloud path behind the pluggable layer.

- **TTS quality ranking:** Google Cloud **Chirp 3: HD** (`te-IN-Chirp3-HD-*`, 30 voices) is
  the top neural tier. **Sarvam AI** (`bulbul:v2/v3`) is the cost/quality sweet spot for Indic
  (₹100 free credits, ~₹15–30/10k chars). Azure has only 2 te-IN voices. OpenAI TTS does **not**
  support Telugu. Open-source MMS Telugu is non-commercial license; Coqui XTTS lacks Telugu.
- **STT quality ranking:** Google Chirp 2/3 (te-IN) ≈ Sarvam `saaras:v4` (Indic-specialized,
  ~₹30/hr). **Whisper is weak for Telugu** (high WER) — avoid. Self-host option: AI4Bharat
  **IndicConformer** (MIT license, free).
- **Pronunciation assessment — RESOLVED: Azure does NOT support Telugu.** Its assessment covers
  only en/hi/ta among Indian languages. No vendor sells Telugu phoneme scoring. → current app
  uses normalized edit-distance similarity; a real upgrade is a **self-hosted forced-alignment
  (MFA/Charsiu) + GOP** scorer over IndicConformer. This is build-not-buy.
- **Telangana dialect — RESOLVED:** no provider exposes a Telangana-vs-Andhra *voice* selector;
  all treat Telugu as one `te-IN`. Telangana flavor therefore lives in the **content/phrasing**
  (which we author), not the TTS accent.
- **Browser Web Speech — RESOLVED:** te-IN TTS reliable on Chrome/Android + Safari (macOS/iOS),
  unreliable on desktop Chrome/Windows. STT (`SpeechRecognition`) is **Chrome-only**. Good as a
  free progressive-enhancement; not a primary STT — hence the pluggable cloud path.

### Chosen defaults
- LLM: provider-agnostic (Anthropic native, or any OpenAI-compatible incl. 0G router).
- TTS: free browser now → **Sarvam** (pragmatic) or **Google Chirp 3: HD** (max quality) via env.
- STT + scoring: browser now → future self-hosted GOP scorer.

### 0G Compute (evaluated)
Usable for *chat* LLMs via its OpenAI-compatible router (`https://router-api.0g.ai/v1`), but a
poor fit for speech: STT (Whisper) is mainnet/paid-only, **no TTS**, and the free testnet faucet
(0.1 0G/day vs a 3-token minimum) makes free usage slow. Wired as an optional LLM backend only.

## 8. Still open
- Which specific Telangana vocabulary to prioritize — refine as the user notices what she uses.
- Native Telangana review of the authored starter decks.
- If/when to stand up the self-hosted GOP pronunciation scorer.
