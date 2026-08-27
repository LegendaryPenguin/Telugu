// Telugu script → Devanagari transliteration.
//
// For a native Hindi/Devanagari reader this is the single most accurate way to
// know how a Telugu word is pronounced: Devanagari is phonetic and preserves the
// retroflex/dental, aspiration, and vowel-length distinctions that Latin
// romanization ("t" vs "th", "a" vs "aa") smears together.
//
// Telugu (U+0C00–U+0C7F) and Devanagari (U+0900–U+097F) are both Brahmi-derived
// and share a parallel ISCII-based Unicode layout, so almost every codepoint maps
// by a fixed −0x300 offset. The only exceptions we care about are the South-Indian
// SHORT e/o vowels and their matras, which we fold to the familiar Hindi ए/ओ forms.

const OVERRIDE: Record<number, number> = {
  0x0c0e: 0x090f, // short E vowel  → ए
  0x0c12: 0x0913, // short O vowel  → ओ
  0x0c46: 0x0947, // short e matra  → े
  0x0c4a: 0x094b // short o matra  → ो
};

export function toDevanagari(teluguText: string): string {
  let out = "";
  for (const ch of teluguText) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x0c00 && c <= 0x0c7f) {
      out += String.fromCodePoint(OVERRIDE[c] ?? c - 0x300);
    } else {
      out += ch; // punctuation, Latin loanwords, spaces pass through
    }
  }
  return out;
}
