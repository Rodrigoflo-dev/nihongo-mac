import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { RomajiLine } from "@/components/lesson/romaji-line";
import {
  useGrammarLesson,
  useStartGrammarLesson,
  useSubmitGrammarQuiz,
} from "@/hooks/use-grammar";
import type { GrammarLesson, GrammarQuizResult } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useTc } from "@/lib/content-i18n";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";

type Phase = "lesson" | "quiz" | "result";

export default function GrammarLessonPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = id ? parseInt(id, 10) : undefined;
  const navigate = useNavigate();
  const { data: lesson } = useGrammarLesson(lessonId);
  const start = useStartGrammarLesson();
  const submit = useSubmitGrammarQuiz();

  const [phase, setPhase] = useState<Phase>("lesson");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questionIdx, setQuestionIdx] = useState(0);
  const [result, setResult] = useState<GrammarQuizResult | null>(null);

  useEffect(() => {
    if (lessonId && lesson && lesson.status === "new") {
      start.mutate(lessonId);
    }
  }, [lessonId, lesson?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!lesson) {
    return (
      <div className="grid h-full place-items-center">
        <p className="text-sm text-muted-foreground">読み込み中…</p>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <ResultView
        lesson={lesson}
        result={result}
        onRetry={() => {
          setAnswers({});
          setQuestionIdx(0);
          setResult(null);
          setPhase("quiz");
        }}
        onDone={() => navigate("/grammar")}
      />
    );
  }

  if (phase === "quiz") {
    return (
      <QuizView
        lesson={lesson}
        questionIdx={questionIdx}
        answers={answers}
        onSelect={(qid, idx) => {
          setAnswers((a) => ({ ...a, [qid]: idx }));
        }}
        onNext={() => setQuestionIdx((i) => i + 1)}
        onSubmit={async () => {
          if (!lessonId) return;
          const r = await submit.mutateAsync({
            lessonId,
            submission: {
              answers: Object.entries(answers).map(([qid, idx]) => ({
                questionId: qid,
                optionIndex: idx,
              })),
            },
          });
          setResult(r);
          if (r.passed) burstXp();
          if (r.award.leveledUp) burstLevelUp();
          setPhase("result");
        }}
        submitting={submit.isPending}
      />
    );
  }

  return (
    <LessonView
      lesson={lesson}
      onStartQuiz={() => setPhase("quiz")}
      onExit={() => navigate("/grammar")}
    />
  );
}

// ---------------------------------------------------------------------------

function LessonView({
  lesson,
  onStartQuiz,
  onExit,
}: {
  lesson: GrammarLesson;
  onStartQuiz: () => void;
  onExit: () => void;
}) {
  const t = useT();
  const tc = useTc();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-3xl space-y-8"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <X className="size-3.5" /> Salir
        </Button>
        <Badge variant="outline" className="font-mono text-[10px]">
          {lesson.jlptLevel} · #{lesson.ordering}
        </Badge>
      </div>

      <HudPanel glow className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0 space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              <span className="font-jp">
                {lesson.structure ?? (lesson.category ? tc(lesson.category) : t("grammar.fallbackCategory"))}
              </span>
            </p>
            <h1 className="text-balance font-display text-3xl font-extrabold leading-tight tracking-tight">
              {tc(lesson.title)}
            </h1>
          </div>
          <HoloKanji
            size={150}
            className="hidden shrink-0 sm:block"
            items={[
              { char: "文", meaning: "Gramática" },
              { char: "法", meaning: "Regla" },
            ]}
          />
        </div>
      </HudPanel>

      <article className="prose-sm max-w-none text-sm leading-relaxed text-foreground">
        {tc(lesson.explanationMd).replace(/\\n/g, "\n").split("\n").map((line, i) => {
          if (line.startsWith("## ")) {
            return (
              <h2
                key={i}
                className="mt-6 font-display text-lg font-extrabold tracking-tight first:mt-0"
              >
                {line.replace("## ", "")}
              </h2>
            );
          }
          if (line.startsWith("> ")) {
            return (
              <blockquote
                key={i}
                className="my-3 rounded-lg border-l-2 border-neon-cyan bg-primary/5 px-4 py-2 font-jp text-base shadow-[inset_0_0_24px_-16px_color-mix(in_oklch,var(--color-neon-cyan)_70%,transparent)]"
              >
                {line.replace("> ", "")}
              </blockquote>
            );
          }
          if (line.startsWith("- ")) {
            return (
              <p key={i} className="ml-4 list-disc text-muted-foreground">
                • {line.replace("- ", "")}
              </p>
            );
          }
          if (line.trim() === "") return <div key={i} className="h-2" />;
          return (
            <p key={i} className="text-muted-foreground">
              {renderInline(line)}
            </p>
          );
        })}
      </article>

      <section className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
          {t("glesson.examples")}
        </p>
        <div className="space-y-2">
          {lesson.examples.map((ex) => (
            <motion.div
              key={ex.jp}
              whileHover={{ x: 3 }}
              className="rounded-xl border-l-2 border-primary/50 glass px-4 py-3 transition-all hover:border-neon-cyan hover:shadow-[0_0_24px_-12px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]"
            >
              <p className="font-jp text-lg leading-snug">{ex.jp}</p>
              <p className="font-jp text-xs text-muted-foreground">
                {ex.reading}
              </p>
              <RomajiLine reading={ex.reading} />
              <p className="mt-1 text-sm text-muted-foreground">{tc(ex.meaning)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Button
        size="xl"
        className="w-full bg-gradient-to-br from-primary via-primary to-neon-violet shadow-[0_0_40px_-12px_color-mix(in_oklch,var(--color-primary)_70%,transparent)]"
        onClick={onStartQuiz}
      >
        <Sparkles className="size-4" /> {t("glesson.startQuiz", { n: lesson.quiz.length })}
      </Button>
    </motion.div>
  );
}

function renderInline(line: string) {
  // Very small inline markdown: bold and inline code
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line))) {
    if (m.index > lastIndex) {
      parts.push(line.slice(lastIndex, m.index));
    }
    if (m[1]) {
      parts.push(
        <strong key={`b-${m.index}`} className="text-foreground">
          {m[1]}
        </strong>
      );
    } else if (m[2]) {
      parts.push(
        <code
          key={`c-${m.index}`}
          className="rounded bg-secondary px-1.5 py-0.5 font-jp"
        >
          {m[2]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return parts;
}

// ---------------------------------------------------------------------------

function QuizView({
  lesson,
  questionIdx,
  answers,
  onSelect,
  onNext,
  onSubmit,
  submitting,
}: {
  lesson: GrammarLesson;
  questionIdx: number;
  answers: Record<string, number>;
  onSelect: (qid: string, idx: number) => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const t = useT();
  const tc = useTc();
  const q = lesson.quiz[questionIdx];
  const total = lesson.quiz.length;
  const isLast = questionIdx === total - 1;
  const selected = answers[q.id];
  const canAdvance = selected !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl space-y-8"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            {t("glesson.quizProgress", { n: questionIdx + 1, total })}
          </p>
          <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
            {tc(lesson.title)}
          </Badge>
        </div>
        <Progress
          value={((questionIdx + 1) / total) * 100}
          className="h-1"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="space-y-2 text-center">
            {q.promptJp ? (
              <p className="font-jp text-3xl leading-tight tracking-tight">
                {q.promptJp}
              </p>
            ) : null}
            <p className="text-balance text-lg font-semibold leading-snug">
              {tc(q.prompt)}
            </p>
          </div>

          <div className="grid gap-3">
            {q.options.map((opt, idx) => (
              <motion.button
                key={idx}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelect(q.id, idx)}
                className={cn(
                  "rounded-xl border bg-card/60 px-5 py-4 text-left transition-all",
                  "hover:border-primary/40 hover:bg-accent/40 hover:shadow-[0_0_24px_-12px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]",
                  selected === idx &&
                    "border-neon-cyan bg-primary/5 ring-2 ring-neon-cyan/30 shadow-[0_0_28px_-10px_color-mix(in_oklch,var(--color-neon-cyan)_65%,transparent)]"
                )}
              >
                <span className="font-jp text-base">{tc(opt.text)}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <Button
        size="xl"
        className="w-full"
        disabled={!canAdvance || submitting}
        onClick={() => {
          if (isLast) onSubmit();
          else onNext();
        }}
      >
        {isLast ? (submitting ? t("glesson.grading") : t("glesson.submit")) : t("common.next")}
      </Button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------

function ResultView({
  lesson,
  result,
  onRetry,
  onDone,
}: {
  lesson: GrammarLesson;
  result: GrammarQuizResult;
  onRetry: () => void;
  onDone: () => void;
}) {
  const t = useT();
  const tc = useTc();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto grid h-full max-w-lg place-items-center"
    >
      <HudPanel glow className="w-full p-10 text-center">
        <p className="font-jp text-xs tracking-[0.4em] text-neon-cyan">
          {result.passed ? "合格" : "もう一度"}
        </p>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
          {result.passed ? (
            <span className="gradient-text">{t("glesson.mastered")}</span>
          ) : (
            t("glesson.almost")
          )}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {tc(lesson.title)}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Metric
            label={t("glesson.score")}
            value={`${Math.round(result.score)}%`}
            tone={result.passed ? "success" : "warning"}
          />
          <Metric
            label={t("glesson.correct")}
            value={`${result.correct} / ${result.total}`}
          />
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary shadow-[0_0_24px_-8px_color-mix(in_oklch,var(--color-primary)_70%,transparent)]">
          <Sparkles className="size-4" />
          +{result.award.xpAmount} XP
        </div>

        {result.award.leveledUp ? (
          <p className="mt-2 text-sm font-semibold gradient-text">
            {t("glesson.leveledUp", { n: result.award.newLevel })}
          </p>
        ) : null}

        <div className="mt-7 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onRetry}>
            {t("glesson.retry")}
          </Button>
          <Button className="flex-1" onClick={onDone}>
            <Check className="size-4" /> {t("glesson.done")}
          </Button>
        </div>
      </HudPanel>
    </motion.div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  return (
    <div className="rounded-xl border bg-card/50 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan/70">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-xl font-extrabold tabular-nums",
          tone === "success" && "text-success",
          tone === "warning" && "text-neon-amber"
        )}
      >
        {value}
      </p>
    </div>
  );
}
