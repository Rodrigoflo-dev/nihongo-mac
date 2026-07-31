import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Sparkles, Star, Trophy, Volume2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";
import { GameSummary } from "@/components/play/game-summary";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { HudPanel } from "@/components/visual/hud-panel";
import { usePlayTts } from "@/hooks/use-listening";
import { useMinigameBest, useRecordMinigameScore } from "@/hooks/use-minigames";
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  difficultyBonusPercent,
  isDailyFeatured,
  isWeeklyFeatured,
  type Difficulty,
} from "@/lib/minigames";
import type { PhraseItem } from "@/lib/play-extra";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useTc } from "@/lib/content-i18n";

const COUNT: Record<Difficulty, number> = { easy: 6, medium: 8, hard: 12 };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "idle" | "playing" | "done";

/**
 * Round-based quiz used by the "Completa la frase" and "Responde" games.
 * Shows a prompt (optionally played as audio), 4 options, immediate feedback,
 * and an end-of-game summary with accuracy + verdict.
 */
export function PhraseQuizGame({
  baseKey,
  titleJp,
  title,
  description,
  items,
  audio,
  accentChar,
}: {
  baseKey: string;
  titleJp: string;
  title: string;
  description: string;
  items: PhraseItem[];
  audio: boolean;
  accentChar: string;
}) {
  const t = useT();
  const tc = useTc();
  const navigate = useNavigate();
  const play = usePlayTts();
  const [searchParams] = useSearchParams();
  const difficulty: Difficulty =
    (searchParams.get("d") as Difficulty) || "medium";
  const gameKey = `${baseKey}_${difficulty}`;
  const dailyBonus = isDailyFeatured(baseKey) ? 1.25 : 1.0;
  const weeklyBonus = isWeeklyFeatured(baseKey) ? 1.5 : 1.0;

  const { data: best } = useMinigameBest(gameKey);
  const record = useRecordMinigameScore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<
    { item: PhraseItem; options: string[] }[]
  >([]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [submitted, setSubmitted] = useState<{
    xp: number;
    stars: number;
    newBest: boolean;
    bestScore: number;
  } | null>(null);

  const start = () => {
    const n = Math.min(COUNT[difficulty], items.length);
    const picks = shuffle(items).slice(0, n);
    setRound(picks.map((item) => ({ item, options: shuffle(item.options) })));
    setQi(0);
    setPicked(null);
    setCorrectCount(0);
    setWrongCount(0);
    setSubmitted(null);
    setPhase("playing");
  };

  const current = round[qi];

  const answer = (opt: string) => {
    if (picked || !current) return;
    setPicked(opt);
    const ok = opt === current.item.correct;
    if (ok) setCorrectCount((n) => n + 1);
    else setWrongCount((n) => n + 1);
    setTimeout(() => {
      if (qi + 1 >= round.length) finish(ok ? correctCount + 1 : correctCount);
      else {
        setQi((i) => i + 1);
        setPicked(null);
      }
    }, 900);
  };

  const finish = (finalCorrect: number) => {
    setPhase("done");
    const score = Math.max(
      0,
      Math.round(finalCorrect * 10 * dailyBonus * weeklyBonus)
    );
    record
      .mutateAsync({ gameKey, score, durationSeconds: round.length * 6 })
      .then((res) => {
        setSubmitted({
          xp: res.award.xpAmount,
          stars: res.award.starAmount,
          newBest: res.newBest,
          bestScore: res.bestScore,
        });
        if (score > 0) burstXp();
        if (res.award.leveledUp) burstLevelUp();
      });
  };

  // ── Intro ──
  if (phase === "idle") {
    return (
      <div className="mx-auto max-w-md py-8">
        <HudPanel glow className="p-8 text-center">
          <div className="mb-2 flex justify-center">
            <HoloKanji size={140} interval={2600} items={[{ char: accentChar, meaning: title }]} />
          </div>
          <p className="font-jp text-[11px] tracking-[0.4em] text-neon-cyan">{titleJp}</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">{tc(title)}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{tc(description)}</p>
          {best && best > 0 ? (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-neon-amber/40 bg-warning/15 px-3 py-1.5 text-sm text-neon-amber">
              <Trophy className="size-3.5" /> {t("mg.yourRecordN", { n: best })}
            </p>
          ) : null}
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/play")}>
              {t("common.exit")}
            </Button>
            <Button className="flex-1" onClick={start}>
              {t("mg.start")}
            </Button>
          </div>
        </HudPanel>
      </div>
    );
  }

  // ── Summary ──
  if (phase === "done") {
    return (
      <div className="mx-auto max-w-md py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <HudPanel glow className="p-8 text-center">
            {submitted?.newBest ? (
              <div className="mb-2 flex justify-center">
                <HoloKanji size={130} interval={2400} items={[{ char: "新", meaning: "Nuevo récord" }]} />
              </div>
            ) : null}
            <p className="font-jp text-xs tracking-[0.4em] text-neon-cyan">おわり</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">{t("mg.finished")}</h2>
            <div className="mt-4 flex justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-neon-cyan">
                <Sparkles className="size-3.5" /> +{submitted?.xp ?? 0} XP
              </div>
              {(submitted?.stars ?? 0) > 0 ? (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-neon-amber/40 bg-warning/15 px-3 py-1.5 text-sm text-neon-amber">
                  <Star className="size-3.5 fill-current" /> +{submitted?.stars}
                </div>
              ) : null}
            </div>
            <div className="mt-5">
              <GameSummary correct={correctCount} wrong={wrongCount} />
            </div>
            <div className="mt-7 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/play")}>
                {t("common.exit")}
              </Button>
              <Button className="flex-1" onClick={start}>
                <RotateCcw className="size-3.5" /> {t("mg.anotherRound")}
              </Button>
            </div>
          </HudPanel>
        </motion.div>
      </div>
    );
  }

  // ── Playing ──
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setPhase("idle")}>
          <ArrowLeft className="size-3.5" /> {t("common.cancel")}
        </Button>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="text-[10px]">
            <span className={DIFFICULTY_COLORS[difficulty]}>{tc(DIFFICULTY_LABELS[difficulty])}</span>
          </Badge>
          {isDailyFeatured(baseKey) || isWeeklyFeatured(baseKey) ? (
            <Badge variant="warning" className="text-[10px]">
              +{difficultyBonusPercent(difficulty)}% XP
            </Badge>
          ) : null}
          <span className="font-mono tabular-nums text-neon-cyan">
            {qi + 1} / {round.length}
          </span>
        </div>
      </div>

      {current ? (
        <HudPanel glow className="p-8 text-center">
          {audio ? (
            <button
              onClick={() =>
                play.mutate({ text: current.item.promptJp, voice: "Kyoko", rate: 160 })
              }
              className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary via-neon-violet to-neon-cyan text-primary-foreground shadow-[0_16px_40px_-12px_color-mix(in_oklch,var(--color-primary)_60%,transparent)] transition-transform hover:scale-105"
              title={t("common.listen")}
            >
              <Volume2 className={cn("size-7", play.isPending && "animate-pulse")} />
            </button>
          ) : null}
          <p
            className="font-jp text-3xl font-bold leading-snug text-foreground"
            style={{ textShadow: "0 0 20px color-mix(in oklch, var(--color-primary) 35%, transparent)" }}
          >
            {current.item.promptJp}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{tc(current.item.promptMeaning)}</p>

          <div className="mt-6 grid gap-2.5">
            {current.options.map((opt) => {
              const isCorrect = opt === current.item.correct;
              const isPicked = picked === opt;
              return (
                <button
                  key={opt}
                  disabled={!!picked}
                  onClick={() => answer(opt)}
                  className={cn(
                    "rounded-xl border border-border/60 bg-card/50 px-5 py-3 font-jp text-lg transition-all",
                    !picked && "hover:border-neon-cyan/50 hover:bg-accent/20",
                    picked && isCorrect && "border-success bg-success/15 text-success",
                    isPicked && !isCorrect && "border-destructive bg-destructive/15 text-destructive",
                    picked && !isCorrect && !isPicked && "opacity-50"
                  )}
                >
                  {tc(opt)}
                </button>
              );
            })}
          </div>

          {picked && picked !== current.item.correct ? (
            <p className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-3 text-left text-sm text-foreground/85">
              <span className="font-semibold text-success">{tc(current.item.correct)}</span>{" "}
              — {tc(current.item.explanation)}
            </p>
          ) : null}
        </HudPanel>
      ) : null}
    </div>
  );
}
