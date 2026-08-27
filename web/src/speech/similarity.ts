// Normalized edit-distance similarity, used to score a spoken attempt against
// the target when no dedicated cloud pronunciation-assessment API is wired in.

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:'"()\-–—]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Returns 0–100. 100 = identical after normalization.
export function similarityScore(heard: string, target: string): number {
  const a = normalize(heard);
  const b = normalize(target);
  if (!a && !b) return 100;
  if (!a || !b) return 0;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  const ratio = 1 - dist / maxLen;
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
}

export function scoreBand(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-400" };
  if (score >= 65) return { label: "Good", color: "text-teal-400" };
  if (score >= 40) return { label: "Getting there", color: "text-amber-400" };
  return { label: "Try again", color: "text-rose-400" };
}
