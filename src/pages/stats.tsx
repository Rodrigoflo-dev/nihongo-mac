import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Calendar, Clock, type LucideIcon, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { api } from "@/lib/api";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { cn } from "@/lib/utils";

export default function StatsPage() {
  const { data: stats } = useDashboardStats();
  const { data: heatmap } = useQuery({
    queryKey: ["heatmap"],
    queryFn: () => api.getActivityHeatmap(112),
    staleTime: 1000 * 30,
  });
  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => api.getAchievements(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="flex items-start justify-between gap-8">
        <PageHeader
          eyebrow="進捗 — Progreso"
          title={
            <>
              Tu evolución <span className="gradient-text">completa</span>
            </>
          }
          description="Cuánto has invertido, días activos, kanjis dominados y los logros desbloqueados."
        />
        <HoloKanji
          size={170}
          className="hidden lg:block"
          items={[
            { char: "統", meaning: "Datos" },
            { char: "力", meaning: "Fuerza" },
            { char: "伸", meaning: "Progreso" },
          ]}
        />
      </div>

      {/* Lifetime tiles */}
      {stats ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile
            icon={Clock}
            label="Tiempo aprendido"
            value={`${Math.floor(stats.lifetime.totalHours)}h ${(
              stats.lifetime.totalMinutes % 60
            )
              .toString()
              .padStart(2, "0")}m`}
            tone="primary"
          />
          <Tile
            icon={Calendar}
            label="Días activos"
            value={stats.lifetime.activeDays}
            tone="cyan"
          />
          <Tile
            icon={Sparkles}
            label="XP total"
            value={stats.player.totalXp}
            tone="violet"
          />
          <Tile
            icon={Award}
            label="Logros"
            value={
              achievements
                ? `${achievements.filter((a) => a.unlocked).length}/${achievements.length}`
                : "—"
            }
            tone="amber"
          />
        </div>
      ) : null}

      {/* Heatmap */}
      <section className="space-y-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            活動 — Actividad
          </p>
          <h2 className="mt-1 font-display text-lg font-extrabold tracking-tight">
            Tu actividad de los últimos meses
          </h2>
        </div>
        <Heatmap data={heatmap ?? []} />
      </section>

      {/* Achievements grid */}
      <section className="space-y-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            実績 — Logros
          </p>
          <h2 className="mt-1 font-display text-lg font-extrabold tracking-tight">
            Logros
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {achievements?.map((a) => <AchievementCard key={a.id} a={a} />)}
        </div>
      </section>
    </div>
  );
}

const TONE: Record<string, string> = {
  primary: "from-primary/30 to-primary/5 text-primary",
  cyan: "from-neon-cyan/30 to-primary/5 text-neon-cyan",
  violet: "from-neon-violet/30 to-primary/5 text-neon-violet",
  amber: "from-neon-amber/30 to-warning/5 text-neon-amber",
};

function Tile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-3xl glass-strong p-4"
    >
      {/* glow blob */}
      <div
        className={cn(
          "absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition-opacity group-hover:opacity-70",
          TONE[tone] ?? TONE.primary
        )}
      />
      {/* hover corner brackets */}
      <span className="hud-corner left-2 top-2 border-l-2 border-t-2 opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="hud-corner right-2 top-2 border-r-2 border-t-2 opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="hud-corner bottom-2 left-2 border-b-2 border-l-2 opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="hud-corner bottom-2 right-2 border-b-2 border-r-2 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Icon className={cn("size-3.5", TONE[tone] ?? TONE.primary)} />
          {label}
        </div>
        <p className="mt-2 font-display text-2xl font-extrabold tabular-nums">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

const HEATMAP_MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
type HeatCell = { date: string; minutes: number };

/**
 * Activity shown as a bar chart (Rodrigo's request): one bar per week over the
 * last ~4 months, height = minutes studied that week. Clearer than a dot grid.
 */
function Heatmap({ data }: { data: HeatCell[] }) {
  const days = 112;
  const today = new Date();

  // Build the last `days` days (oldest → newest).
  const cells: HeatCell[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const found = data.find((x) => x.date === iso);
    cells.push({ date: iso, minutes: found?.minutes ?? 0 });
  }

  // Group into weeks (chunks of 7, oldest first) and sum minutes per week.
  const weeks: { start: string; minutes: number }[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const chunk = cells.slice(i, i + 7);
    weeks.push({
      start: chunk[0].date,
      minutes: chunk.reduce((s, c) => s + c.minutes, 0),
    });
  }

  const maxWeek = Math.max(1, ...weeks.map((w) => w.minutes));
  const activeDays = cells.filter((c) => c.minutes > 0).length;
  const totalMinutes = cells.reduce((s, c) => s + c.minutes, 0);
  const bestWeek = Math.max(0, ...weeks.map((w) => w.minutes));

  // Month label under a bar the first time a week falls in a new month.
  let lastMonth = -1;
  const monthLabels = weeks.map((w) => {
    const m = new Date(w.start + "T00:00:00").getMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      return HEATMAP_MONTHS[m];
    }
    return "";
  });

  const fmtDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("es", {
      day: "numeric",
      month: "long",
    });

  return (
    <HudPanel glow className="p-5">
      <p className="mb-4 text-xs text-muted-foreground">
        Minutos que estudiaste por semana en los últimos ~4 meses. Cada barra es
        una semana.
      </p>

      {/* Bar chart */}
      <div className="flex h-40 items-end gap-1.5">
        {weeks.map((w, wi) => {
          const pct = w.minutes > 0 ? Math.max(6, (w.minutes / maxWeek) * 100) : 0;
          return (
            <div
              key={wi}
              className="group relative flex h-full flex-1 items-end"
              title={`Semana del ${fmtDate(w.start)}: ${w.minutes} min`}
            >
              {/* track */}
              <div className="absolute inset-x-0 bottom-0 top-0 rounded-md bg-card/30" />
              {/* bar */}
              <div
                className={cn(
                  "relative w-full rounded-md bg-gradient-to-t from-neon-violet to-neon-cyan transition-all group-hover:brightness-125",
                  w.minutes === 0 && "bg-none"
                )}
                style={{ height: `${pct}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Month axis */}
      <div className="mt-1.5 flex gap-1.5">
        {monthLabels.map((label, i) => (
          <span
            key={i}
            className="flex-1 text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{activeDays}</span> días
          activos ·{" "}
          <span className="font-semibold text-foreground">{totalMinutes}</span> min
          en total
        </p>
        <p>
          Mejor semana:{" "}
          <span className="font-semibold text-neon-cyan">{bestWeek} min</span>
        </p>
      </div>
    </HudPanel>
  );
}

function AchievementCard({
  a,
}: {
  a: {
    title: string;
    description: string | null;
    tier: string | null;
    unlocked: boolean;
    progress: number;
    target: number;
  };
}) {
  const pct = Math.min(100, Math.round((a.progress / a.target) * 100));
  const tone =
    a.tier === "gold"
      ? "from-warning/40 to-streak/30 text-warning"
      : a.tier === "silver"
        ? "from-primary/30 to-neon-cyan/20 text-primary"
        : "from-neon-amber/30 to-warning/20 text-warning";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl glass-strong p-4 transition-shadow",
        a.unlocked &&
          "shadow-[0_0_28px_-12px_color-mix(in_oklch,var(--color-warning)_60%,transparent)]"
      )}
    >
      {a.unlocked ? (
        <>
          <span className="hud-corner left-2 top-2 border-l-2 border-t-2 opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="hud-corner right-2 top-2 border-r-2 border-t-2 opacity-0 transition-opacity group-hover:opacity-100" />
        </>
      ) : null}
      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110",
            tone,
            !a.unlocked && "opacity-40 grayscale"
          )}
        >
          <Award className="size-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-display text-sm font-extrabold tracking-tight">
              {a.title}
            </p>
            {a.unlocked ? (
              <Badge variant="warning" className="text-[9px]">
                Desbloqueado
              </Badge>
            ) : null}
          </div>
          {a.description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
          ) : null}
          <div className="mt-2 flex items-center gap-2">
            <Progress value={pct} className="h-1 flex-1" />
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {a.progress}/{a.target}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
