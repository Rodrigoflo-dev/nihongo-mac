import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Award,
  Calendar,
  Check,
  Clock,
  Lock,
  LogOut,
  type LucideIcon,
  Palette,
  Settings2,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Progress } from "@/components/ui/progress";
import { PlayerAvatar } from "@/components/profile/player-avatar";
import { CurrencyBadge } from "@/components/visual/currency-icon";
import { JpReading } from "@/components/shared/jp-reading";
import { usePlayer } from "@/hooks/use-player";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useRewards } from "@/hooks/use-rewards";
import { AVATARS, BACKGROUNDS, useCosmetics } from "@/providers/cosmetics";
import { useSession } from "@/stores/session";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export default function ProfilePage() {
  const t = useT();
  const lock = useSession((s) => s.lock);
  const { data: player } = usePlayer();
  const { data: profile } = useUserProfile();
  const { data: stats } = useDashboardStats();
  const { data: rewards } = useRewards();
  const { avatarId, backgroundId, photo, setAvatarId, setBackgroundId } =
    useCosmetics();
  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => api.getAchievements(),
    staleTime: 1000 * 30,
  });

  const unlocked = achievements?.filter((a) => a.unlocked) ?? [];

  // An item is owned if it's free (rewardKey null) or you bought it.
  const owns = (rewardKey: string | null) =>
    rewardKey === null ||
    (rewards?.find((r) => r.key === rewardKey)?.ownedQuantity ?? 0) > 0;

  // Avatars you can actually equip (photo only counts once you've uploaded one).
  const ownedAvatars = AVATARS.filter(
    (a) => owns(a.rewardKey) && (a.kind !== "photo" || photo)
  );
  const ownedBackgrounds = BACKGROUNDS.filter((b) => owns(b.rewardKey));
  const totalCosmetics = AVATARS.length + BACKGROUNDS.length;
  const ownedCosmetics = ownedAvatars.length + ownedBackgrounds.length;

  const equippedBg = BACKGROUNDS.find((b) => b.id === backgroundId);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        eyebrow={t("profile.eyebrow")}
        title={<span className="gradient-text">{t("profile.title")}</span>}
        description={t("profile.desc")}
      />

      {/* ── Hero identity card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[28px] border border-white/10 p-6 sm:p-8 shadow-[0_24px_70px_-30px_color-mix(in_oklch,var(--color-primary)_75%,transparent)]"
      >
        {/* Equipped background — shown big and proud */}
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-background via-card to-background"
        />
        {equippedBg?.className ? (
          <span
            aria-hidden
            className={cn("absolute inset-0 opacity-90", equippedBg.className)}
          />
        ) : null}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-neon-violet/30 opacity-70 blur-3xl"
        />
        {/* HUD corners */}
        <span className="hud-corner left-3 top-3 border-l-2 border-t-2 opacity-40" />
        <span className="hud-corner right-3 top-3 border-r-2 border-t-2 opacity-40" />
        <span className="hud-corner bottom-3 left-3 border-b-2 border-l-2 opacity-40" />
        <span className="hud-corner bottom-3 right-3 border-b-2 border-r-2 opacity-40" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Avatar with glowing level ring */}
          <div className="relative shrink-0 self-start">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-[26px] bg-gradient-to-br from-neon-violet via-primary to-neon-cyan opacity-70 blur-md"
            />
            <div className="relative rounded-[24px] p-[3px] bg-gradient-to-br from-neon-violet via-primary to-neon-cyan">
              <PlayerAvatar level={player?.level} size={96} />
            </div>
            {player ? (
              <span className="absolute -bottom-2 -right-2 grid size-8 place-items-center rounded-full bg-background text-sm font-bold tabular-nums text-primary ring-2 ring-primary/60 shadow-lg">
                {player.level}
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-3xl font-extrabold tracking-tight">
              {profile?.name ?? player?.title ?? "—"}
            </h2>
            {player ? (
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/90">
                  {player.title}
                </span>
                <span className="font-jp tracking-[0.15em]">
                  {player.titleJp}
                </span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                  {t("profile.level")} {player.level} · レベル reberu
                </span>
              </p>
            ) : null}

            {player ? (
              <div className="mt-4 space-y-1.5">
                <div className="relative h-2.5 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
                  <Progress
                    value={player.progressPct}
                    className="absolute inset-0 h-full bg-transparent"
                  />
                  <div className="absolute inset-0 shimmer rounded-full opacity-40" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="tabular-nums font-medium text-foreground/80">
                    {player.currentLevelXp} XP
                  </span>
                  <span className="tabular-nums">
                    {player.xpToNextLevel} {t("profile.forLevel", { n: player.level + 1 })}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {player ? (
            <div className="shrink-0 self-start">
              <CurrencyBadge amount={player.stars} />
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* ── Stat tiles ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile
          icon={Clock}
          label={t("profile.tile.time")}
          jp="時間"
          kana="じかん"
          romaji="jikan"
          value={
            stats
              ? `${Math.floor(stats.lifetime.totalHours)}h ${(
                  stats.lifetime.totalMinutes % 60
                )
                  .toString()
                  .padStart(2, "0")}m`
              : "—"
          }
          tone="primary"
        />
        <Tile
          icon={Calendar}
          label={t("profile.tile.days")}
          jp="活動日"
          kana="かつどうび"
          romaji="katsudōbi"
          value={stats ? stats.lifetime.activeDays : "—"}
          tone="cyan"
        />
        <Tile
          icon={Sparkles}
          label={t("profile.tile.xp")}
          jp="経験値"
          kana="けいけんち"
          romaji="keikenchi"
          value={player ? player.totalXp : "—"}
          tone="violet"
        />
        <Tile
          icon={Award}
          label={t("profile.tile.ach")}
          jp="実績"
          kana="じっせき"
          romaji="jisseki"
          value={
            achievements ? `${unlocked.length}/${achievements.length}` : "—"
          }
          tone="amber"
        />
      </div>

      {/* ── Tu colección ───────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              コレクション — {t("profile.collection")}
            </p>
            <h3 className="mt-1 font-display text-lg font-extrabold tracking-tight">
              {t("profile.collection")}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                ·{" "}
                {t("profile.collectionCount", {
                  owned: ownedCosmetics,
                  total: totalCosmetics,
                })}
              </span>
            </h3>
          </div>
          <Link
            to="/rewards"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("profile.toStore")}
          </Link>
        </div>

        {/* Avatares */}
        <div className="space-y-2.5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            {t("profile.avatars")}
            <JpReading jp="アバター" romaji="abatā" />
          </p>
          <div className="flex flex-wrap gap-3">
            {AVATARS.filter((a) => a.kind !== "photo" || photo).map((a) => {
              const owned = owns(a.rewardKey) && (a.kind !== "photo" || photo);
              const equipped = avatarId === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  disabled={!owned}
                  onClick={() => owned && setAvatarId(a.id)}
                  title={owned ? a.label : `${a.label} — en la Tienda`}
                  className={cn(
                    "group relative rounded-2xl p-[3px] transition-transform",
                    equipped
                      ? "bg-gradient-to-br from-neon-violet via-primary to-neon-cyan"
                      : "bg-transparent",
                    owned ? "hover:scale-105" : "cursor-not-allowed"
                  )}
                >
                  <div className={cn(!owned && "opacity-30 grayscale")}>
                    <PlayerAvatar avatarId={a.id} level={player?.level} size={52} />
                  </div>
                  {equipped ? (
                    <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
                      <Check className="size-3" />
                    </span>
                  ) : null}
                  {!owned ? (
                    <span className="absolute inset-0 grid place-items-center rounded-2xl">
                      <Lock className="size-4 text-white/70" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fondos */}
        <div className="space-y-2.5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            {t("profile.backgrounds")}
            <JpReading jp="背景" kana="はいけい" romaji="haikei" />
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BACKGROUNDS.map((b) => {
              const owned = owns(b.rewardKey);
              const equipped = backgroundId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  disabled={!owned}
                  onClick={() => owned && setBackgroundId(b.id)}
                  title={owned ? b.label : `${b.label} — en la Tienda`}
                  className={cn(
                    "group relative h-16 overflow-hidden rounded-2xl border transition-all",
                    equipped
                      ? "border-primary ring-2 ring-primary/50"
                      : "border-white/10",
                    owned
                      ? "hover:border-primary/50"
                      : "cursor-not-allowed opacity-45"
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-br from-card to-background"
                  />
                  {b.className ? (
                    <span aria-hidden className={cn("absolute inset-0", b.className)} />
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-background/90 to-transparent px-2.5 pb-1.5 pt-4">
                    <span className="truncate text-[11px] font-medium">
                      {b.label}
                    </span>
                    {equipped ? (
                      <span className="shrink-0 font-mono text-[8px] uppercase tracking-wider text-primary">
                        装備中
                      </span>
                    ) : null}
                  </span>
                  {!owned ? (
                    <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-background/70">
                      <Lock className="size-3 text-white/70" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Logros recientes ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              実績 — Logros
            </p>
            <h3 className="mt-1 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
              {t("profile.recentAch")}
              <JpReading jp="実績" kana="じっせき" romaji="jisseki" />
            </h3>
          </div>
          <Link
            to="/stats"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("common.seeAll")}
          </Link>
        </div>

        {unlocked.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {unlocked.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-2xl glass-strong p-4 shadow-[0_0_28px_-14px_color-mix(in_oklch,var(--color-warning)_60%,transparent)]"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-warning/40 to-streak/30 text-warning">
                  <Award className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-extrabold tracking-tight">
                    {a.title}
                  </p>
                  {a.description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.description}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl glass-strong p-5 text-sm text-muted-foreground">
            {t("profile.noAch")}
          </p>
        )}
      </section>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <section className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-6">
        <ActionButton
          to="/rewards"
          icon={Palette}
          label={t("profile.customize")}
          jp="カスタマイズ"
          romaji="kasutamaizu"
        />
        <ActionButton
          to="/settings"
          icon={Settings2}
          label={t("profile.editProfile")}
          jp="編集"
          kana="へんしゅう"
          romaji="henshū"
        />
        <button
          onClick={lock}
          className="group ml-auto inline-flex items-center gap-2 rounded-xl border border-transparent px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          <span className="flex flex-col items-start leading-none">
            {t("profile.logout")}
            <JpReading jp="ログアウト" romaji="roguauto" className="mt-0.5" />
          </span>
        </button>
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
  jp,
  kana,
  romaji,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  jp: string;
  kana?: string;
  romaji: string;
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
      <div
        className={cn(
          "absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition-opacity group-hover:opacity-70",
          TONE[tone] ?? TONE.primary
        )}
      />
      <div className="relative">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Icon className={cn("size-3.5", TONE[tone] ?? TONE.primary)} />
          {label}
        </div>
        <JpReading jp={jp} kana={kana} romaji={romaji} className="mt-1 block" />
        <p className="mt-1.5 font-display text-2xl font-extrabold tabular-nums">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function ActionButton({
  to,
  icon: Icon,
  label,
  jp,
  kana,
  romaji,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  jp: string;
  kana?: string;
  romaji: string;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/30 px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
    >
      <Icon className="size-4 text-primary" />
      <span className="flex flex-col items-start leading-none">
        {label}
        <JpReading jp={jp} kana={kana} romaji={romaji} className="mt-0.5" />
      </span>
    </Link>
  );
}
