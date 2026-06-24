import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Play, RotateCcw, Sparkles, Star, Trophy, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";
import { GameSummary } from "@/components/play/game-summary";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { HudPanel } from "@/components/visual/hud-panel";
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

const BASIC_KATAKANA: { kana: string; romaji: string }[] = [
  { kana: "ア", romaji: "a" }, { kana: "イ", romaji: "i" }, { kana: "ウ", romaji: "u" },
  { kana: "エ", romaji: "e" }, { kana: "オ", romaji: "o" },
  { kana: "カ", romaji: "ka" }, { kana: "キ", romaji: "ki" }, { kana: "ク", romaji: "ku" },
  { kana: "ケ", romaji: "ke" }, { kana: "コ", romaji: "ko" },
  { kana: "サ", romaji: "sa" }, { kana: "シ", romaji: "shi" }, { kana: "ス", romaji: "su" },
  { kana: "セ", romaji: "se" }, { kana: "ソ", romaji: "so" },
  { kana: "タ", romaji: "ta" }, { kana: "チ", romaji: "chi" }, { kana: "ツ", romaji: "tsu" },
  { kana: "テ", romaji: "te" }, { kana: "ト", romaji: "to" },
  { kana: "ナ", romaji: "na" }, { kana: "ニ", romaji: "ni" }, { kana: "ヌ", romaji: "nu" },
  { kana: "ネ", romaji: "ne" }, { kana: "ノ", romaji: "no" },
  { kana: "ハ", romaji: "ha" }, { kana: "ヒ", romaji: "hi" }, { kana: "フ", romaji: "fu" },
  { kana: "ヘ", romaji: "he" }, { kana: "ホ", romaji: "ho" },
  { kana: "マ", romaji: "ma" }, { kana: "ミ", romaji: "mi" }, { kana: "ム", romaji: "mu" },
  { kana: "メ", romaji: "me" }, { kana: "モ", romaji: "mo" },
  { kana: "ヤ", romaji: "ya" }, { kana: "ユ", romaji: "yu" }, { kana: "ヨ", romaji: "yo" },
  { kana: "ラ", romaji: "ra" }, { kana: "リ", romaji: "ri" }, { kana: "ル", romaji: "ru" },
  { kana: "レ", romaji: "re" }, { kana: "ロ", romaji: "ro" },
  { kana: "ワ", romaji: "wa" }, { kana: "ヲ", romaji: "wo" }, { kana: "ン", romaji: "n" },
];

const DAKUTEN_KATAKANA: { kana: string; romaji: string }[] = [
  { kana: "ガ", romaji: "ga" }, { kana: "ギ", romaji: "gi" }, { kana: "グ", romaji: "gu" },
  { kana: "ゲ", romaji: "ge" }, { kana: "ゴ", romaji: "go" },
  { kana: "ザ", romaji: "za" }, { kana: "ジ", romaji: "ji" }, { kana: "ズ", romaji: "zu" },
  { kana: "ゼ", romaji: "ze" }, { kana: "ゾ", romaji: "zo" },
  { kana: "ダ", romaji: "da" }, { kana: "デ", romaji: "de" }, { kana: "ド", romaji: "do" },
  { kana: "バ", romaji: "ba" }, { kana: "ビ", romaji: "bi" }, { kana: "ブ", romaji: "bu" },
  { kana: "ベ", romaji: "be" }, { kana: "ボ", romaji: "bo" },
  { kana: "パ", romaji: "pa" }, { kana: "ピ", romaji: "pi" }, { kana: "プ", romaji: "pu" },
  { kana: "ペ", romaji: "pe" }, { kana: "ポ", romaji: "po" },
];

const YOUON_KATAKANA: { kana: string; romaji: string }[] = [
  { kana: "キャ", romaji: "kya" }, { kana: "キュ", romaji: "kyu" }, { kana: "キョ", romaji: "kyo" },
  { kana: "シャ", romaji: "sha" }, { kana: "シュ", romaji: "shu" }, { kana: "ショ", romaji: "sho" },
  { kana: "チャ", romaji: "cha" }, { kana: "チュ", romaji: "chu" }, { kana: "チョ", romaji: "cho" },
  { kana: "ニャ", romaji: "nya" }, { kana: "ニュ", romaji: "nyu" }, { kana: "ニョ", romaji: "nyo" },
  { kana: "ヒャ", romaji: "hya" }, { kana: "ヒュ", romaji: "hyu" }, { kana: "ヒョ", romaji: "hyo" },
  { kana: "ミャ", romaji: "mya" }, { kana: "ミュ", romaji: "myu" }, { kana: "ミョ", romaji: "myo" },
  { kana: "リャ", romaji: "rya" }, { kana: "リュ", romaji: "ryu" }, { kana: "リョ", romaji: "ryo" },
];

function buildPool(
  script: "hiragana" | "katakana",
  includeDakuten: boolean,
  includeYouon: boolean
) {
  const [basic, dakuten, youon] =
    script === "katakana"
      ? [BASIC_KATAKANA, DAKUTEN_KATAKANA, YOUON_KATAKANA]
      : [BASIC_HIRAGANA, DAKUTEN_HIRAGANA, YOUON_HIRAGANA];
  const pool = [...basic];
  if (includeDakuten) pool.push(...dakuten);
  if (includeYouon) pool.push(...youon);
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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Same engine drives both kana games, selected by the route.
  const script: "hiragana" | "katakana" = location.pathname.includes("katakana")
    ? "katakana"
    : "hiragana";
  const baseKey = script === "katakana" ? "katakana_speed" : "hiragana_speed";
  const titleJp = script === "katakana" ? "カタカナ早撃ち" : "ひらがな早撃ち";
  const difficulty: Difficulty =
    (searchParams.get("d") as Difficulty) || "medium";
  const config = HIRAGANA_SPEED_CONFIG[difficulty];
  const gameKey = `${baseKey}_${difficulty}`;
  const featuredDailyBonus = isDailyFeatured(baseKey) ? 1.25 : 1.0;
  const featuredWeeklyBonus = isWeeklyFeatured(baseKey) ? 1.5 : 1.0;

  const pool = useMemo(
    () => buildPool(script, config.includeDakuten, config.includeYouon),
    [script, config.includeDakuten, config.includeYouon]
  );

  const { data: best } = useMinigameBest(gameKey);
  const record = useRecordMinigameScore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState<number>(config.seconds);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
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
    setCorrectCount(0);
    setWrongCount(0);
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
      setCorrectCount((n) => n + 1);
      setFeedback("ok");
    } else {
      setCombo(0);
      setWrongCount((n) => n + 1);
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
        titleJp={titleJp}
        title={script === "katakana" ? "Katakana Speed" : "Hiragana Speed"}
        kanaName={script === "katakana" ? "katakana" : "hiragana"}
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
          <ArrowLeft className="size-3.5" /> Cancelar
        </Button>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="text-[10px]">
            <span className={DIFFICULTY_COLORS[difficulty]}>
              {DIFFICULTY_LABELS[difficulty]}
            </span>
          </Badge>
          {isDailyFeatured(baseKey) || isWeeklyFeatured(baseKey) ? (
            <Badge variant="warning" className="text-[10px]">
              +{difficultyBonusPercent(difficulty)}% XP
            </Badge>
          ) : null}
          <span className="font-mono text-neon-cyan">Puntos: {score}</span>
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
          <span className="font-jp tracking-[0.2em]">{titleJp} · {config.label}</span>
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
          "grid h-72 place-items-center transition-colors",
          feedback === "ok" && "bg-success/10",
          feedback === "bad" && "bg-destructive/10"
        )}
      >
        <div className="relative grid size-full place-items-center [perspective:1000px]">
          <div className="pointer-events-none absolute inset-0 holo-grid opacity-40" />
          <AnimatePresence mode="wait">
            {question ? (
              <motion.span
                key={question.kana}
                initial={{ opacity: 0, scale: 0.85, y: 12, rotateX: -25 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -12, rotateX: 25 }}
                transition={{ duration: 0.18 }}
                className="relative z-10 font-jp text-[10rem] leading-none text-primary [text-shadow:0_0_28px_color-mix(in_oklch,var(--color-primary)_70%,transparent),0_0_60px_color-mix(in_oklch,var(--color-neon-violet)_45%,transparent)]"
              >
                {question.kana}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </HudPanel>

      <div className="grid grid-cols-2 gap-3">
        {question?.options.map((opt) => (
          <Button
            key={opt}
            size="xl"
            variant="outline"
            className="h-16 border-primary/30 text-xl font-bold transition-all hover:border-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan hover:shadow-[0_0_24px_-6px_color-mix(in_oklch,var(--color-neon-cyan)_70%,transparent)]"
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
  titleJp,
  title,
  kanaName,
  onStart,
  onExit,
}: {
  best: number;
  titleJp: string;
  title: string;
  kanaName: string;
  onStart: () => void;
  onExit: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-8">
      <HudPanel glow className="p-8 text-center">
        <div className="relative">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="animate-holo-float mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-warning via-streak to-neon-amber text-warning-foreground shadow-[0_0_30px_-6px_color-mix(in_oklch,var(--color-neon-amber)_75%,transparent)]"
          >
            <Zap className="size-7" />
          </motion.div>
          <p className="mt-4 font-jp text-[11px] tracking-[0.4em] text-neon-amber">
            {titleJp}
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Time attack. Identifica el romaji del {kanaName} que aparece. Combo
            de 5 correctas seguidas duplica los puntos.
          </p>
          {best > 0 ? (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-neon-amber/40 bg-warning/15 px-3 py-1.5 text-sm text-neon-amber">
              <Trophy className="size-3.5" /> Tu récord: {best}
            </p>
          ) : null}
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onExit}>
              Salir
            </Button>
            <Button
              className="flex-1 bg-gradient-to-br from-warning to-streak text-warning-foreground shadow-[0_0_24px_-6px_color-mix(in_oklch,var(--color-neon-amber)_70%,transparent)]"
              onClick={onStart}
            >
              <Play className="size-4" />
              ¡Empezar!
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
  return (
    <div className="mx-auto max-w-md py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
            <p className="font-jp text-xs tracking-[0.4em] text-neon-amber">時間切れ</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
              ¡Tiempo!
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-primary/20 glass px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
                  Puntuación
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums">{score}</p>
              </div>
              <div className="rounded-xl border border-primary/20 glass px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
                  {newBest ? "¡Nuevo récord!" : "Tu récord"}
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
                Salir
              </Button>
              <Button className="flex-1" onClick={onPlayAgain}>
                <RotateCcw className="size-3.5" />
                Otra ronda
              </Button>
            </div>
          </div>
        </HudPanel>
      </motion.div>
    </div>
  );
}
