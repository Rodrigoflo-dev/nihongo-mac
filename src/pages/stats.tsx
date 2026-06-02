import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Calendar, Clock, type LucideIcon, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
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
      <PageHeader
        eyebrow="進捗 — Progreso"
        title={
          <>
            Tu evolución <span className="gradient-text">completa</span>
          </>
        }
        description="Cuánto has invertido, días activos, kanjis dominados y los logros desbloqueados."
      />

      {/* Lifetime tiles */}
      {stats ? (
        <div className="grid grid-cols-4 gap-3">
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
          <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
            活動 — Actividad
          </p>
          <h2 className="text-lg font-semibold">Tu actividad de los últimos meses</h2>
        </div>
        <Heatmap data={heatmap ?? []} />
      </section>

      {/* Achievements grid */}
      <section className="space-y-4">
        <div>
          <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
            実績 — Logros
          </p>
          <h2 className="text-lg font-semibold">Logros</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {achievements?.map((a) => <AchievementCard key={a.id} a={a} />)}
        </div>
      </section>
    </div>
  );
}

const TONE: Record<string, string> = {
  primary: "from-primary/30 to-primary/10 ring-primary/30",
  cyan: "from-neon-cyan/30 to-primary/10 ring-neon-cyan/30",
  violet: "from-neon-violet/30 to-primary/10 ring-neon-violet/30",
  amber: "from-neon-amber/30 to-warning/10 ring-warning/30",
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
      className={cn(
        "relative overflow-hidden rounded-2xl glass p-4 ring-1",
        TONE[tone] ?? TONE.primary
      )}
    >
      <div
        className={cn(
          "absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br opacity-50 blur-2xl",
          TONE[tone] ?? TONE.primary
        )}
      />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <Icon className="size-3.5" />
          {label}
        </div>
        <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      </div>
    </motion.div>
  );
}

function Heatmap({ data }: { data: { date: string; minutes: number }[] }) {
  const days = 112;
  const today = new Date();
  const cells: { date: string; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const found = data.find((x) => x.date === iso);
    cells.push({ date: iso, minutes: found?.minutes ?? 0 });
  }
  const tone = (m: number) => {
    if (m === 0) return "bg-secondary/40";
    if (m < 5) return "bg-primary/25";
    if (m < 15) return "bg-primary/45";
    if (m < 30) return "bg-primary/70";
    return "bg-primary";
  };
  return (
    <div className="overflow-hidden rounded-2xl glass p-4">
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {cells.map((c) => (
          <div
            key={c.date}
            title={`${c.date}: ${c.minutes} min`}
            className={cn(
              "size-3 rounded-sm transition-colors",
              tone(c.minutes)
            )}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Menos</span>
        {[0, 5, 15, 30, 45].map((m) => (
          <div key={m} className={cn("size-3 rounded-sm", tone(m))} />
        ))}
        <span>Más</span>
      </div>
    </div>
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
      className={cn(
        "relative overflow-hidden rounded-2xl glass p-4",
        a.unlocked && "ring-1 ring-warning/40"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br",
            tone,
            !a.unlocked && "opacity-40 grayscale"
          )}
        >
          <Award className="size-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{a.title}</p>
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
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {a.progress}/{a.target}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
