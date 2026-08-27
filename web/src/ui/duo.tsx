import type { ButtonHTMLAttributes, ReactNode } from "react";

// ── Design kit: Duolingo-style chunky, rounded, playful UI — with a penguin
// mascot instead of the owl. Shared across the whole app so the look is
// consistent. Colors come from the `duo` palette in tailwind.config.js.

export type Mood = "happy" | "cheer" | "sad" | "wave";

// Pippin the penguin. A simple, friendly SVG mascot with a few moods. `size` is
// the rendered width in px; height follows the 100×112 viewBox ratio.
export function Penguin({ size = 96, mood = "happy", className = "" }: { size?: number; mood?: Mood; className?: string }) {
  const body = "#2B3B57";
  const belly = "#FFFFFF";
  const beak = "#FF9600";
  const raised = mood === "cheer" || mood === "wave";
  return (
    <svg width={size} height={(size * 112) / 100} viewBox="0 0 100 112" className={className} aria-hidden>
      {/* feet */}
      <ellipse cx="39" cy="106" rx="13" ry="6" fill={beak} />
      <ellipse cx="61" cy="106" rx="13" ry="6" fill={beak} />
      {/* left flipper */}
      <ellipse cx="15" cy="62" rx="9" ry="24" fill={body} transform="rotate(10 15 62)" />
      {/* right flipper — raised when cheering/waving */}
      {raised ? (
        <ellipse cx="86" cy="34" rx="8" ry="22" fill={body} transform="rotate(38 86 34)" />
      ) : (
        <ellipse cx="85" cy="62" rx="9" ry="24" fill={body} transform="rotate(-10 85 62)" />
      )}
      {/* body */}
      <ellipse cx="50" cy="58" rx="37" ry="48" fill={body} />
      {/* belly */}
      <ellipse cx="50" cy="66" rx="24" ry="34" fill={belly} />

      {/* eyes */}
      {mood === "cheer" ? (
        <>
          <path d="M31 46 Q39 37 47 46" stroke={body} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M53 46 Q61 37 69 46" stroke={body} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="30" cy="55" r="5" fill="#FFB3B3" opacity="0.7" />
          <circle cx="70" cy="55" r="5" fill="#FFB3B3" opacity="0.7" />
        </>
      ) : (
        <>
          <circle cx="39" cy="45" r="9" fill="#fff" />
          <circle cx="61" cy="45" r="9" fill="#fff" />
          <circle cx={mood === "sad" ? 39 : 40} cy={mood === "sad" ? 48 : 46} r="4.5" fill={body} />
          <circle cx={mood === "sad" ? 61 : 60} cy={mood === "sad" ? 48 : 46} r="4.5" fill={body} />
          {mood === "sad" && (
            <>
              <path d="M31 37 L47 41" stroke={body} strokeWidth="3" strokeLinecap="round" />
              <path d="M69 37 L53 41" stroke={body} strokeWidth="3" strokeLinecap="round" />
            </>
          )}
        </>
      )}

      {/* beak */}
      {mood === "cheer" ? (
        <path d="M43 55 Q50 66 57 55 Q50 60 43 55 Z" fill={beak} />
      ) : mood === "sad" ? (
        <path d="M44 62 Q50 57 56 62" stroke={beak} strokeWidth="4" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M43 55 L57 55 L50 63 Z" fill={beak} />
      )}
    </svg>
  );
}

// Mascot with a speech bubble beside it.
export function MascotBubble({ text, mood = "happy", size = 84 }: { text: ReactNode; mood?: Mood; size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Penguin size={size} mood={mood} className="shrink-0 animate-bob" />
      <div className="relative rounded-2xl border-2 border-duo-swan bg-white px-4 py-3 text-[15px] font-extrabold leading-snug text-duo-eel">
        {text}
        {/* little tail pointing at the penguin */}
        <span className="absolute -left-[9px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-duo-swan bg-white" />
      </div>
    </div>
  );
}

// ── The signature chunky button with a 3D "press" (darker bottom edge). ──
type Variant = "green" | "blue" | "red" | "yellow" | "ghost" | "locked";

const VARIANTS: Record<Variant, string> = {
  green: "bg-duo-green text-white border-duo-greenDark",
  blue: "bg-duo-blue text-white border-duo-blueDark",
  red: "bg-duo-red text-white border-duo-redDark",
  yellow: "bg-duo-yellow text-duo-eel border-duo-yellowDark",
  ghost: "bg-white text-duo-blue border-duo-swan",
  locked: "bg-duo-swan text-duo-hare border-[#d4d4d4]"
};

export function DuoButton({
  variant = "green",
  full,
  className = "",
  children,
  ...props
}: { variant?: Variant; full?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex select-none items-center justify-center rounded-2xl border-b-4 px-5 py-3 text-[15px] font-extrabold uppercase tracking-wide transition-all active:translate-y-[3px] active:border-b-0 disabled:cursor-not-allowed disabled:border-b-4 disabled:!bg-duo-swan disabled:!text-duo-hare disabled:!border-[#d4d4d4] disabled:active:translate-y-0 ${
        VARIANTS[variant]
      } ${full ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

// ── A circular lesson node on the winding course path. ──
type NodeState = "done" | "next" | "todo";
export function PathNode({
  state,
  scheme = "green",
  children,
  onClick,
  ariaLabel
}: {
  state: NodeState;
  scheme?: "green" | "yellow";
  children: ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  const fill =
    state === "todo"
      ? { bg: "#E5E5E5", shadow: "#CFCFCF", ink: "#AFAFAF" }
      : state === "done"
      ? { bg: "#58CC02", shadow: "#4CA700", ink: "#fff" } // completed → green reward
      : scheme === "yellow"
      ? { bg: "#FFC800", shadow: "#E6A600", ink: "#8a6a00" } // next review → yellow
      : { bg: "#4C6EF5", shadow: "#3B5BDB", ink: "#fff" }; // next lesson → indigo
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative flex h-[70px] w-[70px] items-center justify-center rounded-full text-xl font-black transition-all active:translate-y-[4px] active:shadow-none ${
        state === "next" ? "animate-nodebounce" : ""
      }`}
      style={{ background: fill.bg, color: fill.ink, boxShadow: `0 7px 0 ${fill.shadow}` }}
    >
      {children}
    </button>
  );
}

// ── Sticky bottom action bar (holds the CHECK / CONTINUE button). ──
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-duo-swan bg-white pb-safe">
      <div className="mx-auto max-w-2xl px-4 py-4">{children}</div>
    </div>
  );
}

// ── The colored result footer that slides up after checking an answer. ──
export function ResultBar({
  correct,
  title,
  detail,
  continueLabel = "Continue",
  onContinue
}: {
  correct: boolean;
  title: ReactNode;
  detail?: ReactNode;
  continueLabel?: string;
  onContinue: () => void;
}) {
  return (
    <div
      className={`animate-slideup fixed inset-x-0 bottom-0 z-30 pb-safe ${correct ? "bg-duo-correctBg" : "bg-duo-wrongBg"}`}
    >
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
        <Penguin size={56} mood={correct ? "cheer" : "sad"} className="hidden shrink-0 sm:block" />
        <div className="min-w-0 flex-1">
          <div className={`text-lg font-extrabold ${correct ? "text-duo-correctInk" : "text-duo-wrongInk"}`}>{title}</div>
          {detail && <div className={`text-sm font-bold ${correct ? "text-duo-correctInk/90" : "text-duo-wrongInk/90"}`}>{detail}</div>}
        </div>
        <DuoButton variant={correct ? "green" : "red"} onClick={onContinue} className="shrink-0">
          {continueLabel}
        </DuoButton>
      </div>
    </div>
  );
}
