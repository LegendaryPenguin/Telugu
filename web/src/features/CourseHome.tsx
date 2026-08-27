import { Check, Star } from "lucide-react";
import { COURSE, moduleLabel } from "../content/course";
import type { CourseModule } from "../content/course";
import { useAppState } from "../store";
import { MascotBubble, PathNode } from "../ui/duo";

// The guided path, Duolingo-style: a gentle zigzag of circular lesson nodes,
// top to bottom. The recommended next module bounces with the penguin beside
// it; done nodes get a check (or a crown for reviews). Any node is tappable —
// the course is open, not locked.
const OFFSETS = [0, -46, -72, -46, 0, 46, 72, 46]; // horizontal weave

export default function CourseHome({ onOpen }: { onOpen: (moduleId: string) => void }) {
  const course = useAppState((s) => s.course);
  const nextId = COURSE.find((m) => !course[m.id]?.completed)?.id ?? null;
  const doneCount = COURSE.filter((m) => course[m.id]?.completed).length;
  const nextModule = COURSE.find((m) => m.id === nextId);

  return (
    <div className="space-y-6">
      {/* Unit banner — shows what you're working toward next. */}
      <div className="rounded-2xl bg-duo-blue px-4 py-3 text-white shadow-[0_4px_0_#3B5BDB]">
        <div className="text-xs font-bold uppercase tracking-widest text-white/80">
          {doneCount} / {COURSE.length} done · Telangana Telugu
        </div>
        <div className="mt-0.5 text-lg font-extrabold">{nextModule ? nextModule.title : "Course complete! 🎉"}</div>
        {nextModule && <div className="text-sm font-semibold text-white/90">{nextModule.goal}</div>}
      </div>

      {/* The path */}
      <div className="flex flex-col items-center gap-6 py-2">
        {COURSE.map((m, i) => {
          const done = !!course[m.id]?.completed;
          const isNext = m.id === nextId;
          const state = done ? "done" : isNext ? "next" : "todo";
          const dx = OFFSETS[i % OFFSETS.length];
          return (
            <div key={m.id} className="relative flex items-center" style={{ transform: `translateX(${dx}px)` }}>
              {/* Penguin coach pops up beside the active node */}
              {isNext && (
                <div className="absolute right-full mr-2 hidden whitespace-nowrap sm:block">
                  <MascotBubble text={done ? "Keep going!" : "Start here!"} mood="wave" size={64} />
                </div>
              )}
              <div className="flex flex-col items-center gap-1">
                <PathNode
                  state={state}
                  scheme={m.kind === "review" ? "yellow" : "green"}
                  onClick={() => onOpen(m.id)}
                  ariaLabel={m.title}
                >
                  <NodeIcon m={m} done={done} />
                </PathNode>
                <span className={`max-w-[8rem] text-center text-xs font-bold ${isNext ? "text-duo-eel" : "text-duo-hare"}`}>
                  {m.title}
                </span>
                {done && course[m.id]?.bestPct != null && (
                  <span className="text-[11px] font-extrabold text-duo-correctInk">{course[m.id]!.bestPct}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NodeIcon({ m, done }: { m: CourseModule; done: boolean }) {
  if (done) return <Check size={30} strokeWidth={3.5} />;
  if (m.kind === "review") return <Star size={28} strokeWidth={2.5} className="fill-white/30" />;
  if (m.kind === "primer") return <span className="text-2xl">🐧</span>;
  return <span>{moduleLabel(m)}</span>;
}
