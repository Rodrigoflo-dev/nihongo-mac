import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StrokeTrainer } from "@/components/kanji/stroke-trainer";
import { RomajiLine } from "@/components/lesson/romaji-line";
import type { KanjiSrs } from "@/lib/api";

interface ReviewCardProps {
  srs: KanjiSrs;
  revealed: boolean;
}

export function ReviewCard({ srs, revealed }: ReviewCardProps) {
  const { kanji } = srs;

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="grid gap-8 p-10 text-center">
        <div className="space-y-3">
          <motion.div
            key={kanji.character}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-jp text-[140px] leading-none">
              {kanji.character}
            </span>
          </motion.div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            ¿Qué significa?
          </p>
          {srs.repetitions > 0 ? (
            <Badge variant="secondary" className="font-mono text-[10px]">
              Rep #{srs.repetitions + 1} · {srs.intervalDays.toFixed(1)}d
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              Primera vez
            </Badge>
          )}
        </div>

        <AnimatePresence>
          {revealed ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 text-left"
            >
              <Separator />
              <div className="grid gap-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Significado
                </p>
                <p className="text-2xl font-semibold">{kanji.meaningEs}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ReadingBlock label="On'yomi" readings={kanji.onyomi} />
                <ReadingBlock label="Kun'yomi" readings={kanji.kunyomi} />
              </div>
              {kanji.examples.length > 0 ? (
                <div className="grid gap-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Ejemplos
                  </p>
                  <ul className="space-y-2">
                    {kanji.examples.slice(0, 3).map((ex) => (
                      <li
                        key={ex.jp}
                        className="rounded-md bg-accent/40 px-3 py-2 text-sm"
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="font-jp text-lg">{ex.jp}</span>
                          <span className="font-jp text-xs text-muted-foreground">
                            {ex.reading}
                          </span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {ex.meaning}
                          </span>
                        </div>
                        <RomajiLine reading={ex.reading} className="mt-0.5" />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {kanji.mnemonic ? (
                <p className="text-xs italic text-muted-foreground">
                  {kanji.mnemonic}
                </p>
              ) : null}

              <Separator />
              <div className="grid place-items-center gap-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Orden de trazos · practica escribiéndolo
                </p>
                <StrokeTrainer char={kanji.character} size={200} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function ReadingBlock({ label, readings }: { label: string; readings: string[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-jp text-base">
        {readings.length > 0 ? readings.join(" · ") : "—"}
      </p>
      {readings.length > 0 ? (
        <RomajiLine reading={readings.join(" · ")} />
      ) : null}
    </div>
  );
}
