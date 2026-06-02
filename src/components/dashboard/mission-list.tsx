import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, Star, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DailyMission, WeeklyMission } from "@/lib/api";
import { cn } from "@/lib/utils";

type Mission = DailyMission | WeeklyMission;

interface MissionListProps {
  title: string;
  jp: string;
  description?: string;
  missions: Mission[];
  emptyLabel?: string;
}

export function MissionList({
  title,
  jp,
  description,
  missions,
  emptyLabel = "No hay misiones por ahora.",
}: MissionListProps) {
  const completed = missions.filter((m) => m.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
                {jp}
              </p>
              <CardTitle className="mt-0.5">{title}</CardTitle>
              {description ? (
                <CardDescription className="mt-1">{description}</CardDescription>
              ) : null}
            </div>
            <Badge variant="outline" className="font-mono">
              {completed}/{missions.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {missions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            <AnimatePresence initial={false}>
              {missions.map((m) => (
                <MissionRow key={m.id} mission={m} />
              ))}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MissionRow({ mission }: { mission: Mission }) {
  const pct = Math.min(
    100,
    Math.round((mission.progress / mission.targetValue) * 100)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-lg border bg-card/60 px-4 py-3 transition-colors",
        mission.completed && "border-success/30 bg-success/5"
      )}
    >
      <div className="flex items-center gap-3">
        <CheckCircle completed={mission.completed} />
        <div className="flex-1">
          <p className="text-sm font-medium">{mission.title}</p>
          <p className="text-xs text-muted-foreground">{mission.description}</p>
        </div>
        <RewardChips
          xp={mission.xpReward}
          stars={mission.starReward}
          completed={mission.completed}
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Progress value={pct} className="h-1.5 flex-1" />
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {mission.progress}/{mission.targetValue}
        </span>
      </div>
    </motion.div>
  );
}

function CheckCircle({ completed }: { completed: boolean }) {
  return (
    <div
      className={cn(
        "flex size-7 items-center justify-center rounded-full border transition-all",
        completed
          ? "border-success bg-success text-success-foreground"
          : "border-input bg-background"
      )}
    >
      {completed ? <Check className="size-3.5" /> : null}
    </div>
  );
}

function RewardChips({
  xp,
  stars,
  completed,
}: {
  xp: number;
  stars: number;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <RewardChip icon={Sparkles} value={`+${xp} XP`} dim={completed} />
      {stars > 0 ? (
        <RewardChip icon={Star} value={stars} dim={completed} highlight />
      ) : null}
    </div>
  );
}

function RewardChip({
  icon: Icon,
  value,
  dim,
  highlight,
}: {
  icon: LucideIcon;
  value: React.ReactNode;
  dim?: boolean;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        highlight
          ? "bg-warning/15 text-warning"
          : "bg-primary/10 text-primary",
        dim && "opacity-50"
      )}
    >
      <Icon className="size-3" />
      {value}
    </span>
  );
}
