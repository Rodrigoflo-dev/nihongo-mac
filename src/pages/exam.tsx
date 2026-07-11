import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ActivityView, isActivityQuiz } from "@/components/lesson/activities";
import { MeshBackground } from "@/components/visual/mesh-background";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";
import { useCompleteUnitExam, useUnitExam } from "@/hooks/use-exams";
import type { Activity, UnitExamResult } from "@/lib/api";

/** A short human label for an exam question, for the results breakdown. */
function questionLabel(a: Activity): string {
  switch (a.kind) {
    case "quiz":
      return a.promptJp ? `${a.promptJp} — ${a.prompt}` : a.prompt;
    case "listening":
      return a.textJp ? `🎧 ${a.textJp}` : a.prompt;
    case "write_sentence":
      return a.prompt;
    case "order_sentence":
      return `🧩 Ordena: «${a.meaning}»`;
    case "match_pairs":
      return "🔗 Empareja palabras";
    default:
      return "Pregunta";
  }
}

export default function ExamPage() {
  const { unitId: unitParam } = useParams<{ unitId: string }>();
  const unitId = unitParam ? parseInt(unitParam, 10) : undefined;
  const navigate = useNavigate();
  const { data: exam, isLoading } = useUnitExam(unitId);
  const complete = useCompleteUnitExam();

  const [step, setStep] = useState(0);
  const [verified, setVerified] = useState(false);
  const [answered, setAnswered] = useState<{ correct: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [completion, setCompletion] = useState<UnitExamResult | null>(null);
  const [confirmingExit, setConfirmingExit] = useState(false);
  // Per-question outcome, so the results screen can show a question-by-question
  // breakdown first and then point back to the exact lessons the learner missed.
  const [results, setResults] = useState<
    { label: string; lessonId: number; lessonTitle: string; correct: boolean }[]
  >([]);

  const activities = useMemo(() => exam?.activities ?? [], [exam]);
  const current = activities[step];
  const total = activities.length;
  const allDone = step >= total;

  if (isLoading || !exam) {
    return (
      <div className="relative grid h-screen w-screen place-items-center bg-background text-foreground">
        <MeshBackground />
        <p className="relative z-10 font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan">
          読み込み中…
        </p>
      </div>
    );
  }

  if (!exam.allLessonsComplete) {
    return (
      <div className="relative grid h-screen w-screen place-items-center bg-background text-foreground">
        <MeshBackground />
        <HudPanel glow className="relative z-10 mx-8 max-w-md p-8 text-center">
          <div className="relative">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 to-neon-violet/10 text-primary">
              <GraduationCap className="size-7" />
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              試験 · Bloqueado
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
              Examen bloqueado
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Termina todas las lecciones de "{exam.unitTitle}" para desbloquear
              el examen.
            </p>
            <Button className="mt-5" onClick={() => navigate("/learn")}>
              Ir al curso
            </Button>
          </div>
        </HudPanel>
      </div>
    );
  }

  if (completion) {
    // Distinct lessons the learner missed at least one question in.
    const reviewMap = new Map<number, string>();
    for (const r of results) {
      if (!r.correct && r.lessonId) reviewMap.set(r.lessonId, r.lessonTitle);
    }
    const reviewLessons = [...reviewMap.entries()].map(
      ([lessonId, lessonTitle]) => ({ lessonId, lessonTitle })
    );
    return (
      <CompletionScreen
        completion={completion}
        unitTitle={exam.unitTitle}
        results={results}
        reviewLessons={reviewLessons}
        onBack={() => navigate("/learn")}
        onReviewLesson={(lessonId) => navigate(`/learn/${lessonId}`)}
        onNextUnit={
          completion.nextUnitId ? () => navigate("/learn") : undefined
        }
        onRetry={() => {
          setCompletion(null);
          setStep(0);
          setVerified(false);
          setAnswered(null);
          setAttempt(0);
          setCorrectCount(0);
          setResults([]);
          setStartedAt(Date.now());
        }}
      />
    );
  }

  if (allDone || !current) {
    // Submit
    (async () => {
      if (complete.isPending) return;
      const result = await complete.mutateAsync({
        unitId: exam.unitId,
        result: {
          lessonId: 0,
          correctCount,
          totalQuizzes: total,
          secondsSpent: Math.round((Date.now() - startedAt) / 1000),
        },
      });
      setCompletion(result);
      if (result.passed) burstXp();
      if (result.award.leveledUp) burstLevelUp();
    })();
    return (
      <div className="relative grid h-screen w-screen place-items-center bg-background text-foreground">
        <MeshBackground />
        <p className="relative z-10 font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan">
          Calificando…
        </p>
      </div>
    );
  }

  const isQuiz = isActivityQuiz(current);

  const handleNext = () => {
    if (isQuiz && !verified) {
      // First click on a quiz: reveal the explanation before moving on.
      setVerified(true);
      return;
    }
    // Leaving this question — record the outcome (quiz AND write questions) and
    // which lesson it came from, so we can build the "repasa estas lecciones"
    // summary. No retries in the exam.
    const wasCorrect = answered?.correct ?? false;
    const src = exam.sourceLessons?.[step];
    setResults((r) => [
      ...r,
      {
        label: questionLabel(current),
        lessonId: src?.lessonId ?? 0,
        lessonTitle: src?.lessonTitle ?? "",
        correct: wasCorrect,
      },
    ]);
    if (wasCorrect) setCorrectCount((n) => n + 1);
    setVerified(false);
    setAnswered(null);
    setAttempt(0);
    setStep((s) => s + 1);
  };

  const handleExit = () => setConfirmingExit(true);

  const progress = ((step + 1) / total) * 100;

  let label: string;
  let disabled = false;
  if (isQuiz) {
    if (!verified) {
      label = "Verificar";
      disabled = answered === null;
    } else {
      label = step === total - 1 ? "Terminar examen" : "Siguiente";
    }
  } else {
    label = step === total - 1 ? "Terminar examen" : "Siguiente";
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <MeshBackground />
      <div className="absolute left-20 right-0 top-0 z-10 h-7" data-tauri-drag-region />

      <header className="relative z-10 flex items-center gap-4 px-8 pt-10">
        <Button variant="ghost" size="sm" onClick={handleExit}>
          <X className="size-3.5" /> Salir
        </Button>
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">
            試験 · Examen
          </p>
          <p className="font-display text-sm font-extrabold leading-tight tracking-tight">
            {exam.unitTitle}
          </p>
        </div>
        <p className="font-mono text-xs tabular-nums tracking-[0.2em] text-muted-foreground">
          {step + 1} / {total}
        </p>
      </header>

      <div className="relative z-10 px-8 pt-3">
        <Progress value={progress} className="h-1" />
      </div>

      {/* overflow-y-auto on main + inner min-h-full centering: tall activities
          (e.g. the write question with the kana keyboard) flow from the top so
          their prompt is never clipped above the viewport. */}
      <main className="relative z-10 flex-1 overflow-y-auto px-8 py-8">
        <div className="flex min-h-full items-center justify-center">
          <AnimatePresence mode="wait">
            <ActivityView
              key={`${current.id}-${step}-${attempt}`}
              activity={current}
              verified={verified}
              attempt={attempt}
              onAnswer={(c) => setAnswered({ correct: c })}
            />
          </AnimatePresence>
        </div>
      </main>

      <footer className="relative z-10 px-8 pb-8 pt-4">
        <div className="mx-auto max-w-2xl space-y-3">
          {isQuiz && verified && answered ? (
            <div
              className={`rounded-xl border px-4 py-2 text-center text-sm font-medium backdrop-blur-sm ${
                answered.correct
                  ? "border-success/40 bg-success/15 text-success shadow-[0_0_24px_-10px_color-mix(in_oklch,var(--color-success)_70%,transparent)]"
                  : "border-destructive/40 bg-destructive/15 text-destructive shadow-[0_0_24px_-10px_color-mix(in_oklch,var(--color-destructive)_70%,transparent)]"
              }`}
            >
              {answered.correct
                ? "¡Correcto!"
                : "Incorrecto — lee la explicación, sigamos."}
            </div>
          ) : null}
          <Button
            size="xl"
            className="w-full bg-gradient-to-br from-streak via-warning to-neon-amber text-warning-foreground"
            disabled={disabled}
            onClick={handleNext}
          >
            {label}
          </Button>
        </div>
      </footer>

      {confirmingExit ? (
        <div className="absolute inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm">
          <HudPanel glow className="mx-8 w-full max-w-sm p-6 text-center">
            <div className="relative">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon-amber">
              試験
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight">
              ¿Salir del examen?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si sales ahora, este intento no cuenta. Puedes volver a
              empezar desde el curso.
            </p>
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmingExit(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => navigate("/learn")}
              >
                <X className="size-3.5" /> Salir
              </Button>
            </div>
            </div>
          </HudPanel>
        </div>
      ) : null}
    </div>
  );
}

function CompletionScreen({
  completion,
  unitTitle,
  results,
  reviewLessons,
  onBack,
  onRetry,
  onReviewLesson,
  onNextUnit,
}: {
  completion: UnitExamResult;
  unitTitle: string;
  results: { label: string; lessonId: number; lessonTitle: string; correct: boolean }[];
  reviewLessons: { lessonId: number; lessonTitle: string }[];
  onBack: () => void;
  onRetry: () => void;
  onReviewLesson: (lessonId: number) => void;
  onNextUnit?: () => void;
}) {
  const correctTotal = results.filter((r) => r.correct).length;
  return (
    <div className="relative grid h-screen w-screen place-items-center overflow-y-auto bg-background text-foreground">
      <MeshBackground />
      <div className="relative z-10 w-full max-w-xl px-8 py-10">
        <HudPanel glow className="p-10 text-center">
          <div className="relative">
          <HoloKanji
            size={150}
            className="mx-auto"
            items={
              completion.passed
                ? [
                    { char: "合", meaning: "Aprobado" },
                    { char: "試", meaning: "Examen" },
                  ]
                : [
                    { char: "試", meaning: "Examen" },
                    { char: "再", meaning: "Reintentar" },
                  ]
            }
          />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.35em] text-neon-amber">
            試験 · Resultado
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            {completion.passed ? "¡Examen aprobado!" : "No aprobado"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{unitTitle}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Metric
              label="Puntuación"
              value={`${completion.score}%`}
              tone={completion.passed ? "success" : "warning"}
            />
            <Metric
              label="Mejor histórica"
              value={
                completion.newBest
                  ? `${completion.score}% (¡nueva!)`
                  : `${Math.max(completion.score, completion.previousBest ?? 0)}%`
              }
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Metric
              label="XP"
              value={`+${completion.award.xpAmount}`}
              icon={<Sparkles className="size-4 text-primary" />}
            />
            <Metric
              label="Estrellas"
              value={`+${completion.award.starAmount}`}
              icon={<Star className="size-4 fill-warning text-warning" />}
            />
          </div>

          {completion.award.leveledUp ? (
            <p className="mt-3 inline-block rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
              ¡Subiste al nivel {completion.award.newLevel}!
            </p>
          ) : null}

          {/* Question-by-question breakdown FIRST, so the learner sees exactly
              what they got right and wrong (Rodrigo's request). */}
          {results.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-border/40 bg-card/40 p-4 text-left">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
                  結果 · Tus respuestas
                </p>
                <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {correctTotal}/{results.length}
                </p>
              </div>
              <ol className="mt-3 space-y-1.5">
                {results.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        r.correct
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {r.correct ? <Check className="size-3" /> : <X className="size-3" />}
                    </span>
                    <span className="min-w-0">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {i + 1}.
                      </span>{" "}
                      <span
                        className={
                          r.correct ? "text-foreground/80" : "text-foreground"
                        }
                      >
                        {r.label}
                      </span>
                      {!r.correct && r.lessonTitle ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          · {r.lessonTitle}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {/* Then: lessons to review — the questions you missed came from these. */}
          {reviewLessons.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-4 text-left">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-warning">
                復習 · Te recomendamos repasar
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Las preguntas que fallaste se enseñan en{" "}
                {reviewLessons.length === 1 ? "esta lección" : "estas lecciones"}.
                Toca para repasar y ver cuál fue el error.
              </p>
              <div className="mt-3 space-y-2">
                {reviewLessons.map((l) => (
                  <button
                    key={l.lessonId}
                    onClick={() => onReviewLesson(l.lessonId)}
                    className="flex w-full items-center justify-between rounded-xl border border-border/40 bg-card/50 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:border-warning/50 hover:bg-warning/10"
                  >
                    <span>{l.lessonTitle}</span>
                    <ArrowRight className="size-4 text-warning" />
                  </button>
                ))}
              </div>
            </div>
          ) : completion.passed ? (
            <p className="mt-6 rounded-2xl border border-success/30 bg-success/5 p-4 text-sm text-success">
              ¡Perfecto! No fallaste ninguna lección. 🎌
            </p>
          ) : null}

          {/* Passed → offer to continue to the next unit. */}
          {completion.passed && onNextUnit && completion.nextUnitTitle ? (
            <Button
              className="mt-5 w-full bg-gradient-to-br from-primary via-primary to-neon-violet"
              onClick={onNextUnit}
            >
              Continuar con {completion.nextUnitTitle}
              <ArrowRight className="size-4" />
            </Button>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onRetry}>
              <RotateCcw className="size-3.5" /> Volver a intentar
            </Button>
            <Button
              className={
                completion.passed && onNextUnit
                  ? ""
                  : "bg-gradient-to-br from-streak via-warning to-neon-amber text-warning-foreground"
              }
              variant={completion.passed && onNextUnit ? "outline" : "default"}
              onClick={onBack}
            >
              Al curso
            </Button>
          </div>
          </div>
        </HudPanel>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "success" | "warning";
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl glass px-4 py-3 text-left transition-shadow hover:shadow-[0_0_24px_-12px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]">
      <span className="hud-corner left-2 top-2 border-l-2 border-t-2 opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="hud-corner bottom-2 right-2 border-b-2 border-r-2 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <p
        className={`mt-1 font-display text-xl font-extrabold tabular-nums ${
          tone === "success"
            ? "text-success"
            : tone === "warning"
              ? "text-warning"
              : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
