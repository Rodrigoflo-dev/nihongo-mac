import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings2, Sparkles } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { PlayerAvatar } from "@/components/profile/player-avatar";
import { CurrencyBadge } from "@/components/visual/currency-icon";
import { usePlayer } from "@/hooks/use-player";

export function SidebarPlayer() {
  const { data: player } = usePlayer();

  if (!player) {
    return <div className="h-[96px] px-3" data-tauri-no-drag />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="relative mx-1"
      data-tauri-no-drag
    >
      {/* Animated glow accent */}
      <div
        aria-hidden
        className="absolute -inset-1 rounded-xl bg-gradient-to-r from-neon-violet/20 via-primary/10 to-neon-cyan/20 blur-md"
      />

      <Link
        to="/rewards"
        className="group relative block overflow-hidden rounded-xl glass transition-shadow hover:shadow-[0_0_28px_-10px_color-mix(in_oklch,var(--color-primary)_70%,transparent)]"
        title="Personaliza tu perfil"
      >
        {/* "Personalizar" affordance */}
        <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-background/50 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Settings2 className="size-2.5" />
          Editar
        </span>

        <div className="relative px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <PlayerAvatar level={player.level} size={44} />
              {/* Level chip on the avatar corner */}
              <span className="absolute -bottom-1 -right-1 grid size-[18px] place-items-center rounded-full bg-background text-[10px] font-bold tabular-nums text-primary ring-1 ring-primary/50">
                {player.level}
              </span>
              {player.doubleXpActive ? (
                <span className="absolute inset-0 rounded-xl ring-1 ring-streak/60 animate-ring-pulse" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">
                {player.title}
              </p>
              <p className="font-jp text-[10px] tracking-[0.2em] text-sidebar-foreground/60">
                {player.titleJp}
              </p>
            </div>
            <CurrencyBadge amount={player.stars} size="sm" />
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
              <span className="tabular-nums">{player.currentLevelXp} XP</span>
              <span className="tabular-nums">
                {player.xpToNextLevel} para nv {player.level + 1}
              </span>
            </div>
          </div>

          {player.doubleXpActive ? (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-streak/15 px-2 py-0.5 text-[10px] text-streak">
              <Sparkles className="size-2.5" />
              2× XP activo
            </div>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}
