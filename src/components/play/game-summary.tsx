import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

/**
 * End-of-game stats panel shared by all mini-games: correct / incorrect, the
 * accuracy %, the target you were expected to reach, and a verdict (good/bad).
 */
export function GameSummary({
  correct,
  wrong,
  targetAccuracy = 0.8,
  unit,
  className,
}: {
  correct: number;
  wrong: number;
  /** Accuracy you're expected to reach (0–1). */
  targetAccuracy?: number;
  /** What's being counted (a translated string). Defaults to "answers". */
  unit?: string;
  className?: string;
}) {
  const t = useT();
  const unitText = unit ?? t("gs.unit.answers");
  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const expected = Math.max(1, Math.ceil(total * targetAccuracy));
  const passed = correct >= expected;

  const verdict =
    total === 0
      ? { label: t("gs.noAnswers"), tone: "text-muted-foreground", bar: "bg-muted-foreground/40" }
      : accuracy >= 90
        ? { label: t("gs.excellent"), tone: "text-success", bar: "bg-gradient-to-r from-success to-neon-cyan" }
        : accuracy >= 70
          ? { label: t("gs.good"), tone: "text-primary", bar: "bg-gradient-to-r from-primary to-neon-violet" }
          : accuracy >= 50
            ? { label: t("gs.improving"), tone: "text-warning", bar: "bg-gradient-to-r from-warning to-streak" }
            : { label: t("gs.keepGoing"), tone: "text-destructive", bar: "bg-gradient-to-r from-destructive to-warning" };

  return (
    <div className={cn("rounded-xl border border-border/50 glass p-4 text-left", className)}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan">
          {t("gs.summary")}
        </p>
        <span className={cn("font-display text-sm font-extrabold", verdict.tone)}>
          {verdict.label}
        </span>
      </div>

      {/* Accuracy bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t("gs.accuracy")}</span>
          <span className="font-bold tabular-nums">{accuracy}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary/50">
          <div
            className={cn("h-full rounded-full transition-all", verdict.bar)}
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label={t("gs.correct")} value={correct} tone="text-success" />
        <Stat label={t("gs.wrong")} value={wrong} tone="text-destructive" />
        <Stat label={t("gs.goal", { pct: Math.round(targetAccuracy * 100) })} value={`${expected}`} tone="text-neon-cyan" />
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {total === 0
          ? t("gs.answerToSee")
          : passed
            ? t("gs.passed", { c: correct, t: total, unit: unitText, goal: expected })
            : t("gs.notPassed", { c: correct, t: total, unit: unitText, goal: expected })}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/40 px-2 py-2">
      <p className={cn("text-xl font-bold tabular-nums", tone)}>{value}</p>
      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
