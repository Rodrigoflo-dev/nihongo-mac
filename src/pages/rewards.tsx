import { useRef } from "react";
import { motion } from "framer-motion";
import {
  Coffee,
  Forward,
  Gift,
  Lightbulb,
  Lock,
  Palette,
  Sparkles,
  Upload,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { PlayerAvatar } from "@/components/profile/player-avatar";
import { CurrencyBadge, CurrencyIcon } from "@/components/visual/currency-icon";
import { useActivateDoubleXp, useClaimRestDay, usePlayer } from "@/hooks/use-player";
import { usePurchaseReward, useRewards } from "@/hooks/use-rewards";
import { ACCENTS, useAccent } from "@/providers/accent";
import {
  AVATARS,
  BACKGROUNDS,
  useCosmetics,
} from "@/providers/cosmetics";
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
      <div className="relative">
        <PageHeader
          eyebrow="店 — Tienda"
          title={
            <>
              Gasta tus estrellas en la <span className="gradient-text-warm">Tienda</span>
            </>
          }
          description="Tu progreso real te gana estrellas. Cámbialas por mejoras de práctica y personaliza la app con temas que solo tú desbloqueas."
          actions={<CurrencyBadge amount={player?.stars ?? 0} size="lg" />}
        />
        <HoloKanji
          size={120}
          className="pointer-events-none absolute -top-4 right-28 hidden xl:block"
          items={[
            { char: "宝", meaning: "Tesoro" },
            { char: "星", meaning: "Estrella" },
            { char: "賞", meaning: "Premio" },
          ]}
        />
      </div>

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
              ? "Activo ahora. Cada XP cuenta el doble durante 24h."
              : (player?.doubleXpAvailable ?? 0) > 0
                ? `Tienes ${player?.doubleXpAvailable} boost(s). Actívalo para duplicar tu XP 24h.`
                : "Cómpralo abajo en el catálogo y luego actívalo aquí."
          }
          icon={Sparkles}
          tone="from-streak/30 to-neon-pink/20"
          active={player?.doubleXpActive ?? false}
          action={
            <Button
              variant="outline"
              size="sm"
              disabled={
                player?.doubleXpActive ||
                (player?.doubleXpAvailable ?? 0) <= 0 ||
                activateDoubleXp.isPending
              }
              onClick={() => activateDoubleXp.mutate()}
            >
              {player?.doubleXpActive
                ? "Activo"
                : (player?.doubleXpAvailable ?? 0) > 0
                  ? `Activar (${player?.doubleXpAvailable})`
                  : "Cómpralo abajo ↓"}
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
              {player?.restDayActiveToday
                ? "Activo hoy"
                : (player?.restDaysAvailable ?? 0) > 0
                  ? "Tomar hoy"
                  : "Cómpralo abajo ↓"}
            </Button>
          }
        />
      </motion.div>

      {/* Profile customization — avatar, photo upload, card background */}
      <ProfileSection
        rewards={rewards ?? []}
        stars={player?.stars ?? 0}
        buying={purchase.isPending}
        onBuy={(id) => purchase.mutate(id)}
      />

      {/* Personalización — accent themes that re-skin the whole app */}
      <ThemesSection rewards={rewards ?? []} level={player?.level ?? 1} />

      {/* Catalog */}
      <section className="space-y-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            カタログ — Catálogo
          </p>
          <h2 className="font-display text-lg font-extrabold tracking-tight">
            Catálogo
          </h2>
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {rewards
              ?.filter((r) => r.kind !== "avatar" && r.kind !== "background")
              .map((r) => (
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

/** Accent-theme picker. Every theme except Aether starts LOCKED; it unlocks by
 *  buying its reward below OR by reaching its level (learning). Each theme has
 *  its own ambient animation (see AccentFX). */
function ThemesSection({
  rewards,
  level,
}: {
  rewards: Reward[];
  level: number;
}) {
  const { accent, setAccent } = useAccent();
  const owns = (rewardKey: string | null) =>
    rewardKey !== null &&
    (rewards.find((r) => r.key === rewardKey)?.ownedQuantity ?? 0) > 0;

  return (
    <section className="space-y-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
          外観 — Temas
        </p>
        <h2 className="font-display text-lg font-extrabold tracking-tight">
          Temas de la app
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada tema re-pinta la app y trae su propia animación de fondo.
          Desbloquéalos comprándolos abajo o subiendo de nivel al aprender.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {ACCENTS.map((a) => {
          const isBase = a.key === "aether";
          const byLevel = level >= a.unlockLevel;
          const unlocked = isBase || owns(a.requires) || byLevel;
          const equipped = accent === a.key;
          return (
            <button
              key={a.key}
              disabled={!unlocked}
              onClick={() => unlocked && setAccent(a.key)}
              title={a.fx}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 text-center transition-all",
                equipped
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border/60 hover:border-primary/40",
                !unlocked && "opacity-60"
              )}
            >
              <div className="relative mx-auto size-12">
                <div
                  className={cn(
                    "size-12 rounded-full bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                    a.swatch,
                    !unlocked && "grayscale"
                  )}
                />
                {!unlocked ? (
                  <span className="absolute inset-0 grid place-items-center">
                    <Lock className="size-4 text-foreground/80" />
                  </span>
                ) : null}
              </div>
              <p className="mt-2 font-display text-sm font-bold">{a.label}</p>
              <p className="font-jp text-[10px] text-muted-foreground">{a.jp}</p>
              <p
                className={cn(
                  "mt-1 font-mono text-[9px] uppercase tracking-[0.12em]",
                  equipped
                    ? "text-primary"
                    : unlocked
                      ? "text-success"
                      : "text-muted-foreground"
                )}
              >
                {equipped
                  ? "● En uso"
                  : unlocked
                    ? "Equipar"
                    : `Nv ${a.unlockLevel} o cómpralo`}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Profile customization: equipped avatar (kana, 3D orb, or your photo) + the
 *  profile-card background. Locked items are BOUGHT with coins (purchase_reward);
 *  free defaults equip instantly. Owned = a default or an owned reward. */
function ProfileSection({
  rewards,
  stars,
  buying,
  onBuy,
}: {
  rewards: Reward[];
  stars: number;
  buying: boolean;
  onBuy: (rewardId: number) => void;
}) {
  const { avatarId, setAvatarId, backgroundId, setBackgroundId, photo, setPhoto } =
    useCosmetics();
  const fileRef = useRef<HTMLInputElement>(null);

  const rewardByKey = (key: string | null) =>
    key ? rewards.find((r) => r.key === key) : undefined;
  const owns = (key: string | null) =>
    key === null || (rewardByKey(key)?.ownedQuantity ?? 0) > 0;

  const onUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      setAvatarId("photo");
    };
    reader.readAsDataURL(file);
  };

  return (
    <HudPanel glow className="p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Live preview */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div
            className={cn(
              "relative grid size-28 place-items-center overflow-hidden rounded-3xl",
              BACKGROUNDS.find((b) => b.id === backgroundId)?.className
            )}
          >
            <PlayerAvatar size={88} />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
            Vista previa
          </p>
        </div>

        <div className="min-w-0 flex-1 space-y-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              プロフィール — Tu perfil
            </p>
            <h2 className="font-display text-lg font-extrabold tracking-tight">
              Personaliza tu avatar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Compra avatares y fondos con las monedas que ganas aprendiendo.
              Toca uno que tengas para equiparlo. ¡Hasta puedes usar tu foto!
            </p>
          </div>

          {/* Avatars */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Avatares
            </p>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => {
                const isPhoto = a.kind === "photo";
                const owned = owns(a.rewardKey);
                const selected = avatarId === a.id;
                const reward = rewardByKey(a.rewardKey);
                const canAfford = stars >= a.cost;
                return (
                  <button
                    key={a.id}
                    disabled={buying || (!owned && !canAfford)}
                    title={
                      owned
                        ? a.label
                        : `${a.label} — ${a.cost} monedas`
                    }
                    onClick={() => {
                      if (owned) {
                        if (isPhoto) fileRef.current?.click();
                        else setAvatarId(a.id);
                      } else if (reward && canAfford) {
                        onBuy(reward.id);
                      }
                    }}
                    className={cn(
                      "relative grid size-12 place-items-center rounded-xl border transition-all",
                      selected
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border/60 hover:border-primary/40",
                      !owned && !canAfford && "opacity-50"
                    )}
                  >
                    {isPhoto && owned ? (
                      <Upload className="size-4 text-muted-foreground" />
                    ) : (
                      <PlayerAvatar avatarId={a.id} size={40} />
                    )}
                    {!owned ? (
                      <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-0.5 rounded-full bg-background px-1 py-px ring-1 ring-border">
                        <CurrencyIcon className="size-2" />
                        <span className="text-[8px] font-bold tabular-nums">
                          {a.cost}
                        </span>
                      </span>
                    ) : null}
                  </button>
                );
              })}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload(e.target.files?.[0])}
              />
            </div>
            {photo ? (
              <button
                onClick={() => setPhoto(null)}
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive"
              >
                Quitar foto
              </button>
            ) : null}
          </div>

          {/* Backgrounds */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Fondo del perfil
            </p>
            <div className="flex flex-wrap gap-2">
              {BACKGROUNDS.map((b) => {
                const owned = owns(b.rewardKey);
                const selected = backgroundId === b.id;
                const reward = rewardByKey(b.rewardKey);
                const canAfford = stars >= b.cost;
                return (
                  <button
                    key={b.id}
                    disabled={buying || (!owned && !canAfford)}
                    title={owned ? b.label : `${b.label} — ${b.cost} monedas`}
                    onClick={() => {
                      if (owned) setBackgroundId(b.id);
                      else if (reward && canAfford) onBuy(reward.id);
                    }}
                    className={cn(
                      "relative grid h-12 w-16 place-items-center overflow-hidden rounded-xl border transition-all",
                      selected
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border/60 hover:border-primary/40",
                      !owned && !canAfford && "opacity-50"
                    )}
                  >
                    <span
                      className={cn("absolute inset-0", b.className || "bg-card/60")}
                    />
                    {owned ? (
                      <span className="relative font-mono text-[8px] uppercase tracking-wider text-foreground/70">
                        {b.label.split(" ")[0]}
                      </span>
                    ) : (
                      <span className="relative inline-flex items-center gap-0.5 rounded-full bg-background/80 px-1 py-px">
                        <CurrencyIcon className="size-2" />
                        <span className="text-[8px] font-bold tabular-nums">
                          {b.cost}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </HudPanel>
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
    <HudPanel
      scanline={false}
      glow={active}
      className={cn("p-5", active && "ring-1 ring-streak/50")}
    >
      <div
        className={cn(
          "absolute -right-16 -top-16 size-44 rounded-full bg-gradient-to-br opacity-70 blur-2xl",
          tone
        )}
      />
      <div className="relative flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-background/40 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-jp text-[10px] tracking-[0.3em] text-neon-cyan">
            {jp}
          </p>
          <p className="font-display font-extrabold tracking-tight">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          <div className="mt-3">{action}</div>
        </div>
      </div>
    </HudPanel>
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
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative overflow-hidden rounded-3xl glass shimmer p-5 transition-shadow duration-300 hover:shadow-[0_0_36px_-12px_color-mix(in_oklch,var(--color-primary)_50%,transparent)]"
    >
      <div
        className={cn(
          "absolute -right-20 -top-20 size-44 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-90",
          tone
        )}
      />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-background/40 text-primary transition-transform duration-300 group-hover:scale-110">
            <Icon className="size-5" />
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-1">
            <CurrencyIcon className="size-3" />
            <span className="text-xs font-bold tabular-nums text-foreground/90">
              {reward.cost}
            </span>
          </div>
        </div>
        <div>
          <p className="font-display font-extrabold tracking-tight">{reward.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {reward.description}
          </p>
          {reward.ownedQuantity > 0 ? (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-success">
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
