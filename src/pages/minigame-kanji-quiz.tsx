import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Play, Puzzle, RotateCcw, Sparkles, Star, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";
import { GameSummary } from "@/components/play/game-summary";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { HudPanel } from "@/components/visual/hud-panel";
import { useMinigameBest, useRecordMinigameScore } from "@/hooks/use-minigames";
import { useKanjiList } from "@/hooks/use-kanji";
import { useUserProfile } from "@/hooks/use-user-profile";
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  type Difficulty,
  KANJI_QUIZ_CONFIG,
  difficultyBonusPercent,
  isDailyFeatured,
  isWeeklyFeatured,
} from "@/lib/minigames";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useTc } from "@/lib/content-i18n";

interface Item {
  char: string;
  meaning: string;
}

function pickQuestion(pool: Item[], currentChar: string | null) {
  let candidate: Item;
  do {
    candidate = pool[Math.floor(Math.random() * pool.length)];
  } while (candidate.char === currentChar && pool.length > 1);

  const wrong = new Set<string>();
  let guard = 0;
  while (wrong.size < 3 && guard < 200) {
    guard++;
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (c.meaning !== candidate.meaning) wrong.add(c.meaning);
  }
  const options = [candidate.meaning, ...wrong];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { char: candidate.char, correct: candidate.meaning, options };
}

type Phase = "idle" | "playing" | "done";

export default function KanjiQuizGame() {
  const t = useT();
  const tc = useTc();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const difficulty: Difficulty =
    (searchParams.get("d") as Difficulty) || "medium";
  const config = KANJI_QUIZ_CONFIG[difficulty];
  const gameKey = `kanji_quiz_${difficulty}`;
  const featuredDailyBonus = isDailyFeatured("kanji_quiz") ? 1.25 : 1.0;
  const featuredWeeklyBonus = isWeeklyFeatured("kanji_quiz") ? 1.5 : 1.0;

  const { data: profile } = useUserProfile();
  const { data: list } = useKanjiList(profile?.currentLevel ?? "N5");

  const pool = useMemo<Item[]>(() => {
    const seen = new Set<string>();
    const out: Item[] = [];
    for (const it of list ?? []) {
      const meaning = it.kanji.meaningEs?.split(/[,/]/)[0]?.trim();
      if (it.kanji.character && meaning && !seen.has(meaning)) {
        seen.add(meaning);
        out.push({ char: it.kanji.character, meaning });
      }
    }
    return out;
  }, [list]);

  const { data: best } = useMinigameBest(gameKey);
  const record = useRecordMinigameScore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState<number>(config.seconds);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [question, setQuestion] = useState<ReturnType<typeof pickQuestion> | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [submitted, setSubmitted] = useState<{
    xp: number;
    stars: number;
    newBest: boolean;
    bestScore: number;
  } | null>(null);

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      setPhase("done");
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== "done" || submitted) return;
    const multiplier = featuredDailyBonus * featuredWeeklyBonus;
    const finalScore = Math.round(score * multiplier);
    record
      .mutateAsync({ gameKey, score: finalScore, durationSeconds: config.seconds })
      .then((res) => {
        setSubmitted({
          xp: res.award.xpAmount,
          stars: res.award.starAmount,
          newBest: res.newBest,
          bestScore: res.bestScore,
        });
        if (finalScore > 0) burstXp();
        if (res.award.leveledUp) burstLevelUp();
      });
  }, [phase, submitted, score, record, gameKey, config.seconds, featuredDailyBonus, featuredWeeklyBonus]);

  const start = () => {
    if (pool.length < 4) return;
    setScore(0);
    setCombo(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(config.seconds);
    setQuestion(pickQuestion(pool, null));
    setPicked(null);
    setFeedback(null);
    setSubmitted(null);
    setPhase("playing");
  };

  const answer = (opt: string) => {
    if (!question || picked) return;
    setPicked(opt);
    if (opt === question.correct) {
      const points = 1 + Math.floor(combo / 5);
      setScore((s) => s + points);
      setCombo((c) => c + 1);
      setCorrectCount((n) => n + 1);
      setFeedback("ok");
    } else {
      setCombo(0);
      setWrongCount((n) => n + 1);
      setFeedback("bad");
    }
    setTimeout(() => {
      setQuestion(pickQuestion(pool, question.char));
      setPicked(null);
      setFeedback(null);
    }, 320);
  };

  const pct = useMemo(
    () => (timeLeft / config.seconds) * 100,
    [timeLeft, config.seconds]
  );

  if (phase === "idle") {
    return (
      <IntroCard
        best={best ?? 0}
        ready={pool.length >= 4}
        onStart={start}
        onExit={() => navigate("/play")}
      />
    );
  }

  if (phase === "done" && submitted) {
    return (
      <ResultCard
        score={score}
        bestScore={submitted.bestScore}
        newBest={submitted.newBest}
        xp={submitted.xp}
        stars={submitted.stars}
        correct={correctCount}
        wrong={wrongCount}
        onPlayAgain={start}
        onExit={() => navigate("/play")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setPhase("idle")}>
          <ArrowLeft className="size-3.5" /> {t("common.cancel")}
        </Button>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="text-[10px]">
            <span className={DIFFICULTY_COLORS[difficulty]}>
              {tc(DIFFICULTY_LABELS[difficulty])}
            </span>
          </Badge>
          {isDailyFeatured("kanji_quiz") || isWeeklyFeatured("kanji_quiz") ? (
            <Badge variant="warning" className="text-[10px]">
              +{difficultyBonusPercent(difficulty)}% XP
            </Badge>
          ) : null}
          <span className="font-mono text-neon-cyan">{t("mg.points")}: {score}</span>
          {combo >= 3 ? (
            <motion.span
              key={combo}
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              className="rounded-full border border-neon-amber/40 bg-neon-amber/15 px-2 py-0.5 font-mono uppercase tracking-wider text-neon-amber shadow-[0_0_16px_-4px_color-mix(in_oklch,var(--color-neon-amber)_70%,transparent)]"
            >
              x{combo} combo
            </motion.span>
          ) : null}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
          <span className="font-jp tracking-[0.2em]">漢字クイズ · {tc(config.label)}</span>
          <span className="tabular-nums">{timeLeft}s</span>
        </div>
        <Progress
          value={pct}
          className={cn("mt-1 h-1.5", pct < 30 && "[&>div]:bg-destructive")}
        />
      </div>

      <HudPanel
        glow
        className={cn(
          "grid h-64 place-items-center transition-colors",
          feedback === "ok" && "bg-success/10",
          feedback === "bad" && "bg-destructive/10"
        )}
      >
        <div className="relative grid size-full place-items-center [perspective:1000px]">
          <div className="pointer-events-none absolute inset-0 holo-grid opacity-40" />
          <AnimatePresence mode="wait">
            {question ? (
              <motion.span
                key={question.char}
                initial={{ opacity: 0, scale: 0.85, y: 12, rotateX: -25 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -12, rotateX: 25 }}
                transition={{ duration: 0.18 }}
                className="relative z-10 font-jp text-[9rem] leading-none text-primary [text-shadow:0_0_28px_color-mix(in_oklch,var(--color-primary)_70%,transparent),0_0_60px_color-mix(in_oklch,var(--color-neon-violet)_45%,transparent)]"
              >
                {question.char}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </HudPanel>

      <div className="grid grid-cols-2 gap-3">
        {question?.options.map((opt) => {
          const isCorrect = opt === question.correct;
          const isPicked = picked === opt;
          return (
            <Button
              key={opt}
              size="xl"
              variant="outline"
              disabled={picked !== null}
              className={cn(
                "h-16 border-primary/30 text-base font-semibold transition-all hover:border-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan hover:shadow-[0_0_24px_-6px_color-mix(in_oklch,var(--color-neon-cyan)_70%,transparent)]",
                picked && isCorrect && "border-success bg-success/15 text-success shadow-[0_0_24px_-6px_color-mix(in_oklch,var(--color-success)_75%,transparent)]",
                isPicked && !isCorrect && "border-destructive bg-destructive/15 text-destructive"
              )}
              onClick={() => answer(opt)}
            >
              {tc(opt)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function IntroCard({
  best,
  ready,
  onStart,
  onExit,
}: {
  best: number;
  ready: boolean;
  onStart: () => void;
  onExit: () => void;
}) {
  const t = useT();
  return (
    <div className="mx-auto max-w-md py-8">
      <HudPanel glow className="p-8 text-center">
        <div className="relative">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="animate-holo-float mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan via-primary to-success text-primary-foreground shadow-[0_0_30px_-6px_color-mix(in_oklch,var(--color-neon-cyan)_75%,transparent)]"
          >
            <Puzzle className="size-7" />
          </motion.div>
          <p className="mt-4 font-jp text-[11px] tracking-[0.4em] text-neon-cyan">
            漢字クイズ
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
            Kanji Quiz
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("mg.quiz.intro")}
          </p>
          {best > 0 ? (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-neon-amber/40 bg-warning/15 px-3 py-1.5 text-sm text-neon-amber">
              <Trophy className="size-3.5" /> {t("mg.yourRecordN", { n: best })}
            </p>
          ) : null}
          {!ready ? (
            <p className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
              {t("mg.quiz.needMore")}
            </p>
          ) : null}
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onExit}>
              {t("common.exit")}
            </Button>
            <Button
              className="flex-1 bg-gradient-to-br from-neon-cyan to-primary text-primary-foreground shadow-[0_0_24px_-6px_color-mix(in_oklch,var(--color-neon-cyan)_70%,transparent)]"
              disabled={!ready}
              onClick={onStart}
            >
              <Play className="size-4" />
              {t("mg.start")}
            </Button>
          </div>
        </div>
      </HudPanel>
    </div>
  );
}

function ResultCard({
  score,
  bestScore,
  newBest,
  xp,
  stars,
  correct,
  wrong,
  onPlayAgain,
  onExit,
}: {
  score: number;
  bestScore: number;
  newBest: boolean;
  xp: number;
  stars: number;
  correct: number;
  wrong: number;
  onPlayAgain: () => void;
  onExit: () => void;
}) {
  const t = useT();
  return (
    <div className="mx-auto max-w-md py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <HudPanel glow className="p-8 text-center">
          <div className="relative">
            {newBest ? (
              <div className="mb-2 flex justify-center">
                <HoloKanji
                  size={150}
                  interval={2400}
                  items={[{ char: "新", meaning: "Nuevo récord" }]}
                />
              </div>
            ) : null}
            <p className="font-jp text-xs tracking-[0.4em] text-neon-cyan">時間切れ</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
              {t("mg.timeUp")}
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-primary/20 glass px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
                  {t("mg.score")}
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums">{score}</p>
              </div>
              <div className="rounded-xl border border-primary/20 glass px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
                  {newBest ? t("mg.newRecord") : t("mg.yourRecord")}
                </p>
                <p
                  className={cn(
                    "mt-1 text-3xl font-bold tabular-nums",
                    newBest && "text-neon-amber"
                  )}
                >
                  {bestScore}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-neon-cyan">
                <Sparkles className="size-3.5" /> +{xp} XP
              </div>
              {stars > 0 ? (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-neon-amber/40 bg-warning/15 px-3 py-1.5 text-sm text-neon-amber">
                  <Star className="size-3.5 fill-current" /> +{stars}
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <GameSummary correct={correct} wrong={wrong} />
            </div>

            <div className="mt-7 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onExit}>
                {t("common.exit")}
              </Button>
              <Button className="flex-1" onClick={onPlayAgain}>
                <RotateCcw className="size-3.5" />
                {t("mg.anotherRound")}
              </Button>
            </div>
          </div>
        </HudPanel>
      </motion.div>
    </div>
  );
}
