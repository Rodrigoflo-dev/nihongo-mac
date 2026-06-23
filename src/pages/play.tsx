import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Flame,
  Headphones,
  type LucideIcon,
  Puzzle,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
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
      <div className="relative">
        <PageHeader
          eyebrow="ミニゲーム — Mini-juegos"
          title={
            <>
              Aprende <span className="gradient-text-warm">jugando</span>
            </>
          }
          description="Cada juego entrena un skill específico. La dificultad alta da más XP. Bate tu récord para ganar estrellas extra."
        />
        <HoloKanji
          size={130}
          className="pointer-events-none absolute -top-6 right-0 hidden lg:block"
          items={[
            { char: "遊", meaning: "Jugar" },
            { char: "戦", meaning: "Batalla" },
            { char: "勝", meaning: "Victoria" },
          ]}
        />
      </div>

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
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            カタログ — Catálogo
          </p>
          <h2 className="font-display text-lg font-extrabold tracking-tight">
            Catálogo
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {MINIGAMES.map((g) => (
            <GameCard key={g.key} game={g} />
          ))}
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
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative"
    >
      <div
        className={cn(
          "absolute -inset-1 rounded-3xl bg-gradient-to-br opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-70",
          accent
        )}
      />
      <HudPanel glow className="p-6">
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
            <span className="rounded-full bg-warning/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-warning">
              {bonusLabel}
            </span>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl border border-primary/20 bg-background/40 text-primary shadow-[0_0_24px_-10px_color-mix(in_oklch,var(--color-primary)_70%,transparent)] transition-transform duration-300 group-hover:scale-110">
              <GameIcon className="size-7" />
            </div>
            <div className="flex-1">
              <p className="font-jp text-[10px] tracking-[0.25em] text-neon-cyan">
                {jp}
              </p>
              <p className="font-display text-lg font-extrabold tracking-tight">
                {game.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {game.description}
              </p>
            </div>
          </div>
          <div>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Elige dificultad
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {game.difficulties.map((d) => (
                <DifficultyButton key={d} game={game} difficulty={d} />
              ))}
            </div>
          </div>
        </div>
      </HudPanel>
    </motion.div>
  );
}

function GameCard({ game }: { game: MinigameDef }) {
  const Icon = ICONS[game.icon];
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl glass shimmer p-6 ring-1 transition-shadow duration-300 hover:shadow-[0_0_36px_-12px_color-mix(in_oklch,var(--color-primary)_50%,transparent)]",
        game.tone
      )}
    >
      <div
        className={cn(
          "absolute -right-20 -top-20 size-44 rounded-full bg-gradient-to-br opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-80",
          game.tone
        )}
      />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-background/40 text-primary transition-transform duration-300 group-hover:scale-110">
            <Icon className="size-6" />
          </div>
          <Badge variant="outline" className="text-[10px]">
            {game.difficulties.length} niveles
          </Badge>
        </div>
        <div>
          <p className="font-jp text-[10px] tracking-[0.25em] text-neon-cyan">
            {game.jp}
          </p>
          <p className="font-display text-lg font-extrabold tracking-tight">
            {game.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {game.description}
          </p>
        </div>
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Elige dificultad
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {game.difficulties.map((d) => (
              <DifficultyButton key={d} game={game} difficulty={d} />
            ))}
          </div>
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
        "group/diff flex flex-col items-center gap-0.5 rounded-lg border border-border bg-card/60 px-2 py-2.5 text-center transition-all",
        "hover:-translate-y-0.5 hover:border-primary/60 hover:bg-accent/40 hover:shadow-[0_8px_20px_-10px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]"
      )}
    >
      <span
        className={cn("text-[12px] font-bold", DIFFICULTY_COLORS[difficulty])}
      >
        {DIFFICULTY_LABELS[difficulty]}
      </span>
      {typeof best === "number" && best > 0 ? (
        <span className="inline-flex items-center gap-0.5 text-[9px] text-warning">
          <Trophy className="size-2.5" />
          récord {best}
        </span>
      ) : (
        <span className="text-[9px] font-medium text-primary/80">Jugar ▸</span>
      )}
    </Link>
  );
}
