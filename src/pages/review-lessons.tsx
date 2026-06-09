import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, RotateCcw, Sparkles, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { useCourses } from "@/hooks/use-lessons";
import type { LessonSummary } from "@/lib/api";

interface DoneLesson extends LessonSummary {
  courseTitle: string;
  unitTitle: string;
}

export default function ReviewLessonsPage() {
  const { data: courses, isLoading } = useCourses();

  const done = useMemo<DoneLesson[]>(() => {
    if (!courses) return [];
    const out: DoneLesson[] = [];
    for (const course of courses) {
      for (const unit of course.units) {
        for (const lesson of unit.lessons) {
          if (lesson.status === "completed") {
            out.push({
              ...lesson,
              courseTitle: course.title,
              unitTitle: unit.title,
            });
          }
        }
      }
    }
    // Most recently mastered feel: keep author order but completed first.
    return out;
  }, [courses]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        eyebrow="復習 — Repaso"
        title={
          <>
            Tus lecciones <span className="gradient-text">completadas</span>
          </>
        }
        description="Aquí están las lecciones que ya dominaste. Repite la que quieras para reforzar — repasar es lo que fija el aprendizaje."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : done.length === 0 ? (
        <div className="rounded-3xl glass p-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Aún no completas lecciones</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Cuando termines tu primera lección aparecerá aquí para que puedas
            repetirla cuando quieras.
          </p>
          <Link
            to="/learn"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-neon-violet to-neon-cyan px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Ir al curso
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {done.length} lección{done.length === 1 ? "" : "es"} completada
            {done.length === 1 ? "" : "s"}
          </p>
          {done.map((lesson) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link to={`/learn/${lesson.id}`}>
                <div className="group flex items-center gap-4 rounded-2xl border bg-card/60 px-4 py-3 transition-all hover:border-primary/40 hover:bg-accent/30">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-success to-neon-cyan text-success-foreground">
                    <Trophy className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-jp text-[10px] tracking-[0.25em] text-muted-foreground">
                      {lesson.courseTitle} · {lesson.unitTitle}
                    </p>
                    <p className="text-sm font-semibold leading-tight">
                      {lesson.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {lesson.durationMinutes} min
                      </span>
                      {lesson.bestScore != null ? (
                        <span className="text-warning">
                          ★ mejor {lesson.bestScore}%
                        </span>
                      ) : null}
                      {lesson.completions > 0 ? (
                        <span>
                          {lesson.completions}{" "}
                          {lesson.completions === 1 ? "vez" : "veces"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1.5 group-hover:border-primary/50">
                    <RotateCcw className="size-3" />
                    Repetir
                  </Badge>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
