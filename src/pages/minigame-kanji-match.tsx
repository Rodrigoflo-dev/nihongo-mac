import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Sparkles, Star, Trophy } from "lucide-react";

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
  KANJI_MATCH_CONFIG,
  difficultyBonusPercent,
  isDailyFeatured,
  isWeeklyFeatured,
} from "@/lib/minigames";
import { cn } from "@/lib/utils";

const ALL_PAIRS = [
  { kanji: "一", meaning: "uno" },
  { kanji: "日", meaning: "día" },
  { kanji: "月", meaning: "mes" },
  { kanji: "人", meaning: "persona" },
  { kanji: "水", meaning: "agua" },
  { kanji: "火", meaning: "fuego" },
  { kanji: "木", meaning: "árbol" },
  { kanji: "山", meaning: "montaña" },
  { kanji: "学", meaning: "aprender" },
  { kanji: "私", meaning: "yo" },
  { kanji: "行", meaning: "ir" },
  { kanji: "食", meaning: "comer" },
];

type CardData = {
  id: number;
  pairKey: string;
  display: string;
  isKanji: boolean;
  matched: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildDeck(pairCount: number): CardData[] {
  const selected = shuffle(ALL_PAIRS).slice(0, pairCount);
  const cards: CardData[] = [];
  selected.forEach((p, idx) => {
    cards.push({
      id: idx * 2,
      pairKey: p.kanji,
      display: p.kanji,
      isKanji: true,
      matched: false,
    });
    cards.push({
      id: idx * 2 + 1,
      pairKey: p.kanji,
      display: p.meaning,
      isKanji: false,
      matched: false,
    });
  });
  return shuffle(cards);
}

export default function KanjiMatchGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const difficulty: Difficulty =
    (searchParams.get("d") as Difficulty) || "medium";
  const isFeatured = searchParams.get("featured") === "1";
  const config = KANJI_MATCH_CONFIG[difficulty];
  const gameKey = `kanji_match_${difficulty}`;
  const featuredDailyBonus = isDailyFeatured("kanji_match") ? 1.25 : 1.0;
  const featuredWeeklyBonus = isWeeklyFeatured("kanji_match") ? 1.5 : 1.0;

  const { data: best } = useMinigameBest(gameKey);
  const record = useRecordMinigameScore();

  const [cards, setCards] = useState<CardData[]>(() =>
    buildDeck(config.pairs)
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [submitted, setSubmitted] = useState<{
    score: number;
    xp: number;
    stars: number;
    newBest: boolean;
    bestScore: number;
  } | null>(null);

  const matchedCount = useMemo(() => cards.filter((c) => c.matched).length, [cards]);
  const allDone = matchedCount === cards.length;

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      const ca = cards.find((c) => c.id === a)!;
      const cb = cards.find((c) => c.id === b)!;
      if (ca.pairKey === cb.pairKey && ca.isKanji !== cb.isKanji) {
        const timer = setTimeout(() => {
          setCards((cs) =>
            cs.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c))
          );
          setFlipped([]);
        }, 450);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setFlipped([]), 900);
        return () => clearTimeout(timer);
      }
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (!allDone || submitted) return;
    const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const pairs = config.pairs;
    const extraMoves = Math.max(0, moves - pairs);
    const timeBonus = Math.max(0, 80 - elapsed) / 6;
    const rawScore = pairs * 2 - extraMoves * 0.4 + timeBonus;
    const multiplier =
      config.xpMultiplier * featuredDailyBonus * featuredWeeklyBonus;
    const score = Math.max(1, Math.round(rawScore * multiplier));
    record
      .mutateAsync({ gameKey, score, durationSeconds: elapsed })
      .then((res) => {
        setSubmitted({
          score,
          xp: res.award.xpAmount,
          stars: res.award.starAmount,
          newBest: res.newBest,
          bestScore: res.bestScore,
        });
        burstXp();
        if (res.award.leveledUp) burstLevelUp();
      });
  }, [
    allDone,
    submitted,
    moves,
    startedAt,
    record,
    config,
    gameKey,
    featuredDailyBonus,
    featuredWeeklyBonus,
  ]);

  const flip = (id: number) => {
    if (flipped.length >= 2) return;
    if (flipped.includes(id)) return;
    const card = cards.find((c) => c.id === id)!;
    if (card.matched) return;
    setFlipped((f) => [...f, id]);
    if (flipped.length === 1) setMoves((m) => m + 1);
  };

  const reset = () => {
    setCards(buildDeck(config.pairs));
    setFlipped([]);
    setMoves(0);
    setStartedAt(Date.now());
    setSubmitted(null);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md py-12">
        <ResultCard
          score={submitted.score}
          best={submitted.bestScore}
          xp={submitted.xp}
          stars={submitted.stars}
          newBest={submitted.newBest}
          correct={config.pairs}
          wrong={Math.max(0, moves - config.pairs)}
          onPlayAgain={reset}
          onExit={() => navigate("/play")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/play")}>
          <ArrowLeft className="size-3.5" /> Salir
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">
            <span className={DIFFICULTY_COLORS[difficulty]}>
              {DIFFICULTY_LABELS[difficulty]}
            </span>
          </Badge>
          {isFeatured ||
          isDailyFeatured("kanji_match") ||
          isWeeklyFeatured("kanji_match") ? (
            <Badge variant="warning" className="text-[10px]">
              +{difficultyBonusPercent(difficulty)}% XP
            </Badge>
          ) : null}
          <span className="font-mono text-neon-cyan">Mov: {moves}</span>
          {typeof best === "number" && best > 0 ? (
            <span className="inline-flex items-center gap-1 text-neon-amber">
              <Trophy className="size-3" /> {best}
            </span>
          ) : null}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
          <span className="font-jp tracking-[0.2em]">漢字あわせ · {config.label}</span>
          <span>
            {matchedCount / 2} / {config.pairs} pares
          </span>
        </div>
        <Progress value={(matchedCount / cards.length) * 100} className="mt-1 h-1" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched;
          return (
            <button
              key={card.id}
              disabled={card.matched}
              onClick={() => flip(card.id)}
              className={cn(
                "relative aspect-[3/4] rounded-2xl transition-all",
                "preserve-3d perspective-1000"
              )}
              style={{ perspective: "800px" }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/40 via-neon-violet/30 to-neon-cyan/30 text-primary-foreground shadow-[0_0_24px_-8px_color-mix(in_oklch,var(--color-primary)_70%,transparent)]"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="pointer-events-none absolute inset-0 holo-grid opacity-50" />
                  <span className="relative font-jp text-2xl text-neon-cyan opacity-70">？</span>
                </div>
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-2xl border border-primary/30 glass-strong p-2 text-center",
                    card.matched &&
                      "border-success/60 bg-success/10 ring-2 ring-success shadow-[0_0_28px_-6px_color-mix(in_oklch,var(--color-success)_75%,transparent)]"
                  )}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {card.isKanji ? (
                    <span className="font-jp text-5xl text-primary [text-shadow:0_0_18px_color-mix(in_oklch,var(--color-primary)_55%,transparent)]">
                      {card.display}
                    </span>
                  ) : (
                    <span className="text-sm font-medium">{card.display}</span>
                  )}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>

      <div className="text-center">
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="size-3.5" />
          Reiniciar
        </Button>
      </div>
    </div>
  );
}

function ResultCard({
  score,
  best,
  xp,
  stars,
  newBest,
  correct,
  wrong,
  onPlayAgain,
  onExit,
}: {
  score: number;
  best: number;
  xp: number;
  stars: number;
  newBest: boolean;
  correct: number;
  wrong: number;
  onPlayAgain: () => void;
  onExit: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <HudPanel glow className="p-8 text-center">
        <div className="relative">
          <div className="mb-1 flex justify-center">
            <HoloKanji
              size={150}
              interval={2400}
              items={[{ char: "勝", meaning: "Victoria" }]}
            />
          </div>
          <p className="font-jp text-xs tracking-[0.4em] text-neon-cyan">
            ゲームクリア
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
            ¡Ganaste!
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary/20 glass px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
                Puntuación
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{score}</p>
            </div>
            <div className="rounded-xl border border-primary/20 glass px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
                {newBest ? "¡Nuevo récord!" : "Tu récord"}
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold tabular-nums",
                  newBest && "text-neon-amber"
                )}
              >
                {best}
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
            <GameSummary correct={correct} wrong={wrong} unit="pares" />
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
  );
}
