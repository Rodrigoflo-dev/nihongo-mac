import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GradeButtons } from "@/components/kanji/grade-buttons";
import { ReviewCard } from "@/components/kanji/review-card";
import { useReviewKanji, useReviewQueue } from "@/hooks/use-kanji";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { KanjiSrs, ReviewGrade, XpAward } from "@/lib/api";

export default function KanjiReviewPage() {
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();
  const level = profile?.currentLevel ?? "N5";
  const { data: queue, isLoading } = useReviewQueue(level);
  const review = useReviewKanji();

  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [completed, setCompleted] = useState<KanjiSrs[]>([]);
  const [awards, setAwards] = useState<XpAward[]>([]);
  const [pendingIdx, setPendingIdx] = useState(0);
  const [done, setDone] = useState(false);

  const queueDue = useMemo(() => queue?.due ?? [], [queue]);

  // Snapshot initial queue so navigating between cards stays stable while
  // background re-fetches happen.
  const [pending, setPending] = useState<KanjiSrs[]>([]);
  useEffect(() => {
    if (queue && pending.length === 0 && !done) {
      setPending(queue.due);
    }
  }, [queue, pending.length, done]);

  useEffect(() => {
    setStartedAt(Date.now());
    setRevealed(false);
  }, [pendingIdx]);

  if (isLoading) {
    return (
      <div className="grid h-full place-items-center">
        <p className="text-sm text-muted-foreground">Preparando repaso…</p>
      </div>
    );
  }

  if (queueDue.length === 0 && pending.length === 0 && !done) {
    return (
      <div className="mx-auto grid h-full max-w-xl place-items-center">
        <Card>
          <CardContent className="grid place-items-center gap-4 p-10 text-center">
            <Sparkles className="size-8 text-primary" />
            <h2 className="text-xl font-semibold">Sin repasos pendientes</h2>
            <p className="text-balance text-sm text-muted-foreground">
              No tienes kanjis vencidos hoy. Aprende algunos nuevos desde el
              catálogo para empezar a construir tu pool.
            </p>
            <Button onClick={() => navigate("/kanji")}>Ir al catálogo</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const current = pending[pendingIdx];

  if (done || !current) {
    const totalXp = awards.reduce((acc, a) => acc + a.xpAmount, 0);
    const totalStars = awards.reduce((acc, a) => acc + a.starAmount, 0);
    const leveledUp = awards.some((a) => a.leveledUp);
    const completedDaily = awards.flatMap((a) => a.completedDaily);
    const completedWeekly = awards.flatMap((a) => a.completedWeekly);
    return (
      <div className="mx-auto grid h-full max-w-xl place-items-center">
        <Card className="w-full">
          <CardContent className="grid gap-5 p-10 text-center">
            <p className="font-jp text-xs tracking-[0.3em] text-primary">
              よくできました
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Sesión completada
            </h2>
            <p className="text-sm text-muted-foreground">
              {completed.length} kanji{completed.length === 1 ? "" : "s"} repasado
              {completed.length === 1 ? "" : "s"}.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <SummaryStat
                icon={<Sparkles className="size-4 text-primary" />}
                label="XP"
                value={`+${totalXp}`}
              />
              <SummaryStat
                icon={<Star className="size-4 text-warning fill-warning" />}
                label="Estrellas"
                value={`+${totalStars}`}
              />
            </div>
            {leveledUp ? (
              <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                ¡Subiste de nivel!
              </p>
            ) : null}
            {completedDaily.length > 0 || completedWeekly.length > 0 ? (
              <div className="space-y-1 rounded-lg bg-success/10 px-3 py-2 text-left text-xs text-success">
                {completedDaily.map((m) => (
                  <p key={`d-${m.id}`}>
                    ✓ Misión diaria: {m.title}
                  </p>
                ))}
                {completedWeekly.map((m) => (
                  <p key={`w-${m.id}`}>
                    ✓ Misión semanal: {m.title}
                  </p>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/")}
              >
                Al inicio
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate("/kanji")}
              >
                Catálogo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((pendingIdx) / pending.length) * 100;

  const handleGrade = async (grade: ReviewGrade) => {
    const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
    try {
      const result = await review.mutateAsync({
        kanjiId: current.kanji.id,
        grade,
        durationSeconds,
      });
      setCompleted((c) => [...c, result.srs]);
      setAwards((a) => [...a, result.award]);
      const nextIdx = pendingIdx + 1;
      if (nextIdx >= pending.length) {
        setDone(true);
      } else {
        setPendingIdx(nextIdx);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/kanji")}
          className="gap-1"
        >
          <X className="size-3.5" /> Salir
        </Button>
        <p className="text-xs tabular-nums text-muted-foreground">
          {pendingIdx + 1} / {pending.length}
        </p>
      </div>
      <Progress value={progress} className="h-1" />

      <div className="grid flex-1 place-items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.kanji.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <ReviewCard srs={current} revealed={revealed} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        {!revealed ? (
          <Button
            size="xl"
            className="w-full"
            onClick={() => setRevealed(true)}
          >
            <Check className="size-4" /> Mostrar respuesta
          </Button>
        ) : (
          <GradeButtons onGrade={handleGrade} disabled={review.isPending} />
        )}
      </div>
    </div>
  );
}

function SummaryStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card/60 px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
