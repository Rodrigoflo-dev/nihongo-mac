import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KanjiTile } from "@/components/kanji/kanji-tile";
import { RomajiLine } from "@/components/lesson/romaji-line";
import { PageHeader } from "@/components/layout/page-header";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { useIntroduceKanji, useKanjiList, useReviewQueue } from "@/hooks/use-kanji";
import { useUserProfile } from "@/hooks/use-user-profile";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useLanguage } from "@/stores/language";

export default function KanjiPage() {
  const t = useT();
  const { data: profile } = useUserProfile();
  const level = profile?.currentLevel ?? "N5";

  const { data: list, isLoading } = useKanjiList(level);
  const { data: queue } = useReviewQueue(level);
  const introduce = useIntroduceKanji();

  const grouped = useMemo(() => {
    const empty = {
      due: [] as NonNullable<typeof list>,
      learning: [] as NonNullable<typeof list>,
      mastered: [] as NonNullable<typeof list>,
      new: [] as NonNullable<typeof list>,
    };
    if (!list) return empty;
    for (const item of list) {
      if (item.status === "mastered") empty.mastered.push(item);
      else if (item.status === "learning" || item.status === "leech")
        empty.learning.push(item);
      else empty.new.push(item);
    }
    return empty;
  }, [list]);

  const dueCount = queue?.due.length ?? 0;
  const newAvailable = queue?.newAvailable ?? grouped.new.length;

  const total = list?.length ?? 0;
  const masteredCount = grouped.mastered.length;
  const learningCount = grouped.learning.length;
  const masteryPct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

  const holoItems = useMemo(() => {
    const source = [
      ...grouped.learning,
      ...grouped.mastered,
      ...grouped.new,
    ].slice(0, 6);
    const mapped = source.map((item) => ({
      char: item.kanji.character,
      meaning: item.kanji.meaningEs,
    }));
    return mapped.length > 0 ? mapped : undefined;
  }, [grouped]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-10">
        <PageHeader title={t("nav.kanji")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="relative">
        <PageHeader
          eyebrow={`漢字 — ${level}`}
          title={
            <>
              {t("kanji.title.a")}{" "}
              <span className="gradient-text">{t("kanji.title.b")}</span>
            </>
          }
          description={t("kanji.desc")}
          actions={
            <Button
              size="lg"
              disabled={dueCount === 0}
              asChild={dueCount > 0}
              variant={dueCount > 0 ? "default" : "outline"}
            >
              {dueCount > 0 ? (
                <Link to="/kanji/review">
                  <Sparkles className="size-4" />
                  {t("kanji.startReview", { n: dueCount })}
                </Link>
              ) : (
                <span>{t("kanji.noReviews")}</span>
              )}
            </Button>
          }
        />
        <div className="pointer-events-none absolute -right-6 -top-16 hidden lg:block">
          <HoloKanji size={220} items={holoItems} />
        </div>
      </div>

      {/* Mastery progress (gamified overview) */}
      <HudPanel glow className="p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              <span className="font-jp">{t("kanji.masterOf")}</span> — {level}
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
              {masteredCount}
              <span className="text-base font-medium text-muted-foreground">
                {" "}{t("kanji.masteredOfTotal", { total })}
              </span>
            </h2>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-extrabold tabular-nums gradient-text">
              {masteryPct}%
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {t("kanji.ofLevel")}
            </p>
          </div>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary/50 ring-1 ring-primary/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-success via-neon-cyan to-primary shadow-[0_0_12px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(2, masteryPct)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <MasteryStat label={t("kanji.learning")} value={learningCount} tone="primary" />
          <MasteryStat label={t("kanji.toDiscover")} value={newAvailable} tone="muted" />
          <MasteryStat label={t("kanji.mastered")} value={masteredCount} tone="success" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {masteryPct >= 100
            ? t("kanji.hint.done")
            : dueCount > 0
              ? t("kanji.hint.due", { n: dueCount })
              : t("kanji.hint.none")}
        </p>
      </HudPanel>

      {grouped.learning.length > 0 ? (
        <Section
          title={t("kanji.learning")}
          jp={t("kanji.learningJp")}
          description={t("kanji.inPool", { n: grouped.learning.length })}
        >
          <div className="grid grid-cols-4 gap-3">
            {grouped.learning.map((item) => (
              <KanjiTile key={item.kanji.id} item={item} />
            ))}
          </div>
        </Section>
      ) : null}

      {grouped.new.length > 0 ? (
        <Section
          title={t("kanji.newAvailable")}
          jp={t("kanji.newJp")}
          description={t("kanji.availableToIntro", { n: newAvailable })}
          actions={
            <Button
              size="sm"
              variant="outline"
              disabled={introduce.isPending || grouped.new.length === 0}
              onClick={() => {
                const next = grouped.new[0];
                if (next) introduce.mutate(next.kanji.id);
              }}
            >
              <Plus className="size-3.5" />
              {t("kanji.introduce1")}
            </Button>
          }
        >
          <div className="grid grid-cols-4 gap-3">
            {grouped.new.slice(0, 8).map((item) => (
              <NewKanjiTile
                key={item.kanji.id}
                item={item}
                disabled={introduce.isPending}
                onIntroduce={() => introduce.mutate(item.kanji.id)}
              />
            ))}
          </div>
          {grouped.new.length > 8 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {t("kanji.moreAvailable", { n: grouped.new.length - 8 })}
            </p>
          ) : null}
        </Section>
      ) : null}

      {grouped.mastered.length > 0 ? (
        <Section
          title={t("kanji.mastered")}
          jp={t("kanji.masteredJp")}
          description={t("kanji.consolidated", { n: grouped.mastered.length })}
        >
          <div className="grid grid-cols-4 gap-3">
            {grouped.mastered.map((item) => (
              <KanjiTile key={item.kanji.id} item={item} />
            ))}
          </div>
        </Section>
      ) : null}

      {list && list.length === 0 ? (
        <HudPanel className="py-12 text-center text-sm text-muted-foreground">
          Aún no hay kanji seedeados para este nivel.
        </HudPanel>
      ) : null}
    </div>
  );
}

function MasteryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "success" | "muted";
}) {
  return (
    <div className="relative rounded-xl border border-primary/15 bg-card/40 px-3 py-2.5 text-center backdrop-blur-sm">
      <span className="hud-corner left-1.5 top-1.5 border-l-2 border-t-2 opacity-50" />
      <span className="hud-corner bottom-1.5 right-1.5 border-b-2 border-r-2 opacity-50" />
      <p
        className={cn(
          "font-display text-xl font-extrabold tabular-nums",
          tone === "primary" && "text-neon-violet",
          tone === "success" && "text-success",
          tone === "muted" && "text-foreground/70"
        )}
      >
        {value}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

interface SectionProps {
  title: string;
  jp: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, jp, description, actions, children }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex flex-row items-start justify-between gap-3 border-l-2 border-primary/40 pl-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            <span className="font-jp">{jp}</span>
          </p>
          <h3 className="mt-0.5 font-display text-lg font-extrabold tracking-tight">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </motion.section>
  );
}

function NewKanjiTile({
  item,
  onIntroduce,
  disabled,
}: {
  item: NonNullable<ReturnType<typeof useKanjiList>["data"]>[number];
  onIntroduce: () => void;
  disabled?: boolean;
}) {
  const t = useT();
  const lang = useLanguage((s) => s.lang);
  const meaning =
    lang === "en" && item.kanji.meaningEn
      ? item.kanji.meaningEn
      : item.kanji.meaningEs;
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className="group relative flex flex-col items-start gap-3 rounded-xl border border-primary/15 bg-card/60 p-4 backdrop-blur-sm transition-all hover:border-neon-cyan/50 hover:shadow-[0_0_28px_-6px_color-mix(in_oklch,var(--color-neon-cyan)_55%,transparent)]"
    >
      <span className="hud-corner left-2 top-2 border-l-2 border-t-2 opacity-0 transition-opacity group-hover:opacity-70" />
      <span className="hud-corner bottom-2 right-2 border-b-2 border-r-2 opacity-0 transition-opacity group-hover:opacity-70" />
      <div className="flex w-full items-start justify-between">
        <span className="font-jp text-4xl leading-none transition-[text-shadow] group-hover:[text-shadow:0_0_18px_color-mix(in_oklch,var(--color-primary)_70%,transparent)]">
          {item.kanji.character}
        </span>
        <Badge variant="secondary" className="text-[10px]">
          {t("kanjiTile.new")}
        </Badge>
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{meaning}</p>
        <p className="font-jp text-xs text-muted-foreground">
          {[...item.kanji.onyomi, ...item.kanji.kunyomi]
            .slice(0, 2)
            .join(" · ") || "—"}
        </p>
        <RomajiLine
          reading={[...item.kanji.onyomi, ...item.kanji.kunyomi]
            .slice(0, 2)
            .join(" · ")}
          className="text-[10px]"
        />
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="-mb-1 -ml-1"
        disabled={disabled}
        onClick={onIntroduce}
      >
        <Plus className="size-3.5" />
        Añadir
      </Button>
    </motion.div>
  );
}
