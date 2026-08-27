// Pluggable speech layer. Today: BrowserSpeech (free, Web Speech API).
// Later: swap in an Azure/Google/Sarvam provider without touching feature code.

export interface SpeakOptions {
  rate?: number; // 0.5 = slow practice, 1 = natural
  onEnd?: () => void;
}

export interface PronunciationScore {
  overall: number; // 0–100
  heardText: string; // what the recognizer thought you said (Telugu script or roman)
  targetText: string;
  method: "browser-similarity" | "cloud-assessment";
  detail?: string;
}

export interface TtsProvider {
  readonly id: string;
  available(): boolean;
  speak(scriptText: string, opts?: SpeakOptions): void;
  stop(): void;
}

export interface SttProvider {
  readonly id: string;
  available(): boolean;
  // Records from the mic until the user stops or the recognizer finalizes,
  // then resolves with a pronunciation score against the reference.
  scoreAttempt(referenceScript: string): Promise<PronunciationScore>;
  cancel(): void;
}
