import { motion } from "framer-motion";
import { Calendar, Clock, Sparkles, Trophy } from "lucide-react";

import { CurrencyIcon } from "@/components/visual/currency-icon";

import { Progress } from "@/components/ui/progress";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { MissionList } from "@/components/dashboard/mission-list";
import { NextActionHero } from "@/components/dashboard/next-action-hero";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useNextAction } from "@/hooks/use-next-action";
import { useUserProfile } from "@/hooks/use-user-profile";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const GREETING_JP = {
  morning: "おはよう",
  afternoon: "こんにちは",
  evening: "こんばんは",
};

function timeOfDay(): keyof typeof GREETING_JP {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 19) return "afternoon";
  return "evening";
}

export default function DashboardPage() {
  const t = useT();
  const { data: profile } = useUserProfile();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: action } = useNextAction();

  const tod = timeOfDay();
  const name = profile?.name?.trim() || t("dash.learner");

  if (isLoading || !stats || !profile) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-muted-foreground">読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* Greeting strip */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1.5"
      >
        <p className="font-jp text-xs tracking-[0.4em] text-muted-foreground">
          {GREETING_JP[tod]}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t(`dash.greeting.${tod}`)},{" "}
          <span className="gradient-text">{name}</span>
        </h1>
      </motion.div>

      {/* Single, gigantic next-action hero */}
      {action ? <NextActionHero action={action} /> : null}

      {/* Adaptive, personalized focus based on the user's own accuracy */}
      <InsightsCard />

      {/* Compact stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-4 gap-3"
      >
        <StatTile
          icon={<Clock className="size-3.5 text-neon-cyan" />}
          label={t("dash.stat.time")}
          value={`${Math.floor(stats.lifetime.totalHours)}h ${
            (stats.lifetime.totalMinutes % 60).toString().padStart(2, "0")
          }m`}
          accent
        />
        <StatTile
          icon={<Calendar className="size-3.5 text-neon-violet" />}
          label={t("dash.stat.days")}
          value={stats.lifetime.activeDays}
        />
        <StatTile
          icon={<Trophy className="size-3.5 text-neon-amber" />}
          label={t("dash.stat.kanji")}
          value={stats.lifetime.totalKanjiMastered}
        />
        <StatTile
          icon={<CurrencyIcon className="size-3.5" />}
          label={t("dash.stat.coins")}
          value={stats.player.stars}
        />
      </motion.div>

      {/* Player progress bar (slim, prominent) */}
      <PlayerStrip
        level={stats.player.level}
        title={stats.player.title}
        titleJp={stats.player.titleJp}
        progressPct={stats.player.progressPct}
        currentXp={stats.player.currentLevelXp}
        toNext={stats.player.xpToNextLevel}
        doubleXp={stats.player.doubleXpActive}
      />

      {/* Missions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <MissionList
          title={t("dash.missions.daily")}
          jp="今日のミッション"
          description={t("dash.missions.dailyDesc")}
          missions={stats.dailyMissions}
        />
        <MissionList
          title={t("dash.missions.weekly")}
          jp="今週のミッション"
          description={t("dash.missions.weeklyDesc")}
          missions={stats.weeklyMissions}
        />
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative overflow-hidden rounded-xl glass px-4 py-3 transition-colors hover:bg-accent/30",
        accent && "ring-1 ring-neon-cyan/40"
      )}
    >
      <div
        aria-hidden
        className="absolute -right-8 -top-8 size-20 rounded-full bg-gradient-to-br from-primary/20 to-neon-cyan/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
      />
      <span className="hud-corner right-2 top-2 border-r-2 border-t-2 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="relative mt-1 font-display text-2xl font-extrabold tracking-tight tabular-nums">
        {value}
      </p>
    </motion.div>
  );
}

interface PlayerStripProps {
  level: number;
  title: string;
  titleJp: string;
  progressPct: number;
  currentXp: number;
  toNext: number;
  doubleXp: boolean;
}

function PlayerStrip({
  level,
  title,
  titleJp,
  progressPct,
  currentXp,
  toNext,
  doubleXp,
}: PlayerStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl glass-strong"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-neon-cyan/10"
      />
      <div className="relative flex items-center gap-5 p-5">
        <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-violet via-primary to-neon-cyan text-primary-foreground shadow-[0_16px_40px_-10px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]">
          <div className="absolute inset-1 rounded-xl border border-white/30" />
          <span className="text-xl font-bold tabular-nums">{level}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-jp text-[10px] tracking-[0.3em] text-muted-foreground">
            {titleJp}
          </p>
          <p className="truncate text-sm font-semibold">{title}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary/60">
              <Progress
                value={progressPct}
                className="absolute inset-0 h-full bg-transparent"
              />
              <div className="absolute inset-0 shimmer rounded-full opacity-40" />
            </div>
            <p className="text-xs tabular-nums text-muted-foreground">
              {currentXp}/{toNext} XP
            </p>
          </div>
        </div>
        {doubleXp ? (
          <div className="inline-flex items-center gap-1 rounded-full bg-streak/20 px-2.5 py-1 text-xs text-streak">
            <Sparkles className="size-3" />
            2× XP
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
