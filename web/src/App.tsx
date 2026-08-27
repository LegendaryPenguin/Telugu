import { useEffect, useState } from "react";
import { GraduationCap, MessageCircle, Flame } from "lucide-react";
import CourseHome from "./features/CourseHome";
import ModulePlayer from "./features/ModulePlayer";
import Conversation from "./features/Conversation";
import { hasTeluguVoice } from "./speech";
import { CONTENT_NEEDS_NATIVE_REVIEW } from "./content";
import { useAppState } from "./store";

// The app is a single guided course. Two places: the Course (the winding path
// of modules) and Talk (optional free chat with the AI). Opening a module takes
// over the screen — a focused, one-thing-at-a-time flow like a class.
type Tab = "course" | "talk";

export default function App() {
  const [tab, setTab] = useState<Tab>("course");
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [noVoice, setNoVoice] = useState(false);
  const streak = useAppState((s) => s.streak.count);

  useEffect(() => {
    const t = setTimeout(() => setNoVoice(!hasTeluguVoice()), 800);
    return () => clearTimeout(t);
  }, []);

  // A module in progress owns the whole screen (its own top/bottom bars).
  if (activeModule) {
    return (
      <div key={activeModule} className="animate-fadein mx-auto min-h-full max-w-2xl px-4 pt-4">
        <ModulePlayer moduleId={activeModule} onExit={() => setActiveModule(null)} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-duo-swan bg-white px-4 py-3">
        <h1 className="text-xl font-black tracking-tight text-duo-eel">
          Telugu <span className="text-duo-blue">🐧</span>
        </h1>
        <div className="flex items-center gap-1 rounded-full bg-duo-yellow/15 px-3 py-1 font-extrabold text-duo-yellowDark">
          <Flame size={18} className="fill-duo-yellow text-duo-yellow" />
          <span>{streak}</span>
        </div>
      </header>

      {(noVoice || CONTENT_NEEDS_NATIVE_REVIEW) && (
        <div className="mx-4 mt-2 space-y-2">
          {noVoice && (
            <div className="rounded-xl border-2 border-duo-swan bg-duo-polar p-2 text-xs font-semibold text-duo-wolf">
              No Telugu voice detected — built-in phrases have recorded audio and still play. For the free system voice: on Mac,
              System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → add “Telugu”, then use Safari.
            </div>
          )}
          {CONTENT_NEEDS_NATIVE_REVIEW && (
            <div className="rounded-xl border-2 border-duo-swan bg-duo-polar p-2 text-xs font-semibold text-duo-wolf">
              Course phrases are an authored draft pending native Telangana review.
            </div>
          )}
        </div>
      )}

      <main className="flex-1 px-4 pb-28 pt-4">
        <div key={tab} className="animate-fadein">
          {tab === "course" && <CourseHome onOpen={(id) => setActiveModule(id)} />}
          {tab === "talk" && <Conversation />}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-duo-swan bg-white pb-safe">
        <div className="mx-auto flex max-w-2xl gap-2 px-3 py-2">
          <NavButton label="Learn" Icon={GraduationCap} active={tab === "course"} onClick={() => setTab("course")} />
          <NavButton label="Talk" Icon={MessageCircle} active={tab === "talk"} onClick={() => setTab("talk")} />
        </div>
      </nav>
    </div>
  );
}

function NavButton({
  label,
  Icon,
  active,
  onClick
}: {
  label: string;
  Icon: typeof GraduationCap;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl border-2 py-2 text-xs font-bold uppercase tracking-wide transition ${
        active ? "border-duo-blue/40 bg-duo-blue/10 text-duo-blue" : "border-transparent text-duo-hare hover:bg-duo-polar"
      }`}
    >
      <Icon size={24} strokeWidth={active ? 2.6 : 2.2} />
      {label}
    </button>
  );
}
