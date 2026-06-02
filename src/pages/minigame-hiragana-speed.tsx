import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Play, RotateCcw, Sparkles, Star, Trophy, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";
import { useMinigameBest, useRecordMinigameScore } from "@/hooks/use-minigames";
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  type Difficulty,
  HIRAGANA_SPEED_CONFIG,
  difficultyBonusPercent,
  isDailyFeatured,
  isWeeklyFeatured,
} from "@/lib/minigames";
import { cn } from "@/lib/utils";

const BASIC_HIRAGANA: { kana: string; romaji: string }[] = [
  { kana: "あ", romaji: "a" },
  { kana: "い", romaji: "i" },
  { kana: "う", romaji: "u" },
  { kana: "え", romaji: "e" },
  { kana: "お", romaji: "o" },
  { kana: "か", romaji: "ka" },
  { kana: "き", romaji: "ki" },
  { kana: "く", romaji: "ku" },
  { kana: "け", romaji: "ke" },
  { kana: "こ", romaji: "ko" },
  { kana: "さ", romaji: "sa" },
  { kana: "し", romaji: "shi" },
  { kana: "す", romaji: "su" },
  { kana: "せ", romaji: "se" },
  { kana: "そ", romaji: "so" },
  { kana: "た", romaji: "ta" },
  { kana: "ち", romaji: "chi" },
  { kana: "つ", romaji: "tsu" },
  { kana: "て", romaji: "te" },
  { kana: "と", romaji: "to" },
  { kana: "な", romaji: "na" },
  { kana: "に", romaji: "ni" },
  { kana: "ぬ", romaji: "nu" },
  { kana: "ね", romaji: "ne" },
  { kana: "の", romaji: "no" },
  { kana: "は", romaji: "ha" },
  { kana: "ひ", romaji: "hi" },
  { kana: "ふ", romaji: "fu" },
  { kana: "へ", romaji: "he" },
  { kana: "ほ", romaji: "ho" },
  { kana: "ま", romaji: "ma" },
  { kana: "み", romaji: "mi" },
  { kana: "む", romaji: "mu" },
  { kana: "め", romaji: "me" },
  { kana: "も", romaji: "mo" },
  { kana: "や", romaji: "ya" },
  { kana: "ゆ", romaji: "yu" },
  { kana: "よ", romaji: "yo" },
  { kana: "ら", romaji: "ra" },
  { kana: "り", romaji: "ri" },
  { kana: "る", romaji: "ru" },
  { kana: "れ", romaji: "re" },
  { kana: "ろ", romaji: "ro" },
  { kana: "わ", romaji: "wa" },
  { kana: "を", romaji: "wo" },
  { kana: "ん", romaji: "n" },
];

const DAKUTEN_HIRAGANA: { kana: string; romaji: string }[] = [
  { kana: "が", romaji: "ga" }, { kana: "ぎ", romaji: "gi" },
  { kana: "ぐ", romaji: "gu" }, { kana: "げ", romaji: "ge" }, { kana: "ご", romaji: "go" },
  { kana: "ざ", romaji: "za" }, { kana: "じ", romaji: "ji" },
  { kana: "ず", romaji: "zu" }, { kana: "ぜ", romaji: "ze" }, { kana: "ぞ", romaji: "zo" },
  { kana: "だ", romaji: "da" }, { kana: "で", romaji: "de" }, { kana: "ど", romaji: "do" },
  { kana: "ば", romaji: "ba" }, { kana: "び", romaji: "bi" },
  { kana: "ぶ", romaji: "bu" }, { kana: "べ", romaji: "be" }, { kana: "ぼ", romaji: "bo" },
  { kana: "ぱ", romaji: "pa" }, { kana: "ぴ", romaji: "pi" },
  { kana: "ぷ", romaji: "pu" }, { kana: "ぺ", romaji: "pe" }, { kana: "ぽ", romaji: "po" },
];

const YOUON_HIRAGANA: { kana: string; romaji: string }[] = [
  { kana: "きゃ", romaji: "kya" }, { kana: "きゅ", romaji: "kyu" }, { kana: "きょ", romaji: "kyo" },
  { kana: "しゃ", romaji: "sha" }, { kana: "しゅ", romaji: "shu" }, { kana: "しょ", romaji: "sho" },
  { kana: "ちゃ", romaji: "cha" }, { kana: "ちゅ", romaji: "chu" }, { kana: "ちょ", romaji: "cho" },
  { kana: "にゃ", romaji: "nya" }, { kana: "にゅ", romaji: "nyu" }, { kana: "にょ", romaji: "nyo" },
  { kana: "ひゃ", romaji: "hya" }, { kana: "ひゅ", romaji: "hyu" }, { kana: "ひょ", romaji: "hyo" },
  { kana: "みゃ", romaji: "mya" }, { kana: "みゅ", romaji: "myu" }, { kana: "みょ", romaji: "myo" },
  { kana: "りゃ", romaji: "rya" }, { kana: "りゅ", romaji: "ryu" }, { kana: "りょ", romaji: "ryo" },
];

function buildPool(includeDakuten: boolean, includeYouon: boolean) {
  const pool = [...BASIC_HIRAGANA];
  if (includeDakuten) pool.push(...DAKUTEN_HIRAGANA);
  if (includeYouon) pool.push(...YOUON_HIRAGANA);
  return pool;
}

function pickQuestion(
  pool: { kana: string; romaji: string }[],
  currentKana: string | null
) {
  let candidate;
  do {
    candidate = pool[Math.floor(Math.random() * pool.length)];
  } while (candidate.kana === currentKana && pool.length > 1);

  const wrongOptions = new Set<string>();
  while (wrongOptions.size < 3) {
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (c.romaji !== candidate.romaji) wrongOptions.add(c.romaji);
  }
  const options = [candidate.romaji, ...wrongOptions];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { kana: candidate.kana, correct: candidate.romaji, options };
}

type Phase = "idle" | "playing" | "done";

export default function HiraganaSpeedGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const difficulty: Difficulty =
    (searchParams.get("d") as Difficulty) || "medium";
  const config = HIRAGANA_SPEED_CONFIG[difficulty];
  const gameKey = `hiragana_speed_${difficulty}`;
  const featuredDailyBonus = isDailyFeatured("hiragana_speed") ? 1.25 : 1.0;
  const featuredWeeklyBonus = isWeeklyFeatured("hiragana_speed") ? 1.5 : 1.0;

  const pool = useMemo(
    () => buildPool(config.includeDakuten, config.includeYouon),
    [config.includeDakuten, config.includeYouon]
  );

  const { data: best } = useMinigameBest(gameKey);
  const record = useRecordMinigameScore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState<number>(config.seconds);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [question, setQuestion] = useState<ReturnType<typeof pickQuestion> | null>(
    null
  );
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
      .mutateAsync({
        gameKey,
        score: finalScore,
        durationSeconds: config.seconds,
      })
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
    setScore(0);
    setCombo(0);
    setTimeLeft(config.seconds);
    setQuestion(pickQuestion(pool, null));
    setFeedback(null);
    setSubmitted(null);
    setPhase("playing");
  };

  const answer = (opt: string) => {
    if (!question) return;
    if (opt === question.correct) {
      const points = 1 + Math.floor(combo / 5);
      setScore((s) => s + points);
      setCombo((c) => c + 1);
      setFeedback("ok");
    } else {
      setCombo(0);
      setFeedback("bad");
    }
    setTimeout(() => {
      setQuestion(pickQuestion(pool, question.kana));
      setFeedback(null);
    }, 150);
  };

  const pct = useMemo(
    () => (timeLeft / config.seconds) * 100,
    [timeLeft, config.seconds]
  );

  if (phase === "idle") {
    return (
      <IntroCard
        best={best ?? 0}
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
        onPlayAgain={start}
        onExit={() => navigate("/play")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setPhase("idle")}>
          <ArrowLeft className="size-3.5" /> Cancelar
        </Button>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="text-[10px]">
            <span className={DIFFICULTY_COLORS[difficulty]}>
              {DIFFICULTY_LABELS[difficulty]}
            </span>
          </Badge>
          {isDailyFeatured("hiragana_speed") ||
          isWeeklyFeatured("hiragana_speed") ? (
            <Badge variant="warning" className="text-[10px]">
              +{difficultyBonusPercent(difficulty)}% XP
            </Badge>
          ) : null}
          <span className="text-muted-foreground">Puntos: {score}</span>
          {combo >= 3 ? (
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-warning">
              x{combo} combo
            </span>
          ) : null}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>ひらがな早撃ち · {config.label}</span>
          <span className="tabular-nums">{timeLeft}s</span>
        </div>
        <Progress
          value={pct}
          className={cn("mt-1 h-1.5", pct < 30 && "[&>div]:bg-destructive")}
        />
      </div>

      <div
        className={cn(
          "relative grid h-72 place-items-center overflow-hidden rounded-3xl glass-strong transition-colors",
          feedback === "ok" && "bg-success/10",
          feedback === "bad" && "bg-destructive/10"
        )}
      >
        <AnimatePresence mode="wait">
          {question ? (
            <motion.span
              key={question.kana}
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -12 }}
              transition={{ duration: 0.18 }}
              className="font-jp text-[10rem] leading-none"
            >
              {question.kana}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question?.options.map((opt) => (
          <Button
            key={opt}
            size="xl"
            variant="outline"
            className="h-16 text-xl font-bold"
            onClick={() => answer(opt)}
          >
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
}

function IntroCard({
  best,
  onStart,
  onExit,
}: {
  best: number;
  onStart: () => void;
  onExit: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-8">
      <div className="overflow-hidden rounded-3xl glass-strong p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-warning via-streak to-neon-amber text-warning-foreground">
          <Zap className="size-7" />
        </div>
        <p className="mt-4 font-jp text-[11px] tracking-[0.4em] text-warning">
          ひらがな早撃ち
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Hiragana Speed
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          30 segundos. Identifica el romaji del hiragana que aparece. Combo de
          5 correctas seguidas duplica los puntos.
        </p>
        {best > 0 ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-sm text-warning">
            <Trophy className="size-3.5" /> Tu récord: {best}
          </p>
        ) : null}
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onExit}>
            Salir
          </Button>
          <Button
            className="flex-1 bg-gradient-to-br from-warning to-streak text-warning-foreground"
            onClick={onStart}
          >
            <Play className="size-4" />
            ¡Empezar!
          </Button>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  score,
  bestScore,
  newBest,
  xp,
  stars,
  onPlayAgain,
  onExit,
}: {
  score: number;
  bestScore: number;
  newBest: boolean;
  xp: number;
  stars: number;
  onPlayAgain: () => void;
  onExit: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl glass-strong p-8 text-center"
      >
        <p className="font-jp text-xs tracking-[0.4em] text-warning">時間切れ</p>
        <h2 className="mt-2 text-2xl font-semibold">¡Tiempo!</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card/60 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Puntuación
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{score}</p>
          </div>
          <div className="rounded-xl border bg-card/60 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {newBest ? "¡Nuevo récord!" : "Tu récord"}
            </p>
            <p
              className={cn(
                "mt-1 text-3xl font-bold tabular-nums",
                newBest && "text-warning"
              )}
            >
              {bestScore}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary">
            <Sparkles className="size-3.5" /> +{xp} XP
          </div>
          {stars > 0 ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-sm text-warning">
              <Star className="size-3.5 fill-current" /> +{stars}
            </div>
          ) : null}
        </div>
        <div className="mt-7 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onExit}>
            Salir
          </Button>
          <Button className="flex-1" onClick={onPlayAgain}>
            <RotateCcw className="size-3.5" />
            Otra ronda
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
