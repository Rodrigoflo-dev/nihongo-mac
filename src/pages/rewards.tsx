import { motion } from "framer-motion";
import {
  Coffee,
  Forward,
  Gift,
  Lightbulb,
  Palette,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { useActivateDoubleXp, useClaimRestDay, usePlayer } from "@/hooks/use-player";
import { usePurchaseReward, useRewards } from "@/hooks/use-rewards";
import type { Reward } from "@/lib/api";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  coffee: Coffee,
  sparkles: Sparkles,
  forward: Forward,
  lightbulb: Lightbulb,
  palette: Palette,
};

const KIND_HUE: Record<string, string> = {
  rest_day: "from-neon-cyan/40 to-primary/30",
  double_xp_24h: "from-streak/40 to-neon-pink/30",
  skip_review: "from-neon-amber/40 to-warning/30",
  hint_pack: "from-warning/40 to-neon-amber/30",
  theme: "from-neon-pink/40 to-neon-violet/30",
};

export default function RewardsPage() {
  const { data: player } = usePlayer();
  const { data: rewards, isLoading } = useRewards();
  const purchase = usePurchaseReward();
  const activateDoubleXp = useActivateDoubleXp();
  const claimRestDay = useClaimRestDay();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        eyebrow="ご褒美 — Recompensas"
        title={
          <>
            Cambia tus estrellas por <span className="gradient-text-warm">recompensas</span>
          </>
        }
        description="Tu progreso real te gana recompensas tangibles para hacer la práctica más flexible y divertida."
        actions={
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2">
            <Star className="size-4 fill-warning text-warning" />
            <span className="text-lg font-bold tabular-nums">
              {player?.stars ?? 0}
            </span>
          </div>
        }
      />

      {/* Active boosts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-4"
      >
        <ActiveCard
          title="XP doble"
          jp="二倍経験値"
          description={
            player?.doubleXpActive
              ? "Activo ahora. Cada XP cuenta el doble."
              : "Activa un boost cuando tengas uno disponible."
          }
          icon={Sparkles}
          tone="from-streak/30 to-neon-pink/20"
          active={player?.doubleXpActive ?? false}
          action={
            <Button
              variant="outline"
              size="sm"
              disabled={
                player?.doubleXpActive || activateDoubleXp.isPending
              }
              onClick={() => activateDoubleXp.mutate()}
            >
              Activar
            </Button>
          }
        />
        <ActiveCard
          title="Día libre"
          jp="休みの日"
          description={
            (player?.restDaysAvailable ?? 0) > 0
              ? `Tienes ${player?.restDaysAvailable} día(s) disponibles para descansar.`
              : "Compra uno abajo para descansar sin perder progreso."
          }
          icon={Coffee}
          tone="from-neon-cyan/30 to-primary/20"
          active={player?.restDayActiveToday ?? false}
          action={
            <Button
              variant="outline"
              size="sm"
              disabled={
                (player?.restDaysAvailable ?? 0) <= 0 ||
                player?.restDayActiveToday ||
                claimRestDay.isPending
              }
              onClick={() => claimRestDay.mutate()}
            >
              {player?.restDayActiveToday ? "Activo hoy" : "Tomar hoy"}
            </Button>
          }
        />
      </motion.div>

      {/* Catalog */}
      <section className="space-y-5">
        <div>
          <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
            カタログ
          </p>
          <h2 className="text-lg font-semibold">Catálogo</h2>
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {rewards?.map((r) => (
              <RewardCard
                key={r.id}
                reward={r}
                stars={player?.stars ?? 0}
                disabled={purchase.isPending}
                onBuy={() => purchase.mutate(r.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface ActiveCardProps {
  title: string;
  jp: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  active: boolean;
  action: React.ReactNode;
}

function ActiveCard({
  title,
  jp,
  description,
  icon: Icon,
  tone,
  active,
  action,
}: ActiveCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl glass p-5",
        active && "ring-1 ring-streak/50"
      )}
    >
      <div
        className={cn(
          "absolute -right-16 -top-16 size-44 rounded-full bg-gradient-to-br blur-2xl opacity-70",
          tone
        )}
      />
      <div className="relative flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-background/40 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-jp text-[10px] tracking-[0.3em] text-muted-foreground">
            {jp}
          </p>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          <div className="mt-3">{action}</div>
        </div>
      </div>
    </div>
  );
}

interface RewardCardProps {
  reward: Reward;
  stars: number;
  disabled?: boolean;
  onBuy: () => void;
}

function RewardCard({ reward, stars, disabled, onBuy }: RewardCardProps) {
  const Icon = ICONS[reward.icon ?? ""] ?? Gift;
  const canBuy = stars >= reward.cost;
  const tone = KIND_HUE[reward.kind] ?? "from-primary/30 to-neon-violet/20";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="relative overflow-hidden rounded-2xl glass p-5"
    >
      <div
        className={cn(
          "absolute -right-20 -top-20 size-44 rounded-full bg-gradient-to-br blur-2xl opacity-60",
          tone
        )}
      />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex size-11 items-center justify-center rounded-xl bg-background/40 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-1 text-warning">
            <Star className="size-3 fill-current" />
            <span className="text-xs font-bold tabular-nums">{reward.cost}</span>
          </div>
        </div>
        <div>
          <p className="font-semibold">{reward.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {reward.description}
          </p>
          {reward.ownedQuantity > 0 ? (
            <p className="mt-2 text-[10px] uppercase tracking-widest text-success">
              Tienes {reward.ownedQuantity}
            </p>
          ) : null}
        </div>
        <Button
          className="w-full"
          variant={canBuy ? "default" : "outline"}
          disabled={!canBuy || disabled}
          onClick={onBuy}
        >
          {canBuy ? "Comprar" : "Insuficiente"}
        </Button>
      </div>
    </motion.div>
  );
}
