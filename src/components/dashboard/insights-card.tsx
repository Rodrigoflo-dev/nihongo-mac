import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Brain, ChevronRight } from "lucide-react";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Adaptive learning card: shows per-skill accuracy computed from the user's
 * own activity and recommends the weakest area to reinforce today. This makes
 * the app respond to *how each person is doing* rather than a fixed path.
 */
export function InsightsCard() {
  const navigate = useNavigate();
  const { data: insights } = useQuery({
    queryKey: ["skill-insights"],
    queryFn: () => api.getSkillInsights(),
    staleTime: 1000 * 20,
  });

  if (!insights) return null;

  const practiced = insights.skills.filter((s) => s.attempts > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-3xl glass p-6"
    >
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Brain className="size-4" />
        </div>
        <div>
          <p className="font-jp text-[10px] tracking-[0.3em] text-muted-foreground">
            {insights.jpHeadline}
          </p>
          <h3 className="text-sm font-semibold">Tu plan personalizado</h3>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground/85">
        {insights.headline}
      </p>

      {insights.focusPath ? (
        <button
          onClick={() => navigate(insights.focusPath!)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-neon-violet to-neon-cyan px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          Reforzar {insights.focusLabel}
          <ChevronRight className="size-4" />
        </button>
      ) : null}

      {practiced.length > 0 ? (
        <div className="mt-5 space-y-2.5">
          {practiced.map((s) => (
            <button
              key={s.key}
              onClick={() => navigate(s.modulePath)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="w-20 shrink-0 text-xs text-muted-foreground">
                {s.label}
              </span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary/50">
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all",
                    s.accuracyPct >= 80
                      ? "bg-gradient-to-r from-success to-neon-cyan"
                      : s.accuracyPct >= 60
                        ? "bg-gradient-to-r from-primary to-neon-violet"
                        : "bg-gradient-to-r from-warning to-streak"
                  )}
                  style={{ width: `${Math.max(4, s.accuracyPct)}%` }}
                />
              </span>
              <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums">
                {s.accuracyPct}%
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
