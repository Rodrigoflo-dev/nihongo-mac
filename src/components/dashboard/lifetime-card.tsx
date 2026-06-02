import { motion } from "framer-motion";
import { Calendar, Clock, type LucideIcon, Repeat, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { LifetimeStats } from "@/lib/api";

interface LifetimeCardProps {
  lifetime: LifetimeStats;
}

export function LifetimeCard({ lifetime }: LifetimeCardProps) {
  const hours = Math.floor(lifetime.totalHours);
  const minutes = lifetime.totalMinutes % 60;
  const hoursLabel = `${hours}h ${minutes.toString().padStart(2, "0")}m`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-4 gap-4">
            <Stat
              icon={Clock}
              label="Tiempo total"
              value={hoursLabel}
              hint="aprendiendo"
              accent
            />
            <Stat
              icon={Calendar}
              label="Días activos"
              value={lifetime.activeDays}
            />
            <Stat
              icon={Repeat}
              label="Repasos"
              value={lifetime.totalReviews}
            />
            <Stat
              icon={Trophy}
              label="Kanjis dominados"
              value={lifetime.totalKanjiMastered}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
}

function Stat({ icon: Icon, label, value, hint, accent }: StatProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={accent ? "size-3.5 text-primary" : "size-3.5"} />
        <span>{label}</span>
      </div>
      <p className="text-xl font-semibold tracking-tight">
        {value}
        {hint ? (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </p>
    </div>
  );
}
