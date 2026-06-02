import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Flame,
  Gamepad2,
  Headphones,
  type LucideIcon,
  Puzzle,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { useMinigameBest } from "@/hooks/use-minigames";
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  type Difficulty,
  MINIGAMES,
  type MinigameDef,
  dailyFeatured,
  weeklyFeatured,
} from "@/lib/minigames";
import { cn } from "@/lib/utils";

const ICONS: Record<MinigameDef["icon"], LucideIcon> = {
  sparkles: Sparkles,
  zap: Zap,
  puzzle: Puzzle,
  headphones: Headphones,
};

export default function PlayPage() {
  const featuredDaily = dailyFeatured();
  const featuredWeekly = weeklyFeatured();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        eyebrow="ミニゲーム — Mini-juegos"
        title={
          <>
            Aprende <span className="gradient-text-warm">jugando</span>
          </>
        }
        description="Cada juego entrena un skill específico. La dificultad alta da más XP. Bate tu récord para ganar estrellas extra."
      />

      {/* Featured */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FeaturedCard
          label="Juego del día"
          jp="今日の一推し"
          icon={Flame}
          game={featuredDaily}
          accent="from-streak/50 via-warning/30 to-neon-pink/20"
          bonusLabel="+25% XP hoy"
        />
        <FeaturedCard
          label="Reto de la semana"
          jp="今週の挑戦"
          icon={CalendarDays}
          game={featuredWeekly}
          accent="from-primary/50 via-neon-violet/30 to-neon-cyan/20"
          bonusLabel="+50% XP semanal"
        />
      </div>

      {/* Catalog */}
      <section className="space-y-4">
        <div>
          <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
            カタログ
          </p>
          <h2 className="text-lg font-semibold">Catálogo</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {MINIGAMES.map((g) => (
            <GameCard key={g.key} game={g} />
          ))}
          <ComingSoonCard />
        </div>
      </section>
    </div>
  );
}

function FeaturedCard({
  label,
  jp,
  icon: Icon,
  game,
  accent,
  bonusLabel,
}: {
  label: string;
  jp: string;
  icon: LucideIcon;
  game: MinigameDef;
  accent: string;
  bonusLabel: string;
}) {
  const GameIcon = ICONS[game.icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative"
    >
      <div
        className={cn(
          "absolute -inset-1 rounded-3xl bg-gradient-to-br opacity-40 blur-xl",
          accent
        )}
      />
      <Link
        to={`${game.path}?d=medium&featured=1`}
        className="relative block overflow-hidden rounded-2xl glass-strong p-6"
      >
        <div
          className={cn(
            "absolute -right-20 -top-20 size-44 rounded-full bg-gradient-to-br opacity-60 blur-2xl",
            accent
          )}
        />
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Icon className="size-3" />
              {label}
            </Badge>
            <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning">
              {bonusLabel}
            </span>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-background/40 text-primary">
              <GameIcon className="size-7" />
            </div>
            <div className="flex-1">
              <p className="font-jp text-[10px] tracking-[0.25em] text-muted-foreground">
                {jp}
              </p>
              <p className="text-lg font-semibold tracking-tight">
                {game.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {game.description}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Pulsa para jugar →</span>
            <ArrowRight className="size-3.5 text-muted-foreground" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function GameCard({ game }: { game: MinigameDef }) {
  const Icon = ICONS[game.icon];
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative overflow-hidden rounded-2xl glass p-6 ring-1",
        game.tone
      )}
    >
      <div
        className={cn(
          "absolute -right-20 -top-20 size-44 rounded-full bg-gradient-to-br blur-2xl opacity-50",
          game.tone
        )}
      />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex size-12 items-center justify-center rounded-xl bg-background/40 text-primary">
            <Icon className="size-6" />
          </div>
          <Badge variant="outline" className="text-[10px]">
            {game.difficulties.length} niveles
          </Badge>
        </div>
        <div>
          <p className="font-jp text-[10px] tracking-[0.25em] text-muted-foreground">
            {game.jp}
          </p>
          <p className="text-lg font-semibold tracking-tight">{game.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {game.description}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {game.difficulties.map((d) => (
            <DifficultyButton key={d} game={game} difficulty={d} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DifficultyButton({
  game,
  difficulty,
}: {
  game: MinigameDef;
  difficulty: Difficulty;
}) {
  const { data: best } = useMinigameBest(`${game.key}_${difficulty}`);
  return (
    <Link
      to={`${game.path}?d=${difficulty}`}
      className={cn(
        "group flex flex-col items-center gap-0.5 rounded-lg border bg-card/40 px-2 py-2 text-center transition-all",
        "hover:border-primary/40 hover:bg-accent/30"
      )}
    >
      <span
        className={cn(
          "text-[11px] font-semibold",
          DIFFICULTY_COLORS[difficulty]
        )}
      >
        {DIFFICULTY_LABELS[difficulty]}
      </span>
      {typeof best === "number" && best > 0 ? (
        <span className="inline-flex items-center gap-0.5 text-[9px] text-warning">
          <Trophy className="size-2.5" />
          {best}
        </span>
      ) : (
        <span className="text-[9px] text-muted-foreground">—</span>
      )}
    </Link>
  );
}

function ComingSoonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/50 bg-card/30 p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground">
          <Gamepad2 className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            Próximamente
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sentence Builder · Listening Rush · Vocab Memory
          </p>
        </div>
      </div>
    </div>
  );
}
