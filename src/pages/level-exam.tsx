import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, PartyPopper, Trophy, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HudPanel } from "@/components/visual/hud-panel";
import { MeshBackground } from "@/components/visual/mesh-background";
import { JaSpeakButton } from "@/components/lesson/deep-dive";
import { useLevelExam, useCompleteLevelExam } from "@/hooks/use-exams";
import type { Activity, LevelExamResult } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ExamQuestion {
  jp?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  isAudio: boolean;
}

/** Normalize quiz/listening activities into a uniform MCQ question. */
function toQuestion(a: Activity): ExamQuestion | null {
  if (a.kind === "quiz") {
    return {
      jp: a.promptJp ?? undefined,
      prompt: a.prompt,
      options: a.options,
      correctIndex: a.correctIndex,
      isAudio: false,
    };
  }
  if (a.kind === "listening") {
    return {
      jp: a.textJp,
      prompt: a.prompt,
      options: a.options,
      correctIndex: a.correctIndex,
      isAudio: true,
    };
  }
  return null;
}

export default function LevelExamPage() {
  const { level = "N5" } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { data: exam, isLoading } = useLevelExam(level);
  const complete = useCompleteLevelExam();

  const questions = useMemo<ExamQuestion[]>(
    () => (exam?.activities ?? []).map(toQuestion).filter(Boolean) as ExamQuestion[],
    [exam]
  );

  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [result, setResult] = useState<LevelExamResult | null>(null);

  if (isLoading || !exam) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-sm text-muted-foreground">読み込み中…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm text-muted-foreground">
          Aún no hay suficientes preguntas para el examen final de {level}.
          Completa más lecciones primero.
        </p>
        <Button className="mt-5" onClick={() => navigate("/learn")}>
          Volver al curso
        </Button>
      </div>
    );
  }

  const total = questions.length;
  const current = questions[idx];

  const check = () => {
    if (selected === null) return;
    if (!checked) {
      if (selected === current.correctIndex) setCorrect((c) => c + 1);
      setChecked(true);
      return;
    }
    // advance
    if (idx + 1 >= total) {
      // `correct` already includes this question (counted on the Comprobar step).
      complete.mutate(
        {
          level,
          result: {
            lessonId: 0,
            correctCount: correct,
            totalQuizzes: total,
            secondsSpent: Math.round((Date.now() - startedAt) / 1000),
          },
        },
        { onSuccess: (r) => setResult(r) }
      );
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setChecked(false);
    }
  };

  // ---- Result screen -------------------------------------------------------
  if (result) {
    return (
      <div className="relative min-h-[70vh]">
        <MeshBackground />
        <div className="relative z-10 mx-auto max-w-lg py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className={cn(
                "mx-auto flex size-16 items-center justify-center rounded-2xl",
                result.passed
                  ? "bg-gradient-to-br from-success to-neon-cyan text-success-foreground"
                  : "bg-warning/20 text-warning"
              )}
            >
              {result.passed ? (
                <Trophy className="size-8" />
              ) : (
                <X className="size-8" />
              )}
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
              {result.passed ? "¡Examen aprobado!" : "No aprobado"}
            </h1>
            <p className="mt-2 text-5xl font-black tabular-nums">
              <span
                className={result.passed ? "text-success" : "text-warning"}
              >
                {result.score}%
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Necesitas {exam.passThreshold}% para aprobar el examen final de{" "}
              {level}.
            </p>

            {result.unlockedNext && result.nextLevel ? (
              <HudPanel glow className="mt-8 p-6">
                <PartyPopper className="mx-auto size-8 text-neon-cyan" />
                <p className="mt-3 font-jp text-xs tracking-[0.3em] text-neon-cyan">
                  レベルアップ
                </p>
                <h2 className="mt-1 font-display text-xl font-extrabold">
                  ¡Estás listo para el siguiente nivel!
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Desbloqueaste{" "}
                  <span className="font-bold text-neon-cyan">
                    {result.nextLevel}
                  </span>
                  . Aparecerá en tu curso.
                </p>
                <Button
                  size="lg"
                  className="mt-5 w-full"
                  onClick={() => navigate("/learn")}
                >
                  Comenzar con {result.nextLevel}
                  <ArrowRight className="size-4" />
                </Button>
              </HudPanel>
            ) : (
              <div className="mt-8 flex items-center justify-center gap-3">
                {!result.passed ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResult(null);
                      setIdx(0);
                      setCorrect(0);
                      setSelected(null);
                      setChecked(false);
                    }}
                  >
                    Reintentar
                  </Button>
                ) : null}
                <Button onClick={() => navigate("/learn")}>
                  Volver al curso
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // ---- Question flow -------------------------------------------------------
  const isCorrect = checked && selected === current.correctIndex;
  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            試験 · Examen final {level}
          </p>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {idx + 1} / {total}
          </p>
        </div>
        <Progress value={((idx + 1) / total) * 100} className="mt-2 h-1" />
      </div>

      <HudPanel glow className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
          >
            {current.jp ? (
              <div className="flex items-center justify-center gap-2">
                <p className="text-center font-jp text-3xl font-bold text-primary">
                  {current.jp}
                </p>
                {current.isAudio ? <JaSpeakButton text={current.jp} /> : null}
              </div>
            ) : null}
            <p className="mt-3 text-center text-lg font-medium">
              {current.prompt}
            </p>

            <div className="mt-6 grid gap-3">
              {current.options.map((opt, i) => {
                const state =
                  !checked
                    ? selected === i
                      ? "selected"
                      : "idle"
                    : i === current.correctIndex
                      ? "correct"
                      : selected === i
                        ? "wrong"
                        : "idle";
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={checked}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                      state === "idle" &&
                        "border-border/60 bg-card/40 hover:border-primary/40",
                      state === "selected" &&
                        "border-primary bg-primary/10 ring-1 ring-primary",
                      state === "correct" &&
                        "border-success bg-success/10 ring-1 ring-success",
                      state === "wrong" &&
                        "border-destructive bg-destructive/10 ring-1 ring-destructive"
                    )}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border text-xs">
                      {state === "correct" ? (
                        <Check className="size-3.5 text-success" />
                      ) : state === "wrong" ? (
                        <X className="size-3.5 text-destructive" />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span className="font-jp">{opt}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </HudPanel>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/learn")}>
          Salir
        </Button>
        {checked ? (
          <p
            className={cn(
              "text-sm font-medium",
              isCorrect ? "text-success" : "text-warning"
            )}
          >
            {isCorrect ? "¡Correcto!" : "Respuesta incorrecta"}
          </p>
        ) : null}
        <Button
          size="lg"
          disabled={selected === null || complete.isPending}
          onClick={check}
        >
          {!checked
            ? "Comprobar"
            : idx + 1 >= total
              ? complete.isPending
                ? "Calificando…"
                : "Ver resultado"
              : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}
