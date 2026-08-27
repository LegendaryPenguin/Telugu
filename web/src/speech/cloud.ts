import type { SpeakOptions, TtsProvider } from "./types";

// Plays audio synthesized by the server's /api/tts endpoint (Sarvam/Google).
// Caches by text so repeated plays are instant and don't re-bill the API.
export class CloudTts implements TtsProvider {
  readonly id = "cloud-tts";
  private cache = new Map<string, string>(); // text -> object URL
  private current: HTMLAudioElement | null = null;

  available(): boolean {
    return true;
  }

  async fetchAudio(text: string): Promise<string> {
    const cached = this.cache.get(text);
    if (cached) return cached;
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error(`tts ${res.status}`);
    const { mime, audio } = await res.json();
    const blob = base64ToBlob(audio, mime || "audio/wav");
    const url = URL.createObjectURL(blob);
    this.cache.set(text, url);
    return url;
  }

  speak(scriptText: string, opts: SpeakOptions = {}): void {
    this.stop();
    this.fetchAudio(scriptText)
      .then((url) => {
        const audio = new Audio(url);
        audio.playbackRate = opts.rate ?? 1;
        if (opts.onEnd) audio.onended = opts.onEnd;
        this.current = audio;
        void audio.play();
      })
      .catch((e) => console.warn("Cloud TTS failed:", e));
  }

  stop(): void {
    if (this.current) {
      this.current.pause();
      this.current = null;
    }
  }
}

function base64ToBlob(b64: string, mime: string): Blob {
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
