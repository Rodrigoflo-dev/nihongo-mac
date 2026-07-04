import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Clock, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { useCourses } from "@/hooks/use-lessons";
import { useUnlockedLevel } from "@/hooks/use-exams";
import type { LessonSummary, Unit } from "@/lib/api";
import { cn } from "@/lib/utils";

const LEVEL_ORDER = ["N5", "N4", "N3", "N2", "N1"];
const levelRank = (l: string) => {
  const i = LEVEL_ORDER.indexOf(l);
  return i < 0 ? 0 : i;
};

interface LevelGroup {
  level: string;
  units: Unit[];
  total: number;
  completed: number;
}

/**
 * Repaso: every lesson organized in collapsible menus by JLPT level (N5 → all
 * its lessons, N4 → …). Open a level to review ANY of its lessons — not just the
 * completed ones. Replaying a lesson reinforces it.
 */
export default function ReviewLessonsPage() {
  const { data: courses, isLoading } = useCourses();
  const { data: unlockedLevel } = useUnlockedLevel();

  const groups = useMemo<LevelGroup[]>(() => {
    if (!courses) return [];
    // Only levels the learner has unlocked — don't show N4 while still on N5.
    const maxRank = levelRank(unlockedLevel ?? "N5");
    const byLevel = new Map<string, Unit[]>();
    for (const course of courses) {
      if (levelRank(course.jlptLevel) > maxRank) continue;
      const arr = byLevel.get(course.jlptLevel) ?? [];
      arr.push(...course.units);
      byLevel.set(course.jlptLevel, arr);
    }
    return LEVEL_ORDER.filter((lv) => byLevel.has(lv)).map((level) => {
      const units = byLevel.get(level)!;
      const lessons = units.flatMap((u) => u.lessons);
      return {
        level,
        units,
        total: lessons.length,
        completed: lessons.filter((l) => l.status === "completed").length,
      };
    });
  }, [courses, unlockedLevel]);

  // First level open by default.
  const [open, setOpen] = useState<string | null>(null);
  const activeLevel = open ?? groups[0]?.level ?? null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="relative">
        <PageHeader
          eyebrow="復習 — Repaso"
          title={
            <>
              Repasa por <span className="gradient-text">nivel</span>
            </>
          }
          description="Abre un nivel y repite cualquier lección para reforzar — repasar es lo que fija el aprendizaje."
        />
        <div className="pointer-events-none absolute -right-4 -top-14 hidden lg:block">
          <HoloKanji
            size={200}
            items={[
              { char: "復", meaning: "Repaso" },
              { char: "習", meaning: "Practicar" },
              { char: "完", meaning: "Completo" },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <LevelSection
              key={g.level}
              group={g}
              open={activeLevel === g.level}
              onToggle={() =>
                setOpen((cur) => (cur === g.level ? "__none__" : g.level))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LevelSection({
  group,
  open,
  onToggle,
}: {
  group: LevelGroup;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <HudPanel className="overflow-hidden p-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-accent/20"
      >
        <Badge variant="secondary" className="shrink-0 font-mono">
          {group.level}
        </Badge>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-extrabold tracking-tight">
            Nivel {group.level}
          </h2>
          <p className="text-xs text-muted-foreground">
            {group.total} lecciones · {group.completed} completadas
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.21, 1.02, 0.73, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-6 border-t border-border/40 px-6 py-6">
              {group.units.map((unit) => (
                <div key={unit.id}>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan/80">
                    <span className="font-jp">{unit.jpTitle ?? ""}</span>{" "}
                    {unit.title}
                  </p>
                  <div className="space-y-2">
                    {unit.lessons.map((lesson) => (
                      <ReviewLessonRow key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </HudPanel>
  );
}

function ReviewLessonRow({ lesson }: { lesson: LessonSummary }) {
  const done = lesson.status === "completed";
  return (
    <Link to={`/learn/${lesson.id}`}>
      <div className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-3 py-2.5 transition-all hover:border-neon-cyan/50 hover:bg-accent/20">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            done
              ? "bg-gradient-to-br from-success to-neon-cyan text-success-foreground"
              : "border border-border bg-background text-muted-foreground"
          )}
        >
          {done ? (
            <Check className="size-4" />
          ) : (
            <RotateCcw className="size-3.5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">
            {lesson.title}
          </p>
          <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {lesson.durationMinutes} min
            </span>
            {lesson.bestScore != null ? (
              <span className="text-warning">★ {lesson.bestScore}%</span>
            ) : (
              <span>sin empezar</span>
            )}
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 gap-1.5 text-[10px]">
          <RotateCcw className="size-3" />
          {done ? "Repetir" : "Ver"}
        </Badge>
      </div>
    </Link>
  );
}
