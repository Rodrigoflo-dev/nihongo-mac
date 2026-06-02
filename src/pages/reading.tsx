import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpenCheck, Check, Eye, EyeOff, ScrollText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { burstXp, burstLevelUp } from "@/components/visual/confetti";
import {
  useCompleteReading,
  useReadingList,
  useReadingPassage,
} from "@/hooks/use-reading";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { ReadingListItem } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ReadingPage() {
  const { data: profile } = useUserProfile();
  const level = profile?.currentLevel ?? "N5";
  const [activeId, setActiveId] = useState<number | undefined>(undefined);
  const { data: list, isLoading } = useReadingList(level);

  if (activeId !== undefined) {
    return <PassageView passageId={activeId} onBack={() => setActiveId(undefined)} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        eyebrow={`読解 — ${level}`}
        title={
          <>
            Lectura <span className="gradient-text">por situaciones</span>
          </>
        }
        description="Diálogos y textos cortos basados en situaciones reales. Lee, marca traducción si necesitas, y resuelve un mini quiz."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {list?.map((p) => (
            <PassageCard key={p.id} item={p} onOpen={() => setActiveId(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PassageCard({
  item,
  onOpen,
}: {
  item: ReadingListItem;
  onOpen: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onOpen}
      className={cn(
        "group relative overflow-hidden rounded-2xl glass p-5 text-left",
        "hover:ring-1 hover:ring-primary/40",
        item.completed && "ring-1 ring-success/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl",
            item.completed ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
          )}
        >
          {item.completed ? <Check className="size-5" /> : <ScrollText className="size-5" />}
        </div>
        <div className="flex-1">
          <p className="font-jp text-[10px] tracking-[0.25em] text-muted-foreground">
            {item.jlptLevel}
          </p>
          <p className="text-base font-semibold leading-tight">{item.title}</p>
          {item.summary ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{item.summary}</p>
          ) : null}
          {item.lastScore !== null ? (
            <Badge variant="outline" className="mt-2 text-[10px]">
              Última: {Math.round(item.lastScore)}%
            </Badge>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}

function PassageView({
  passageId,
  onBack,
}: {
  passageId: number;
  onBack: () => void;
}) {
  const { data: passage } = useReadingPassage(passageId);
  const complete = useCompleteReading();
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<{
    correct: number;
    total: number;
    xp: number;
  } | null>(null);

  if (!passage) {
    return (
      <div className="grid h-full place-items-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  const allAnswered = passage.questions.every((q) => q.id in answers);

  const handleSubmit = async () => {
    const res = await complete.mutateAsync({
      passageId: passage.id,
      submission: {
        answers: Object.entries(answers).map(([qid, idx]) => ({
          questionId: qid,
          optionIndex: idx,
        })),
      },
    });
    let correct = 0;
    for (const q of passage.questions) {
      const i = answers[q.id];
      if (q.options[i]?.correct) correct += 1;
    }
    setSubmitted({
      correct,
      total: passage.questions.length,
      xp: res.xpAmount,
    });
    burstXp();
    if (res.leveledUp) burstLevelUp();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-8"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-3.5" /> Volver
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTranslation((v) => !v)}
        >
          {showTranslation ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {showTranslation ? "Ocultar traducción" : "Mostrar traducción"}
        </Button>
      </div>

      <div className="space-y-2">
        <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
          {passage.jlptLevel}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{passage.title}</h1>
        {passage.summary ? (
          <p className="text-sm text-muted-foreground">{passage.summary}</p>
        ) : null}
      </div>

      <div className="rounded-2xl glass p-6">
        <p className="font-jp text-xl leading-relaxed">{passage.textJp}</p>
        {showTranslation && passage.textTranslation ? (
          <p className="mt-4 border-t border-border/60 pt-4 text-sm text-muted-foreground">
            {passage.textTranslation}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Comprensión
        </p>
        {passage.questions.map((q, qi) => (
          <div key={q.id} className="space-y-3 rounded-2xl glass p-5">
            <p className="text-sm font-semibold">
              <span className="text-muted-foreground">{qi + 1}.</span> {q.prompt}
            </p>
            <div className="grid gap-2">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx;
                const reveal = submitted !== null;
                const isCorrect = opt.correct;
                return (
                  <button
                    key={idx}
                    disabled={reveal}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                    className={cn(
                      "rounded-xl border bg-card/60 px-4 py-2.5 text-left text-sm transition-all",
                      !reveal && "hover:border-primary/40 hover:bg-accent/30",
                      selected && !reveal && "border-primary ring-2 ring-primary/20 bg-primary/5",
                      reveal && isCorrect && "border-success bg-success/10 text-success",
                      reveal && !isCorrect && selected && "border-destructive bg-destructive/10 text-destructive"
                    )}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {submitted ? (
        <div className="rounded-2xl glass-strong p-6 text-center">
          <p className="font-jp text-xs tracking-[0.3em] text-primary">完了</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {submitted.correct} / {submitted.total} correctas
          </h2>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            +{submitted.xp} XP
          </p>
          <Button onClick={onBack} className="mt-5 w-full">
            <BookOpenCheck className="size-4" /> Volver a textos
          </Button>
        </div>
      ) : (
        <Button
          size="xl"
          className="w-full"
          disabled={!allAnswered || complete.isPending}
          onClick={handleSubmit}
        >
          {complete.isPending ? "Calificando…" : "Confirmar respuestas"}
        </Button>
      )}
    </motion.div>
  );
}
