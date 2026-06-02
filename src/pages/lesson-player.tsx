import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Check, RotateCcw, Sparkles, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ActivityView,
  isActivityQuiz,
} from "@/components/lesson/activities";
import { MeshBackground } from "@/components/visual/mesh-background";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";
import { useCompleteLesson, useLesson, useStartLesson } from "@/hooks/use-lessons";
import type { LessonCompletionResponse } from "@/lib/api";

export default function LessonPlayer() {
  const { id } = useParams<{ id: string }>();
  const lessonId = id ? parseInt(id, 10) : undefined;
  const navigate = useNavigate();
  const { data: lesson, isLoading } = useLesson(lessonId);
  const startLesson = useStartLesson();
  const complete = useCompleteLesson();

  const [step, setStep] = useState(0);
  const [verified, setVerified] = useState(false);
  const [answered, setAnswered] = useState<{ correct: boolean } | null>(null);
  const [attemptForStep, setAttemptForStep] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [completion, setCompletion] = useState<LessonCompletionResponse | null>(
    null
  );

  useEffect(() => {
    if (lessonId && lesson) startLesson.mutate(lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  /**
   * Make lessons feel less rote: keep intros (intro_kanji, intro_vocab,
   * intro_grammar) in lesson-author order, but shuffle the practice block
   * (quiz / listening / write_* / speaking) and keep the summary last.
   * Shuffle once per lesson load — retries within an activity don't reshuffle.
   */
  const activities = useMemo(() => {
    const all = lesson?.activities ?? [];
    if (all.length === 0) return all;
    type A = (typeof all)[number];
    const isIntro = (a: A) =>
      a.kind === "intro_kanji" ||
      a.kind === "intro_vocab" ||
      a.kind === "intro_grammar";
    const isSummary = (a: A) => a.kind === "summary";
    const intros = all.filter(isIntro);
    const summaries = all.filter(isSummary);
    const practice = all.filter((a) => !isIntro(a) && !isSummary(a));
    for (let i = practice.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [practice[i], practice[j]] = [practice[j], practice[i]];
    }
    return [...intros, ...practice, ...summaries];
  }, [lesson]);
  const current = activities[step];
  const isLast = step >= activities.length - 1;
  const isQuiz = current ? isActivityQuiz(current) : false;
  const isSummary = current?.kind === "summary";

  if (isLoading || !lesson || !current) {
    return (
      <div className="relative grid h-screen w-screen place-items-center bg-background text-foreground">
        <MeshBackground />
        <p className="text-sm text-muted-foreground">読み込み中…</p>
      </div>
    );
  }

  if (completion) {
    return (
      <CompletionScreen
        completion={completion}
        lessonTitle={lesson.title}
        onBack={() => navigate("/")}
        onReplay={() => {
          setCompletion(null);
          setStep(0);
          setVerified(false);
          setAnswered(null);
          setAttemptForStep(0);
          setWrongAttempts(0);
          setFirstTryCorrect(0);
          setStartedAt(Date.now());
        }}
        onContinue={() => {
          if (completion.nextLessonId) {
            navigate(`/learn/${completion.nextLessonId}`, { replace: true });
            window.location.reload();
          } else {
            navigate("/learn");
          }
        }}
      />
    );
  }

  const totalQuizzes = activities.filter(isActivityQuiz).length;
  const progress = ((step + 1) / activities.length) * 100;

  const handleNext = async () => {
    if (isSummary) {
      const result = await complete.mutateAsync({
        lessonId: lesson.id,
        correctCount: firstTryCorrect,
        totalQuizzes,
        secondsSpent: Math.round((Date.now() - startedAt) / 1000),
      });
      setCompletion(result);
      burstXp();
      if (result.award.leveledUp) burstLevelUp();
      return;
    }

    if (isQuiz && !verified) {
      setVerified(true);
      if (current && answered !== null) {
        if (answered.correct && attemptForStep === 0) {
          setFirstTryCorrect((n) => n + 1);
        }
        if (!answered.correct) {
          setWrongAttempts((n) => n + 1);
        }
      }
      return;
    }

    // Retry path: verified but wrong → reset and try again
    if (isQuiz && verified && answered && !answered.correct) {
      setVerified(false);
      setAnswered(null);
      setAttemptForStep((n) => n + 1);
      return;
    }

    setVerified(false);
    setAnswered(null);
    setAttemptForStep(0);
    setStep((s) => s + 1);
  };

  const handleExit = () => {
    if (window.confirm("¿Salir de la lección? Tu progreso de hoy no se guardará.")) {
      navigate("/");
    }
  };

  let buttonLabel: string;
  let buttonDisabled = false;
  if (isSummary) {
    buttonLabel = complete.isPending ? "Guardando…" : "Terminar lección";
    buttonDisabled = complete.isPending;
  } else if (isQuiz) {
    if (!verified) {
      buttonLabel = "Verificar";
      buttonDisabled = answered === null;
    } else if (answered && !answered.correct) {
      buttonLabel = "Intentar de nuevo";
    } else {
      buttonLabel = isLast ? "Finalizar" : "Continuar";
    }
  } else {
    buttonLabel = isLast ? "Finalizar" : "Continuar";
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <MeshBackground />
      <div className="absolute inset-x-0 top-0 z-10 h-7" data-tauri-drag-region />

      <header className="relative z-10 flex items-center gap-4 px-8 pt-10">
        <Button variant="ghost" size="sm" onClick={handleExit}>
          <X className="size-3.5" /> Salir
        </Button>
        <div className="flex-1">
          <p className="font-jp text-[10px] tracking-[0.3em] text-muted-foreground">
            {lesson.jpTitle ?? "授業"}
          </p>
          <p className="text-sm font-semibold leading-tight">{lesson.title}</p>
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">
          {step + 1} / {activities.length}
        </p>
      </header>

      <div className="relative z-10 px-8 pt-3">
        <Progress value={progress} className="h-1" />
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto px-8 py-8">
        <AnimatePresence mode="wait">
          <ActivityView
            key={`${current.id}-${attemptForStep}`}
            activity={current}
            verified={verified}
            attempt={attemptForStep}
            onAnswer={(correct) => setAnswered({ correct })}
          />
        </AnimatePresence>
      </main>

      <footer className="relative z-10 px-8 pb-8 pt-4">
        <div className="mx-auto max-w-2xl space-y-3">
          {isQuiz && verified && answered ? (
            <div
              className={`rounded-xl px-4 py-2 text-center text-sm font-medium ${
                answered.correct
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive"
              }`}
            >
              {answered.correct
                ? "¡Correcto!"
                : attemptForStep === 0
                  ? "Casi — lee la explicación e inténtalo otra vez."
                  : `Intento ${attemptForStep + 1} — sigue tratando, ya casi.`}
            </div>
          ) : null}
          <Button
            size="xl"
            className="w-full bg-gradient-to-br from-primary via-primary to-neon-violet"
            disabled={buttonDisabled}
            onClick={handleNext}
          >
            {buttonLabel}
          </Button>
          {wrongAttempts > 0 && !isSummary ? (
            <p className="text-center text-[10px] text-muted-foreground">
              {wrongAttempts} {wrongAttempts === 1 ? "error" : "errores"} en esta lección
            </p>
          ) : null}
        </div>
      </footer>
    </div>
  );
}

function CompletionScreen({
  completion,
  lessonTitle,
  onBack,
  onReplay,
  onContinue,
}: {
  completion: LessonCompletionResponse;
  lessonTitle: string;
  onBack: () => void;
  onReplay: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="relative grid h-screen w-screen place-items-center bg-background text-foreground">
      <MeshBackground />
      <div className="relative z-10 w-full max-w-xl px-8">
        <div className="overflow-hidden rounded-3xl glass-strong p-10 text-center">
          <p className="font-jp text-xs tracking-[0.4em] text-primary">
            {completion.passed ? "合格" : "もう少し"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {completion.passed ? "¡Lección completada!" : "Casi"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{lessonTitle}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Metric label="Puntuación" value={`${completion.score}%`} />
            <Metric
              label="XP"
              value={`+${completion.award.xpAmount}`}
              icon={<Sparkles className="size-4 text-primary" />}
            />
          </div>

          {completion.award.starAmount > 0 ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-warning/15 px-3 py-1.5 text-sm font-medium text-warning">
              <Star className="size-4 fill-current" />
              +{completion.award.starAmount} estrellas
            </div>
          ) : null}

          {completion.award.leveledUp ? (
            <p className="mt-3 inline-block rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
              ¡Subiste al nivel {completion.award.newLevel}!
            </p>
          ) : null}

          {completion.award.completedDaily.length > 0 ||
          completion.award.completedWeekly.length > 0 ? (
            <div className="mt-5 space-y-1 rounded-xl bg-success/10 p-3 text-left text-xs text-success">
              {completion.award.completedDaily.map((m) => (
                <p key={`d-${m.id}`}>
                  <Check className="mr-1 inline size-3" /> Misión diaria: {m.title}
                </p>
              ))}
              {completion.award.completedWeekly.map((m) => (
                <p key={`w-${m.id}`}>
                  <Check className="mr-1 inline size-3" /> Misión semanal: {m.title}
                </p>
              ))}
            </div>
          ) : null}

          <div className="mt-7 grid grid-cols-3 gap-2">
            <Button variant="ghost" onClick={onBack}>
              Al inicio
            </Button>
            <Button variant="outline" onClick={onReplay}>
              <RotateCcw className="size-3.5" />
              Repetir
            </Button>
            <Button
              className="bg-gradient-to-br from-primary via-primary to-neon-violet"
              onClick={onContinue}
            >
              {completion.nextLessonId ? "Siguiente" : "Curso"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card/60 px-4 py-3">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
