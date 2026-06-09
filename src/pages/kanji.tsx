import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KanjiTile } from "@/components/kanji/kanji-tile";
import { RomajiLine } from "@/components/lesson/romaji-line";
import { PageHeader } from "@/components/layout/page-header";
import { useIntroduceKanji, useKanjiList, useReviewQueue } from "@/hooks/use-kanji";
import { useUserProfile } from "@/hooks/use-user-profile";
import { cn } from "@/lib/utils";

export default function KanjiPage() {
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-10">
        <PageHeader title="Kanji" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        eyebrow={`漢字 — ${level}`}
        title="Catálogo de kanji"
        description="Repaso por SRS, nuevos disponibles y los que ya tienes dominados."
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
                Empezar repaso ({dueCount})
              </Link>
            ) : (
              <span>Sin repasos pendientes</span>
            )}
          </Button>
        }
      />

      {/* Mastery progress (gamified overview) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl glass-strong p-6"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
              漢字マスター — {level}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {masteredCount}
              <span className="text-base font-medium text-muted-foreground">
                {" "}/ {total} dominados
              </span>
            </h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold tabular-nums gradient-text">
              {masteryPct}%
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              del nivel
            </p>
          </div>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary/50">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-success via-neon-cyan to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(2, masteryPct)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <MasteryStat label="Aprendiendo" value={learningCount} tone="primary" />
          <MasteryStat label="Por descubrir" value={newAvailable} tone="muted" />
          <MasteryStat label="Dominados" value={masteredCount} tone="success" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {masteryPct >= 100
            ? "¡Dominaste todo este nivel! Sube de objetivo en Ajustes para más kanji. 🎉"
            : dueCount > 0
              ? `Tienes ${dueCount} repaso${dueCount === 1 ? "" : "s"} listo${dueCount === 1 ? "" : "s"} — cada repaso correcto sube tu dominio.`
              : "Introduce kanji nuevos y practícalos. Solo cuentan como “dominados” tras repasarlos bien varias veces (SRS)."}
        </p>
      </motion.div>

      {grouped.learning.length > 0 ? (
        <Section
          title="Aprendiendo"
          jp="学習中"
          description={`${grouped.learning.length} kanji${
            grouped.learning.length === 1 ? "" : "s"
          } en tu pool`}
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
          title="Nuevos disponibles"
          jp="新しい漢字"
          description={`${newAvailable} disponibles para introducir en tu repaso`}
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
              Introducir 1
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
              +{grouped.new.length - 8} más disponibles a medida que avances
            </p>
          ) : null}
        </Section>
      ) : null}

      {grouped.mastered.length > 0 ? (
        <Section
          title="Dominados"
          jp="覚えた"
          description={`${grouped.mastered.length} kanji${
            grouped.mastered.length === 1 ? "" : "s"
          } con repasos consolidados`}
        >
          <div className="grid grid-cols-4 gap-3">
            {grouped.mastered.map((item) => (
              <KanjiTile key={item.kanji.id} item={item} />
            ))}
          </div>
        </Section>
      ) : null}

      {list && list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Aún no hay kanji seedeados para este nivel.
          </CardContent>
        </Card>
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
    <div className="rounded-xl border bg-card/50 px-3 py-2.5 text-center">
      <p
        className={cn(
          "text-xl font-bold tabular-nums",
          tone === "primary" && "text-primary",
          tone === "success" && "text-success",
          tone === "muted" && "text-foreground/70"
        )}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
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
      <Card className="border-dashed bg-transparent shadow-none">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 py-2">
          <div>
            <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
              {jp}
            </p>
            <CardTitle className="mt-0.5 text-lg">{title}</CardTitle>
            {description ? (
              <CardDescription className="mt-0.5">{description}</CardDescription>
            ) : null}
          </div>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </CardHeader>
      </Card>
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
  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="group relative flex flex-col items-start gap-3 rounded-xl border bg-card p-4"
    >
      <div className="flex w-full items-start justify-between">
        <span className="font-jp text-4xl leading-none">
          {item.kanji.character}
        </span>
        <Badge variant="secondary" className="text-[10px]">
          Nuevo
        </Badge>
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{item.kanji.meaningEs}</p>
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
