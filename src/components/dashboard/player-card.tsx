import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PlayerState } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  player: PlayerState;
  name: string;
}

export function PlayerCard({ player, name }: PlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <LevelBadge level={player.level} />
              <div>
                <p className="font-jp text-xs tracking-[0.25em] text-muted-foreground">
                  {player.titleJp}
                </p>
                <h2 className="text-lg font-semibold tracking-tight">
                  {name} — {player.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Nivel {player.level} · {player.currentLevelXp} / {player.xpToNextLevel} XP
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2" data-tauri-no-drag>
              <StarsPill stars={player.stars} />
              {player.doubleXpActive ? (
                <Badge variant="streak" className="gap-1">
                  <Sparkles className="size-3" /> 2× XP
                </Badge>
              ) : null}
              {player.restDayActiveToday ? (
                <Badge variant="secondary">Día libre</Badge>
              ) : null}
            </div>
          </div>

          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progreso al nivel {player.level + 1}</span>
              <span>{player.progressPct}%</span>
            </div>
            <Progress
              value={player.progressPct}
              className="h-2.5 bg-secondary/50"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LevelBadge({ level }: { level: number }) {
  return (
    <div
      className={cn(
        "relative flex size-14 items-center justify-center rounded-xl",
        "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md"
      )}
    >
      <div className="absolute inset-0.5 rounded-[10px] border border-white/20" />
      <span className="text-xl font-bold tabular-nums">{level}</span>
    </div>
  );
}

function StarsPill({ stars }: { stars: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-warning">
      <Star className="size-3.5 fill-current" />
      <span className="text-sm font-semibold tabular-nums">{stars}</span>
    </div>
  );
}
