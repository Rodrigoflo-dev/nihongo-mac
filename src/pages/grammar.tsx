import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { useGrammarList } from "@/hooks/use-grammar";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { GrammarListItem } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT, type TFn } from "@/lib/i18n";
import { useTc } from "@/lib/content-i18n";

export default function GrammarPage() {
  const t = useT();
  const tc = useTc();
  const { data: profile } = useUserProfile();
  const level = profile?.currentLevel ?? "N5";
  const { data: lessons, isLoading } = useGrammarList(level);

  const stats = lessons
    ? {
        mastered: lessons.filter((l) => l.status === "mastered").length,
        learning: lessons.filter((l) => l.status === "learning").length,
        total: lessons.length,
      }
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="relative">
        <PageHeader
          eyebrow={`文法 — ${level}`}
          title={
            <>
              {t("grammar.title.a")}{" "}
              <span className="gradient-text">{t("grammar.title.b")}</span>
            </>
          }
          description={t("grammar.desc")}
          actions={
            stats ? (
              <Badge variant="outline" className="font-mono">
                {t("grammar.masteredCount", { done: stats.mastered, total: stats.total })}
              </Badge>
            ) : null
          }
        />
        <div className="pointer-events-none absolute -right-2 -top-6 hidden lg:block">
          <HoloKanji
            size={120}
            items={[
              { char: "文", meaning: "Gramática" },
              { char: "語", meaning: "Idioma" },
              { char: "訳", meaning: "Sentido" },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("grammar.loading")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {lessons?.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} t={t} tc={tc} />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonCard({
  lesson,
  t,
  tc,
}: {
  lesson: GrammarListItem;
  t: TFn;
  tc: (s: string) => string;
}) {
  const statusBadge = {
    new: { key: "grammar.new", tone: "secondary" as const, icon: BookOpen },
    learning: { key: "grammar.learning", tone: "warning" as const, icon: Sparkles },
    mastered: { key: "grammar.mastered", tone: "success" as const, icon: Check },
  }[lesson.status];

  const Icon = statusBadge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
    >
      <Link to={`/grammar/${lesson.id}`} className="block">
        <HudPanel
          glow={lesson.status === "mastered"}
          className={cn(
            "group h-full p-5 transition-all hover:ring-1 hover:ring-primary/40",
            "hover:shadow-[0_0_34px_-10px_color-mix(in_oklch,var(--color-primary)_55%,transparent)]",
            lesson.status === "mastered" && "ring-1 ring-success/30"
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                lesson.status === "mastered"
                  ? "bg-success/15 text-success shadow-[0_0_18px_-6px_color-mix(in_oklch,var(--color-success)_70%,transparent)]"
                  : lesson.status === "learning"
                    ? "bg-neon-amber/15 text-neon-amber"
                    : "bg-primary/10 text-primary"
              )}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan">
                <span className="font-jp">{lesson.structure ?? "—"}</span>
              </p>
              <p className="font-display text-base font-extrabold leading-tight tracking-tight">
                {tc(lesson.title)}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {lesson.category ? tc(lesson.category) : t("grammar.fallbackCategory")}
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-neon-cyan transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <Badge variant={statusBadge.tone} className="text-[10px]">
                {t(statusBadge.key)}
              </Badge>
              <span className="font-mono tabular-nums">
                {t("grammar.confidence", { n: lesson.confidence })}
              </span>
            </div>
            <Progress value={lesson.confidence} className="h-1" />
          </div>
        </HudPanel>
      </Link>
    </motion.div>
  );
}
