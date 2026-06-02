import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Circle,
  Clock,
  Lock,
  Play,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { useCourses } from "@/hooks/use-lessons";
import type { LessonSummary, Unit } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function LearnPage() {
  const { data: courses, isLoading } = useCourses();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        eyebrow="授業 — Tu curso"
        title={
          <>
            Aprende paso a paso, <span className="gradient-text">como una clase real</span>
          </>
        }
        description="Cada lección combina nuevos kanji, gramática, escucha y voz. Avanzas en orden — el siguiente paso siempre está marcado."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        courses?.map((course) => (
          <section key={course.id} className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-mono">
                {course.jlptLevel}
              </Badge>
              <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
                {course.jpTitle}
              </p>
              <h2 className="text-lg font-semibold tracking-tight">
                {course.title}
              </h2>
            </div>
            <div className="space-y-8">
              {course.units.map((unit) => (
                <UnitBlock key={unit.id} unit={unit} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function UnitBlock({ unit }: { unit: Unit }) {
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
      className="relative overflow-hidden rounded-3xl glass p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
            {unit.jpTitle ?? "ユニット"}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            {unit.title}
          </h3>
          {unit.description ? (
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              {unit.description}
            </p>
          ) : null}
        </div>
        <Badge
          variant={allDone ? "success" : "outline"}
          className="font-mono text-[10px]"
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
            />
          );
        })}
      </ol>

      {allDone ? (
        <Link to={`/exam/${unit.id}`} className="mt-5 block">
          <div
            className={cn(
              "group flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/5 px-5 py-4",
              "transition-all hover:bg-warning/10 hover:ring-1 hover:ring-warning/60"
            )}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-warning to-streak text-warning-foreground shadow-[0_10px_30px_-8px_color-mix(in_oklch,var(--color-warning)_60%,transparent)]">
              <Sparkles className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Examen de unidad — {unit.title}
              </p>
              <p className="text-xs text-muted-foreground">
                10 preguntas mezcladas. Pasas con 70% o más.
              </p>
            </div>
            <ArrowRight className="size-4 text-warning transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-border/50 bg-card/40 px-5 py-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-secondary/60 text-muted-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              Examen de unidad — {unit.title}
            </p>
            <p className="text-xs text-muted-foreground">
              Termina las {totalCount} lecciones para desbloquear ({completedCount}/{totalCount})
            </p>
          </div>
          <div className="text-xs text-muted-foreground">{pct}%</div>
        </div>
      )}
    </motion.div>
  );
}

function LessonRow({
  lesson,
  index,
  locked,
}: {
  lesson: LessonSummary;
  index: number;
  locked: boolean;
}) {
  const tone = locked
    ? "opacity-50"
    : lesson.status === "completed"
      ? ""
      : lesson.status === "in_progress"
        ? "ring-1 ring-primary/30"
        : "";

  const inner = (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border bg-card/60 px-4 py-3 transition-all",
        !locked && "hover:border-primary/40 hover:bg-accent/30",
        tone
      )}
    >
      <StatusDot status={lesson.status} locked={locked} index={index} />
      <div className="flex-1">
        <p className="font-jp text-[10px] tracking-[0.25em] text-muted-foreground">
          {lesson.jpTitle ?? "授業"}
        </p>
        <p className="text-sm font-semibold leading-tight">{lesson.title}</p>
        {lesson.summary ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {lesson.summary}
          </p>
        ) : null}
        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {lesson.durationMinutes} min
          </span>
          <span>{lesson.activityCount} actividades</span>
          {lesson.bestScore != null ? (
            <span className="text-warning">★ {lesson.bestScore}%</span>
          ) : null}
        </div>
      </div>
      {!locked ? (
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      ) : (
        <Lock className="size-4 text-muted-foreground" />
      )}
    </div>
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
      <div className="flex size-9 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground">
        <Lock className="size-3.5" />
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-success to-neon-cyan text-success-foreground">
        <Check className="size-4" />
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary via-neon-violet to-neon-cyan text-primary-foreground">
        <Play className="size-3.5" />
      </div>
    );
  }
  return (
    <div className="flex size-9 items-center justify-center rounded-full border-2 border-border bg-background text-sm font-bold tabular-nums text-muted-foreground">
      <Circle className="absolute size-3.5 opacity-0" />
      {index}
    </div>
  );
}
