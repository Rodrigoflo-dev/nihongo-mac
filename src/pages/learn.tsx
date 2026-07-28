import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Circle,
  Clock,
  GraduationCap,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { useCourses } from "@/hooks/use-lessons";
import { useUnlockedLevel } from "@/hooks/use-exams";
import type { Course, LessonSummary, Unit } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT, type TFn } from "@/lib/i18n";
import { useTc } from "@/lib/content-i18n";

const LEVEL_ORDER = ["N5", "N4", "N3", "N2", "N1"];
const levelRank = (l: string) => {
  const i = LEVEL_ORDER.indexOf(l);
  return i < 0 ? 0 : i;
};

export default function LearnPage() {
  const t = useT();
  const tc = useTc();
  const { data: courses, isLoading } = useCourses();
  const { data: unlockedLevel } = useUnlockedLevel();
  const current = unlockedLevel ?? "N5";

  // Only show levels the learner has unlocked (pass a level's final exam to
  // unlock the next). N4 stays hidden until N5's final exam is passed.
  const visible = (courses ?? []).filter(
    (c) => levelRank(c.jlptLevel) <= levelRank(current)
  );

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="relative">
        <PageHeader
          eyebrow={t("learn.eyebrow")}
          title={
            <>
              {t("learn.title.a")}{" "}
              <span className="gradient-text">{t("learn.title.b")}</span>
            </>
          }
          description={t("learn.desc")}
        />
        <div className="pointer-events-none absolute -right-6 -top-16 hidden lg:block">
          <HoloKanji
            size={220}
            items={[
              { char: "授", meaning: "Clase" },
              { char: "業", meaning: "Lección" },
              { char: "学", meaning: "Aprender" },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <>
          {visible.map((course) => (
            <section key={course.id} className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="font-mono">
                  {course.jlptLevel}
                </Badge>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
                  <span className="font-jp">{course.jpTitle}</span>
                </p>
                <h2 className="font-display text-lg font-extrabold tracking-tight">
                  {tc(course.title)}
                </h2>
              </div>
              <div className="space-y-8">
                {course.units.map((unit) => (
                  <UnitBlock key={unit.id} unit={unit} t={t} tc={tc} />
                ))}
              </div>
            </section>
          ))}

          <LevelFinalExamCard level={current} courses={visible} t={t} />
        </>
      )}
    </div>
  );
}

/**
 * Final exam for the current level. Passing it (≥60%) unlocks the next level,
 * which then appears above. Available only once every lesson of the level is
 * completed.
 */
function LevelFinalExamCard({
  level,
  courses,
  t,
}: {
  level: string;
  courses: Course[];
  t: TFn;
}) {
  const lessons = courses
    .filter((c) => c.jlptLevel === level)
    .flatMap((c) => c.units.flatMap((u) => u.lessons));
  const total = lessons.length;
  const done = lessons.filter((l) => l.status === "completed").length;
  const ready = total > 0 && done >= total;
  const nextLevel = LEVEL_ORDER[levelRank(level) + 1];

  return (
    <section className="pt-2">
      <Link to={`/exam/level/${level}`}>
        <div className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-neon-cyan/50 bg-neon-cyan/5 px-5 py-5 transition-all hover:bg-neon-cyan/10 hover:ring-1 hover:ring-neon-cyan/60">
          <span className="hud-corner left-2 top-2 border-l-2 border-t-2 border-neon-cyan/50" />
          <span className="hud-corner bottom-2 right-2 border-b-2 border-r-2 border-neon-cyan/50" />
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-neon-violet to-neon-cyan text-background">
            <GraduationCap className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {t("learn.finalExam", { level })}
            </p>
            <p className="text-xs text-muted-foreground">
              {ready
                ? t("learn.finalExam.ready", {
                    next: nextLevel ?? t("learn.nextLevel"),
                  })
                : t("learn.finalExam.notReady", {
                    next: nextLevel ?? t("learn.nextLevel"),
                    done,
                    total,
                  })}
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-neon-cyan transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </section>
  );
}

function UnitBlock({ unit, t, tc }: { unit: Unit; t: TFn; tc: (s: string) => string }) {
  const navigate = useNavigate();
  const [confirmRetake, setConfirmRetake] = useState(false);
  const completedCount = unit.lessons.filter((l) => l.status === "completed")
    .length;
  const totalCount = unit.lessons.length;
  const pct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <HudPanel glow className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            <span className="font-jp">{unit.jpTitle ?? "ユニット"}</span>
          </p>
          <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight">
            {tc(unit.title)}
          </h3>
          {unit.description ? (
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              {tc(unit.description)}
            </p>
          ) : null}
        </div>
        <Badge
          variant={allDone ? "success" : "outline"}
          className="shrink-0 font-mono text-[10px]"
        >
          {completedCount}/{totalCount}
        </Badge>
      </div>

      {/* Path */}
      <ol className="mt-6 space-y-3">
        {unit.lessons.map((lesson, idx) => {
          const prev = idx > 0 ? unit.lessons[idx - 1] : null;
          const locked = Boolean(
            prev && prev.status !== "completed" && lesson.status !== "completed"
          );
          return (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={idx + 1}
              locked={locked}
              t={t}
              tc={tc}
            />
          );
        })}
      </ol>

      {allDone && unit.examPassed ? (
        // Already passed → show APROBADO; clicking asks whether to retake.
        <button
          onClick={() => setConfirmRetake(true)}
          className={cn(
            "group relative mt-5 flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-success/40 bg-success/5 px-5 py-4 text-left",
            "transition-all hover:bg-success/10 hover:ring-1 hover:ring-success/60"
          )}
        >
          <span className="hud-corner left-2 top-2 border-l-2 border-t-2 border-success/50" />
          <span className="hud-corner bottom-2 right-2 border-b-2 border-r-2 border-success/50" />
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-success to-emerald-500 text-white shadow-[0_10px_30px_-8px_color-mix(in_oklch,var(--color-success)_60%,transparent)]">
            <Trophy className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-success">
              {t("learn.unitExam.passed")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("learn.unitExam.bestScore", { score: unit.examBestScore ?? 0 })}
            </p>
          </div>
          <RotateCcw className="size-4 shrink-0 text-success transition-transform group-hover:rotate-[-30deg]" />
        </button>
      ) : allDone ? (
        <Link to={`/exam/${unit.id}`} className="mt-5 block">
          <motion.div
            whileHover={{ y: -2 }}
            className={cn(
              "group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-neon-amber/40 bg-neon-amber/5 px-5 py-4",
              "transition-all hover:bg-neon-amber/10 hover:ring-1 hover:ring-neon-amber/60 hover:shadow-[0_0_30px_-8px_color-mix(in_oklch,var(--color-neon-amber)_55%,transparent)]"
            )}
          >
            <span className="hud-corner left-2 top-2 border-l-2 border-t-2 border-neon-amber/50" />
            <span className="hud-corner bottom-2 right-2 border-b-2 border-r-2 border-neon-amber/50" />
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-warning to-streak text-warning-foreground shadow-[0_10px_30px_-8px_color-mix(in_oklch,var(--color-warning)_60%,transparent)]">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {t("learn.unitExam", { unit: tc(unit.title) })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("learn.unitExam.mixed")}
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-warning transition-transform group-hover:translate-x-0.5" />
          </motion.div>
        </Link>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-border/50 bg-card/40 px-5 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/60 text-muted-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {t("learn.unitExam", { unit: tc(unit.title) })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("learn.unitExam.finishFirst", {
                total: totalCount,
                done: completedCount,
              })}
            </p>
          </div>
          <div className="shrink-0 font-mono text-xs tabular-nums text-neon-cyan">{pct}%</div>
        </div>
      )}
      </HudPanel>

      {confirmRetake ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-8 backdrop-blur-sm">
          <HudPanel glow className="w-full max-w-sm p-6 text-center">
            <div className="relative">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-success/30 to-emerald-500/10 text-success">
                <Trophy className="size-6" />
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-success">
                {t("learn.retake.eyebrow")}
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
                {t("learn.retake.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("learn.retake.body", { score: unit.examBestScore ?? 0 })}
              </p>
              <div className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmRetake(false)}
                >
                  {t("learn.retake.no")}
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-br from-primary via-primary to-neon-violet"
                  onClick={() => navigate(`/exam/${unit.id}`)}
                >
                  <RotateCcw className="size-3.5" /> {t("learn.retake.yes")}
                </Button>
              </div>
            </div>
          </HudPanel>
        </div>
      ) : null}
    </motion.div>
  );
}

function LessonRow({
  lesson,
  index,
  locked,
  t,
  tc,
}: {
  lesson: LessonSummary;
  index: number;
  locked: boolean;
  t: TFn;
  tc: (s: string) => string;
}) {
  const tone = locked
    ? "opacity-50"
    : lesson.status === "completed"
      ? ""
      : lesson.status === "in_progress"
        ? "ring-1 ring-primary/30"
        : "";

  const inner = (
    <motion.div
      whileHover={!locked ? { y: -2 } : undefined}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border bg-card/60 px-4 py-3 transition-all",
        !locked &&
          "hover:border-primary/40 hover:bg-accent/30 hover:shadow-[0_0_24px_-10px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]",
        tone
      )}
    >
      <StatusDot status={lesson.status} locked={locked} index={index} />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan/80">
          <span className="font-jp">{lesson.jpTitle ?? "授業"}</span>
        </p>
        <p className="text-sm font-semibold leading-tight">{tc(lesson.title)}</p>
        {lesson.summary ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {tc(lesson.summary)}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {lesson.durationMinutes} {t("home.min")}
          </span>
          <span>{lesson.activityCount} {t("learn.activities")}</span>
          {lesson.bestScore != null ? (
            <span className="text-neon-amber">★ {lesson.bestScore}%</span>
          ) : null}
        </div>
      </div>
      {!locked ? (
        <ArrowRight className="size-4 shrink-0 text-neon-cyan transition-transform group-hover:translate-x-0.5" />
      ) : (
        <Lock className="size-4 shrink-0 text-muted-foreground" />
      )}
    </motion.div>
  );

  if (locked) {
    return <li>{inner}</li>;
  }
  return (
    <li>
      <Link to={`/learn/${lesson.id}`}>{inner}</Link>
    </li>
  );
}

function StatusDot({
  status,
  locked,
  index,
}: {
  status: string;
  locked: boolean;
  index: number;
}) {
  if (locked) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground">
        <Lock className="size-3.5" />
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-success to-neon-cyan text-success-foreground shadow-[0_0_18px_-4px_color-mix(in_oklch,var(--color-neon-cyan)_70%,transparent)]">
        <Check className="size-4" />
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary via-neon-violet to-neon-cyan text-primary-foreground shadow-[0_0_20px_-4px_color-mix(in_oklch,var(--color-primary)_75%,transparent)]">
        <Play className="size-3.5" />
      </div>
    );
  }
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background font-mono text-sm font-bold tabular-nums text-muted-foreground">
      <Circle className="absolute size-3.5 opacity-0" />
      {index}
    </div>
  );
}
