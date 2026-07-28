import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, GraduationCap, RotateCcw, Sparkles, Star, Trophy, X } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ActivityView,
  isActivityQuiz,
} from "@/components/lesson/activities";
import {
  BandIntro,
  DudasInterstitial,
  type BandKey,
  type DudaTopic,
} from "@/components/lesson/lesson-interstitials";
import { MeshBackground } from "@/components/visual/mesh-background";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";
import {
  useCompleteLesson,
  useLesson,
  useLessonExercises,
  useStartLesson,
} from "@/hooks/use-lessons";
import { api } from "@/lib/api";
import type { Activity, ExerciseDifficulty, LessonCompletionResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import { TitleBarDrag } from "@/components/layout/titlebar-drag";
import { useT } from "@/lib/i18n";
import { useTc } from "@/lib/content-i18n";

/** A single screen in the lesson flow. */
type Step =
  | { kind: "activity"; activity: Activity; difficulty?: ExerciseDifficulty }
  | { kind: "dudas"; topics: DudaTopic[] }
  | { kind: "band"; band: ExerciseDifficulty };

const EXPLANATION_KINDS = [
  "intro_kanji",
  "intro_vocab",
  "intro_grammar",
  "speaking",
  "write_kanji",
];

export default function LessonPlayer() {
  const t = useT();
  const tc = useTc();
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
  const [confirmingExit, setConfirmingExit] = useState(false);
  // When the user jumps from an exercise to "review this", remember which step
  // to return to so they don't have to walk back through the lesson.
  const [returnToStep, setReturnToStep] = useState<number | null>(null);
  // New seed per lesson entry → fresh, randomized exercises every time.
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1e9));
  const { data: generated } = useLessonExercises(lessonId, seed);

  // Reset all player state when navigating to a different lesson (no full page
  // reload — a reload used to reset the session store and re-prompt the PIN).
  useEffect(() => {
    setStep(0);
    setVerified(false);
    setAnswered(null);
    setAttemptForStep(0);
    setWrongAttempts(0);
    setFirstTryCorrect(0);
    setStartedAt(Date.now());
    setCompletion(null);
    setConfirmingExit(false);
    setReturnToStep(null);
    setSeed(Math.floor(Math.random() * 1e9));
    if (lessonId) startLesson.mutate(lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  /**
   * The lesson flow, split into two phases (point #4):
   *   1. EXPLANATION — intros + speaking + write_kanji (teach the material).
   *   2. A "¿Dudas?" gate, then 20 PROCEDURAL EXERCISES grouped into three
   *      difficulty bands (fácil → medio → difícil, point #5), each announced
   *      by a band intro. Generated server-side with a per-entry seed so the
   *      questions are randomized and never identical between users (point #2).
   * Summary stays last. While the exercises are still loading we just show the
   * explanation + summary; the tail is inserted the moment they arrive (local
   * SQLite, so effectively instant).
   */
  const steps = useMemo<Step[]>(() => {
    const all = lesson?.activities ?? [];
    if (all.length === 0) return [];
    const explanation = all.filter((a) => EXPLANATION_KINDS.includes(a.kind));
    const summaries = all.filter((a) => a.kind === "summary");

    const out: Step[] = explanation.map((activity) => ({
      kind: "activity",
      activity,
    }));

    // Build the exercise tail.
    const exerciseSteps: Step[] = [];
    if (generated && generated.length > 0) {
      let lastBand: ExerciseDifficulty | null = null;
      for (const g of generated) {
        if (g.difficulty !== lastBand) {
          exerciseSteps.push({ kind: "band", band: g.difficulty });
          lastBand = g.difficulty;
        }
        exerciseSteps.push({
          kind: "activity",
          activity: g.activity,
          difficulty: g.difficulty,
        });
      }
    } else if (generated && generated.length === 0) {
      // Generator returned nothing (rare) → fall back to the lesson's own
      // practice activities so the lesson still has exercises.
      for (const a of all.filter((x) => isActivityQuiz(x))) {
        exerciseSteps.push({ kind: "activity", activity: a });
      }
    }

    if (exerciseSteps.length > 0) {
      const topics: DudaTopic[] = [];
      out.forEach((s, idx) => {
        if (s.kind !== "activity") return;
        const a = s.activity;
        if (a.kind === "intro_kanji")
          topics.push({
            kind: "kanji",
            label: a.meaning,
            jp: a.kanjiChar,
            keywords: `${a.meaning} ${a.onyomi.join(" ")} ${a.kunyomi.join(" ")} kanji lectura`,
            stepIndex: idx,
            meaning: a.meaning,
            onyomi: a.onyomi,
            kunyomi: a.kunyomi,
            reading: a.kunyomi[0] ?? a.onyomi[0],
            exampleJp: a.example?.jp,
            exampleMeaning: a.example?.meaning,
          });
        else if (a.kind === "intro_vocab")
          topics.push({
            kind: "vocab",
            label: a.meaning,
            jp: a.word,
            keywords: `${a.meaning} ${a.reading} ${a.word} palabra vocabulario`,
            stepIndex: idx,
            meaning: a.meaning,
            reading: a.reading,
            exampleJp: a.example ?? undefined,
          });
        else if (a.kind === "intro_grammar")
          topics.push({
            kind: "grammar",
            label: a.title,
            jp: a.pattern,
            keywords: `${a.title} ${a.pattern} gramatica particula`,
            stepIndex: idx,
            pattern: a.pattern,
            explanation: a.explanation,
            exampleJp: a.example.jp,
            exampleMeaning: a.example.meaning,
          });
      });
      out.push({ kind: "dudas", topics });
      out.push(...exerciseSteps);
    }

    out.push(...summaries.map((activity) => ({ kind: "activity", activity } as Step)));
    return out;
  }, [lesson, generated]);

  const currentStep = steps[step];
  const current =
    currentStep?.kind === "activity" ? currentStep.activity : null;
  const isLast = step >= steps.length - 1;
  const isQuiz = current ? isActivityQuiz(current) : false;
  const isSummary = current?.kind === "summary";

  // Exercise numbering for the header ("Ejercicio 5 / 20").
  const exerciseSteps = steps.filter(
    (s) => s.kind === "activity" && s.difficulty
  );
  const totalExercises = exerciseSteps.length;
  const exerciseNumber =
    currentStep?.kind === "activity" && currentStep.difficulty
      ? steps
          .slice(0, step + 1)
          .filter((s) => s.kind === "activity" && s.difficulty).length
      : 0;

  // Map each taught item (kanji/word) to the step that explains it, so the
  // "Repasar" button can jump back instantly within this lesson.
  const learnIndex = useMemo(() => {
    const m = new Map<string, number>();
    steps.forEach((s, i) => {
      if (s.kind !== "activity") return;
      const a = s.activity;
      if (a.kind === "intro_kanji") m.set(a.kanjiChar, i);
      else if (a.kind === "intro_vocab") m.set(a.word, i);
    });
    return m;
  }, [steps]);

  if (isLoading || !lesson || !currentStep) {
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
          } else {
            navigate("/learn");
          }
        }}
        onExam={() => navigate(`/exam/${completion.unitId}`)}
        onReview={() => navigate("/learn")}
      />
    );
  }

  const totalQuizzes = steps.filter(
    (s) => s.kind === "activity" && isActivityQuiz(s.activity)
  ).length;
  const progress = ((step + 1) / steps.length) * 100;

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

  // Jump to learn a kanji/word: instantly to its explanation in THIS lesson if
  // present, otherwise navigate to the lesson elsewhere that teaches it.
  const handleLearn = (target: string) => {
    const idx = learnIndex.get(target);
    if (idx !== undefined) {
      setReturnToStep(step); // remember the exercise to come back to
      setVerified(false);
      setAnswered(null);
      setAttemptForStep(0);
      setStep(idx);
      return;
    }
    api
      .findLessonForKanji(target)
      .then((ref) => {
        if (ref && ref.lessonId !== lesson.id) navigate(`/learn/${ref.lessonId}`);
      })
      .catch(() => {});
  };

  const handleExit = () => setConfirmingExit(true);

  const handleBack = () => {
    if (step === 0) return;
    setVerified(false);
    setAnswered(null);
    setAttemptForStep(0);
    setStep((s) => Math.max(0, s - 1));
  };

  let buttonLabel: string;
  let buttonJp = "次へ";
  let buttonDisabled = false;
  let buttonIcon: React.ReactNode = <ArrowRight className="size-5" />;
  if (isSummary) {
    buttonLabel = complete.isPending
      ? t("lesson.btn.saving")
      : t("lesson.btn.endLesson");
    buttonJp = "完了";
    buttonDisabled = complete.isPending;
    buttonIcon = <Trophy className="size-5" />;
  } else if (isQuiz) {
    if (!verified) {
      buttonLabel = t("lesson.btn.check");
      buttonJp = "確認";
      buttonDisabled = answered === null;
      buttonIcon = <Check className="size-5" />;
    } else if (answered && !answered.correct) {
      buttonLabel = t("lesson.btn.retry");
      buttonJp = "再挑戦";
      buttonIcon = <RotateCcw className="size-5" />;
    } else {
      buttonLabel = isLast ? t("lesson.btn.finish") : t("lesson.btn.continue");
      buttonJp = isLast ? "完了" : "次へ";
    }
  } else if (currentStep.kind === "dudas") {
    buttonLabel = t("lesson.btn.startExercises");
    buttonJp = "始める";
  } else if (currentStep.kind === "band") {
    buttonLabel = t("lesson.btn.letsGo");
    buttonJp = "よし";
  } else {
    buttonLabel = isLast ? t("lesson.btn.finish") : t("lesson.btn.continue");
    buttonJp = isLast ? "完了" : "次へ";
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <MeshBackground />
      <div aria-hidden className="holo-grid pointer-events-none absolute inset-0 z-0 opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 [background:radial-gradient(circle_at_50%_-10%,color-mix(in_oklch,var(--color-primary)_12%,transparent)_0%,transparent_55%)]"
      />
      <TitleBarDrag className="absolute left-20 right-0 top-0 z-30 h-9" />

      <header className="relative z-10 flex items-center gap-2 px-8 pt-10">
        <Button variant="ghost" size="sm" onClick={handleExit}>
          <X className="size-3.5" /> {t("common.exit")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={step === 0}
          onClick={handleBack}
          title={t("common.back")}
        >
          <ArrowLeft className="size-3.5" /> {t("common.back")}
        </Button>
        <div className="ml-2 flex-1">
          <p className="font-jp text-[10px] tracking-[0.3em] text-muted-foreground">
            {lesson.jpTitle ?? "授業"}
          </p>
          <p className="font-display text-sm font-bold leading-tight">{tc(lesson.title)}</p>
        </div>
        {exerciseNumber > 0 ? (
          <p className="font-mono text-xs tabular-nums text-neon-cyan/80">
            {t("lesson.exercise", { n: exerciseNumber, total: totalExercises })}
          </p>
        ) : (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-cyan/70">
            {t("lesson.learn")}
          </p>
        )}
      </header>

      <div className="relative z-10 px-8 pt-3">
        <Progress value={progress} className="h-1" />
      </div>

      {/* "Volver a la pregunta" — appears after you jump to review an item, so
          you return straight to the exercise instead of walking the lesson. */}
      {returnToStep !== null && step !== returnToStep ? (
        <div className="pointer-events-none absolute left-1/2 top-20 z-30 -translate-x-1/2">
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              setVerified(false);
              setAnswered(null);
              setAttemptForStep(0);
              setStep(returnToStep);
              setReturnToStep(null);
            }}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-neon-cyan/40 bg-background/80 px-4 py-2 text-sm font-semibold text-neon-cyan shadow-lg backdrop-blur-md transition-colors hover:bg-neon-cyan/15"
          >
            <ArrowLeft className="size-4" />
            {steps[returnToStep]?.kind === "dudas"
              ? "Volver a las dudas"
              : "Volver a la pregunta"}
          </motion.button>
        </div>
      ) : null}

      <main className="relative z-10 flex-1 overflow-y-auto px-8 pt-8 pb-28">
        <div className="flex min-h-full items-center justify-center">
          <AnimatePresence mode="wait">
            {currentStep.kind === "activity" && current ? (
              <ActivityView
                key={`${current.id}-${attemptForStep}`}
                activity={current}
                verified={verified}
                attempt={attemptForStep}
                onAnswer={(correct) => setAnswered({ correct })}
                onLearn={handleLearn}
              />
            ) : currentStep.kind === "dudas" ? (
              <DudasInterstitial
                key="dudas"
                topics={currentStep.topics}
                onJump={(target) => {
                  setReturnToStep(step); // remember the dudas slide
                  setVerified(false);
                  setAnswered(null);
                  setAttemptForStep(0);
                  setStep(target);
                }}
              />
            ) : currentStep.kind === "band" ? (
              <BandIntro key={`band-${currentStep.band}`} band={currentStep.band as BandKey} />
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom-left status: quiz feedback pill, or a subtle error counter */}
      <div className="pointer-events-none absolute bottom-7 left-8 z-30 max-w-[55%]">
        {isQuiz && verified && answered ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md ring-1",
              answered.correct
                ? "bg-success/20 text-success ring-success/40"
                : "bg-destructive/20 text-destructive ring-destructive/40"
            )}
          >
            {answered.correct
              ? "¡Correcto!"
              : attemptForStep === 0
                ? "Casi — lee la explicación e inténtalo otra vez."
                : `Intento ${attemptForStep + 1} — sigue tratando, ya casi.`}
          </motion.div>
        ) : wrongAttempts > 0 && !isSummary ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {wrongAttempts} {wrongAttempts === 1 ? "error" : "errores"} en esta lección
          </p>
        ) : null}
      </div>

      {/* Floating action button — bottom-right corner, frees the center */}
      <motion.div
        whileTap={{ scale: buttonDisabled ? 1 : 0.95 }}
        className="group absolute bottom-6 right-6 z-30"
      >
        {/* Outer pulsing neon glow (behind, not clipped) */}
        {!buttonDisabled ? (
          <span
            aria-hidden
            className="animate-glow-pulse absolute -inset-1 bg-gradient-to-r from-neon-violet via-primary to-neon-cyan opacity-50 blur-lg transition-opacity duration-300 group-hover:opacity-80"
          />
        ) : null}
        <Button
          size="xl"
          className={cn(
            "cta-clip relative h-14 overflow-hidden rounded-none px-6 bg-gradient-to-r from-neon-violet via-primary to-neon-cyan text-background transition-all",
            !buttonDisabled && "hover:brightness-110"
          )}
          disabled={buttonDisabled}
          onClick={handleNext}
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-white/70"
          />
          {!buttonDisabled ? (
            <span className="shimmer pointer-events-none absolute inset-0 opacity-40" />
          ) : null}
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 size-2 border-r-2 border-t-2 border-background/40"
          />
          <span
            aria-hidden
            className="absolute bottom-1.5 left-1.5 size-2 border-b-2 border-l-2 border-background/40"
          />
          <span className="relative flex flex-col items-center leading-none">
            <span className="flex items-center gap-2 text-sm font-extrabold tracking-wide">
              {buttonLabel}
              {buttonIcon}
            </span>
            <span className="mt-0.5 font-mono text-[10px] font-semibold tracking-[0.3em] opacity-75">
              {buttonJp}
            </span>
          </span>
        </Button>
      </motion.div>

      {/* Custom exit confirmation modal (window.confirm doesn't render in
          Tauri's WKWebView, so we ship our own). */}
      {confirmingExit ? (
        <div className="absolute inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm">
          <div className="mx-8 w-full max-w-sm rounded-2xl glass-strong p-6 text-center">
            <p className="font-jp text-[10px] tracking-[0.4em] text-muted-foreground">
              確認
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              ¿Salir de la lección?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Lo que respondiste en esta sesión no contará para tu puntuación
              final si sales ahora.
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
                onClick={() => navigate("/")}
              >
                <X className="size-3.5" /> Salir
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CompletionScreen({
  completion,
  lessonTitle,
  onBack,
  onReplay,
  onContinue,
  onExam,
  onReview,
}: {
  completion: LessonCompletionResponse;
  lessonTitle: string;
  onBack: () => void;
  onReplay: () => void;
  onContinue: () => void;
  onExam: () => void;
  onReview: () => void;
}) {
  // Finishing the LAST lesson of a unit → celebrate the whole unit and offer the
  // two choices Rodrigo asked for: review a lesson, or take the unit exam.
  const unitDone = completion.passed && completion.unitCompleted;
  return (
    <div className="relative grid h-screen w-screen place-items-center bg-background text-foreground">
      <MeshBackground />
      <div className="relative z-10 w-full max-w-xl px-8">
        <div className="overflow-hidden rounded-3xl glass-strong p-10 text-center">
          <p className="font-jp text-xs tracking-[0.4em] text-primary">
            {unitDone ? "単元クリア" : completion.passed ? "合格" : "もう少し"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {unitDone
              ? "¡Completaste la unidad!"
              : completion.passed
                ? "¡Lección completada!"
                : "Casi"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {unitDone
              ? "Terminaste todas las lecciones de esta unidad. ¿Qué quieres hacer?"
              : lessonTitle}
          </p>

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

          {unitDone ? (
            <div className="mt-7 space-y-2">
              <Button
                size="lg"
                className="w-full bg-gradient-to-br from-streak via-warning to-neon-amber text-warning-foreground"
                onClick={onExam}
              >
                <GraduationCap className="size-4" />
                Tomar el examen final de la unidad
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={onReview}
              >
                <RotateCcw className="size-3.5" />
                Repasar una lección
              </Button>
              <Button variant="ghost" className="w-full" onClick={onBack}>
                Al inicio
              </Button>
            </div>
          ) : (
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
          )}
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
