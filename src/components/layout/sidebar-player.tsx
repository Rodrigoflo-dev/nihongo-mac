import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { usePlayer } from "@/hooks/use-player";
import { cn } from "@/lib/utils";

export function SidebarPlayer() {
  const { data: player } = usePlayer();

  if (!player) {
    return <div className="h-[88px] px-3" data-tauri-no-drag />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="relative mx-1 overflow-hidden rounded-xl glass"
      data-tauri-no-drag
    >
      {/* Animated glow accent */}
      <div
        aria-hidden
        className="absolute -inset-1 bg-gradient-to-r from-neon-violet/20 via-primary/10 to-neon-cyan/20 blur-md"
      />

      <div className="relative px-3 py-3">
        <div className="flex items-center gap-3">
          <LevelChip level={player.level} pulse={player.doubleXpActive} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">
              {player.title}
            </p>
            <p className="font-jp text-[10px] tracking-[0.2em] text-sidebar-foreground/60">
              {player.titleJp}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-warning">
            <Star className="size-3 fill-current" />
            <span className="text-[11px] font-semibold tabular-nums">
              {player.stars}
            </span>
          </div>
        </div>

        <div className="mt-2.5 space-y-1">
          <div className="relative h-1.5 overflow-hidden rounded-full bg-secondary/60">
            <Progress
              value={player.progressPct}
              className="absolute inset-0 h-full bg-transparent"
            />
            <div className="absolute inset-0 shimmer rounded-full opacity-50" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-sidebar-foreground/55">
            <span>{player.currentLevelXp} XP</span>
            <span>{player.xpToNextLevel} para nv {player.level + 1}</span>
          </div>
        </div>

        {player.doubleXpActive ? (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-streak/15 px-2 py-0.5 text-[10px] text-streak">
            <Sparkles className="size-2.5" />
            2× XP activo
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function LevelChip({ level, pulse }: { level: number; pulse?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex size-10 items-center justify-center rounded-xl",
        "bg-gradient-to-br from-neon-violet via-primary to-neon-cyan text-primary-foreground",
        "shadow-[0_8px_24px_-6px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]"
      )}
    >
      <div className="absolute inset-0.5 rounded-[10px] border border-white/30" />
      <span className="text-base font-bold tabular-nums">{level}</span>
      {pulse ? (
        <span className="absolute inset-0 rounded-xl ring-1 ring-streak/60 animate-ring-pulse" />
      ) : null}
    </div>
  );
}
