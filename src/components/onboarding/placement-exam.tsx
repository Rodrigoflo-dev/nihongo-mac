import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HudPanel } from "@/components/visual/hud-panel";
import { MeshBackground } from "@/components/visual/mesh-background";
import type { JlptLevel } from "@/lib/api";
import {
  buildPlacementExam,
  scorePlacement,
  type ExamItem,
} from "@/lib/placement-exam";
import { cn } from "@/lib/utils";
import { TitleBarDrag } from "@/components/layout/titlebar-drag";

/**
 * Placement test shown when the learner picks "no sé mi nivel" during onboarding.
 * Spans N5→N1 with verified questions, re-shuffled daily. On finish it reports
 * the recommended starting level back to onboarding.
 */
export function PlacementExam({
  onResult,
  onCancel,
}: {
  onResult: (level: JlptLevel) => void;
  onCancel: () => void;
}) {
  const items: ExamItem[] = useMemo(() => buildPlacementExam(3), []);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const total = items.length;
  const current = items[idx];

  const result = useMemo(
    () => (finished ? scorePlacement(items, answers) : null),
    [finished, items, answers]
  );

  const advance = () => {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (idx + 1 >= total) {
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-y-auto bg-background text-foreground">
      <MeshBackground />
      <TitleBarDrag className="absolute left-20 right-0 top-0 z-30 h-9" />

      <div className="relative z-10 flex min-h-full items-center justify-center py-16">
        <div className="w-full max-w-xl px-8">
          {!finished ? (
            <>
              <div className="mb-8">
                <Progress value={((idx + 1) / total) * 100} className="h-1" />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Evaluación · {idx + 1} de {total}
                  </p>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-neon-cyan">
                    {current.level}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28 }}
                >
                  {current.jp ? (
                    <p className="text-center font-jp text-4xl font-bold text-primary">
                      {current.jp}
                    </p>
                  ) : null}
                  <p className="mt-3 text-center text-lg font-medium">
                    {current.prompt}
                  </p>

                  <div className="mt-6 grid gap-3">
                    {current.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelected(i)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                          selected === i
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border/60 bg-card/40 hover:border-primary/40"
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-full border text-xs",
                            selected === i
                              ? "border-primary text-primary"
                              : "border-border text-muted-foreground"
                          )}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center gap-3">
                <Button variant="ghost" onClick={onCancel}>
                  Elegir manualmente
                </Button>
                <div className="flex-1" />
                <Button size="lg" disabled={selected === null} onClick={advance}>
                  {idx + 1 >= total ? "Ver resultado" : "Siguiente"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6 flex justify-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary primary-glow">
                  <GraduationCap className="size-7" />
                </div>
              </div>
              <p className="text-center font-jp text-xs tracking-[0.3em] text-primary">
                結果 · RESULTADO
              </p>
              <h1 className="mt-1 text-center text-3xl font-semibold tracking-tight">
                Tu nivel: <span className="text-neon-cyan">{result.level}</span>
              </h1>
              <p className="mt-3 text-center text-balance text-muted-foreground">
                Según tus respuestas, este es el mejor punto para empezar. Podrás
                cambiarlo cuando quieras.
              </p>

              <HudPanel className="mt-6 p-5">
                <div className="grid gap-2 text-sm">
                  {(["N5", "N4", "N3", "N2", "N1"] as JlptLevel[]).map((l) => {
                    const s = result.perLevel[l];
                    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                    return (
                      <div key={l} className="flex items-center gap-3">
                        <span className="w-8 font-mono text-xs text-muted-foreground">
                          {l}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-card">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-neon-violet to-neon-cyan"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-14 text-right font-mono text-xs text-muted-foreground">
                          {s.correct}/{s.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </HudPanel>

              <div className="mt-8 flex items-center gap-3">
                <Button variant="ghost" onClick={onCancel}>
                  Elegir otro nivel
                </Button>
                <div className="flex-1" />
                <Button size="lg" onClick={() => onResult(result.level)}>
                  <Check className="size-4" /> Usar este nivel
                </Button>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
