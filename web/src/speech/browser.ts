import type { SpeakOptions, TtsProvider, SttProvider, PronunciationScore } from "./types";
import { similarityScore } from "./similarity";

const TE = "te-IN";

// ── Text-to-speech via the browser's SpeechSynthesis API ────────────────────
export class BrowserTts implements TtsProvider {
  readonly id = "browser-tts";
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (this.available()) {
      const load = () => {
        const voices = window.speechSynthesis.getVoices();
        this.voice =
          voices.find((v) => v.lang === TE) ??
          voices.find((v) => v.lang?.toLowerCase().startsWith("te")) ??
          null;
      };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  available(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  // True only if an actual Telugu voice is installed on this device.
  hasTeluguVoice(): boolean {
    return this.voice != null;
  }

  speak(scriptText: string, opts: SpeakOptions = {}): void {
    if (!this.available()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(scriptText);
    u.lang = TE;
    if (this.voice) u.voice = this.voice;
    u.rate = opts.rate ?? 0.9;
    if (opts.onEnd) u.onend = opts.onEnd;
    window.speechSynthesis.speak(u);
  }

  stop(): void {
    if (this.available()) window.speechSynthesis.cancel();
  }
}

// ── Speech-to-text + scoring via the browser's SpeechRecognition API ────────
type SR = typeof window & {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
};

export class BrowserStt implements SttProvider {
  readonly id = "browser-stt";
  private rec: any = null;

  available(): boolean {
    if (typeof window === "undefined") return false;
    const w = window as SR;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }

  scoreAttempt(referenceScript: string): Promise<PronunciationScore> {
    return new Promise((resolve, reject) => {
      if (!this.available()) {
        reject(new Error("Speech recognition is not available in this browser."));
        return;
      }
      const w = window as SR;
      const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
      const rec = new Rec();
      this.rec = rec;
      rec.lang = TE;
      rec.interimResults = false;
      rec.maxAlternatives = 3;

      let settled = false;

      rec.onresult = (event: any) => {
        // Pick the alternative that scores best against the target.
        let best = "";
        let bestScore = -1;
        const result = event.results[0];
        for (let i = 0; i < result.length; i++) {
          const t = result[i].transcript as string;
          const s = similarityScore(t, referenceScript);
          if (s > bestScore) {
            bestScore = s;
            best = t;
          }
        }
        settled = true;
        resolve({
          overall: Math.max(0, bestScore),
          heardText: best,
          targetText: referenceScript,
          method: "browser-similarity",
          detail:
            "Scored by comparing the recognizer's transcript to the target. " +
            "This is an approximation — a cloud pronunciation-assessment API gives phoneme-level accuracy."
        });
      };

      rec.onerror = (e: any) => {
        if (!settled) reject(new Error(e.error || "recognition-error"));
      };

      rec.onend = () => {
        if (!settled) {
          reject(new Error("no-speech"));
        }
      };

      rec.start();
    });
  }

  cancel(): void {
    if (this.rec) {
      try {
        this.rec.abort();
      } catch {
        /* ignore */
      }
    }
  }
}

// Singletons for the app to share.
export const browserTts = new BrowserTts();
export const browserStt = new BrowserStt();
