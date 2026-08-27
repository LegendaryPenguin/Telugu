import { browserTts, browserStt, BrowserTts } from "./browser";
import { CloudTts } from "./cloud";
import { initLocalAudio, hasLocalAudio, hasLocalAudioLibrary, localAudioUrl } from "./localAudio";
import type { SpeakOptions, TtsProvider, SttProvider } from "./types";

// The speech layer is a facade so we can swap the underlying provider at
// runtime (after checking what the server offers) without changing any
// feature-code imports. Feature code always imports `tts` / `stt` from here.

let activeTts: TtsProvider = browserTts;
const cloudTts = new CloudTts();

// Pre-generated files (bundled, free, offline) take priority for any phrase we
// have a clip for. Everything else falls back to the active provider.
let currentAudio: HTMLAudioElement | null = null;

function playLocal(text: string, opts?: SpeakOptions): void {
  try {
    currentAudio?.pause();
  } catch {
    /* ignore */
  }
  const a = new Audio(localAudioUrl(text));
  currentAudio = a;
  // Reuse the same rate control as browser TTS (0.9 normal, ~0.55 slow).
  a.playbackRate = Math.max(0.5, opts?.rate ?? 1);
  a.onended = () => opts?.onEnd?.();
  a.onerror = () => activeTts.speak(text, opts); // clip missing/corrupt → live voice
  a.play().catch(() => activeTts.speak(text, opts)); // autoplay blocked → live voice
}

export const tts: TtsProvider = {
  get id() {
    return activeTts.id;
  },
  available: () => activeTts.available() || hasLocalAudioLibrary(),
  speak: (text: string, opts?: SpeakOptions) => {
    if (hasLocalAudio(text)) return playLocal(text, opts);
    return activeTts.speak(text, opts);
  },
  stop: () => {
    try {
      currentAudio?.pause();
    } catch {
      /* ignore */
    }
    activeTts.stop();
  }
};

// STT stays on the browser today. (No vendor sells Telugu pronunciation
// scoring; a server-side forced-alignment scorer is future work — see docs.)
export const stt: SttProvider = browserStt;

// Ask the server which capabilities are configured and upgrade TTS to cloud
// (Sarvam/Google) when available. Call once at app startup.
export async function initSpeech(): Promise<void> {
  // Load the bundled-audio manifest (works with no server at all).
  await initLocalAudio();
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return;
    const health = await res.json();
    if (health.tts && health.tts !== "browser") {
      activeTts = cloudTts;
    }
  } catch {
    /* server not running — stay on browser TTS */
  }
}

export function usingCloudVoice(): boolean {
  return activeTts.id === "cloud-tts";
}

export function hasTeluguVoice(): boolean {
  // Bundled clips mean we can play built-in phrases even with no device voice.
  if (hasLocalAudioLibrary()) return true;
  if (usingCloudVoice()) return true;
  return activeTts instanceof BrowserTts ? activeTts.hasTeluguVoice() : true;
}

export * from "./types";
