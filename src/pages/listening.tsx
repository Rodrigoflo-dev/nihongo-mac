import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Headphones,
  Play,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";
import {
  useCompleteListening,
  useListeningDialogue,
  useListeningList,
  usePlayTts,
} from "@/hooks/use-listening";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { ListeningListItem } from "@/lib/api";
import { cn } from "@/lib/utils";

const RATES = [
  { label: "Lento", value: 110 },
  { label: "Natural", value: 170 },
  { label: "Rápido", value: 220 },
];

export default function ListeningPage() {
  const { data: profile } = useUserProfile();
  const level = profile?.currentLevel ?? "N5";
  const [activeId, setActiveId] = useState<number | undefined>(undefined);
  const { data: list, isLoading } = useListeningList(level);

  if (activeId !== undefined) {
    return <DialogueView dialogueId={activeId} onBack={() => setActiveId(undefined)} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        eyebrow={`聴解 — ${level}`}
        title={
          <>
            Listening con <span className="gradient-text">voces nativas de macOS</span>
          </>
        }
        description="Cada diálogo usa la voz japonesa de tu Mac. Puedes ajustar la velocidad y ver la transcripción si lo necesitas."
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {list?.map((d) => (
            <DialogueCard key={d.id} item={d} onOpen={() => setActiveId(d.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DialogueCard({
  item,
  onOpen,
}: {
  item: ListeningListItem;
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
          {item.completed ? <Check className="size-5" /> : <Headphones className="size-5" />}
        </div>
        <div className="flex-1">
          <p className="font-jp text-[10px] tracking-[0.25em] text-muted-foreground">
            {item.jlptLevel}
          </p>
          <p className="text-base font-semibold leading-tight">{item.title}</p>
          {item.description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
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

function DialogueView({
  dialogueId,
  onBack,
}: {
  dialogueId: number;
  onBack: () => void;
}) {
  const { data: dialogue } = useListeningDialogue(dialogueId);
  const play = usePlayTts();
  const complete = useCompleteListening();
  const [rate, setRate] = useState(170);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<{
    correct: number;
    total: number;
    xp: number;
  } | null>(null);

  if (!dialogue) {
    return (
      <div className="grid h-full place-items-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  const allAnswered = dialogue.questions.every((q) => q.id in answers);

  const handleSubmit = async () => {
    const res = await complete.mutateAsync({
      dialogueId: dialogue.id,
      submission: {
        answers: Object.entries(answers).map(([qid, idx]) => ({
          questionId: qid,
          optionIndex: idx,
        })),
      },
    });
    let correct = 0;
    for (const q of dialogue.questions) {
      const i = answers[q.id];
      if (q.options[i]?.correct) correct += 1;
    }
    setSubmitted({
      correct,
      total: dialogue.questions.length,
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
        <Badge variant="outline" className="font-mono text-[10px]">
          Voz: {dialogue.voice}
        </Badge>
      </div>

      <div className="space-y-2">
        <p className="font-jp text-[11px] tracking-[0.3em] text-muted-foreground">
          {dialogue.jlptLevel}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{dialogue.title}</h1>
        {dialogue.description ? (
          <p className="text-sm text-muted-foreground">{dialogue.description}</p>
        ) : null}
      </div>

      {/* Player */}
      <div className="rounded-2xl glass-strong p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <button
            onClick={() =>
              play.mutate({
                text: dialogue.transcriptJp,
                voice: dialogue.voice,
                rate,
              })
            }
            disabled={play.isPending}
            className={cn(
              "relative flex size-24 items-center justify-center rounded-full",
              "bg-gradient-to-br from-primary via-neon-violet to-neon-cyan text-primary-foreground",
              "shadow-[0_24px_60px_-12px_color-mix(in_oklch,var(--color-primary)_55%,transparent)]",
              "transition-all hover:scale-105 disabled:opacity-70"
            )}
          >
            {play.isPending ? (
              <Volume2 className="size-9 animate-pulse" />
            ) : (
              <Play className="size-9" />
            )}
            <span className="absolute inset-0 rounded-full ring-1 ring-white/20" />
          </button>
          <p className="text-xs text-muted-foreground">
            {play.isPending ? "Reproduciendo…" : "Pulsa para escuchar"}
          </p>
          <div className="flex gap-2">
            {RATES.map((r) => (
              <Button
                key={r.value}
                size="sm"
                variant={rate === r.value ? "default" : "outline"}
                onClick={() => setRate(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
          {play.ttsError ? (
            <p className="max-w-sm rounded-lg bg-warning/10 px-3 py-2 text-xs leading-relaxed text-warning">
              {play.ttsError}
            </p>
          ) : null}
        </div>
      </div>

      {/* Transcript toggle */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTranscript((v) => !v)}
        >
          {showTranscript ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {showTranscript ? "Ocultar transcripción" : "Mostrar transcripción"}
        </Button>
        {dialogue.transcriptTranslation ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranslation((v) => !v)}
          >
            {showTranslation ? "Ocultar traducción" : "Traducir"}
          </Button>
        ) : null}
      </div>
      {showTranscript ? (
        <div className="rounded-2xl glass p-5">
          <p className="font-jp text-lg leading-relaxed">{dialogue.transcriptJp}</p>
          {showTranslation && dialogue.transcriptTranslation ? (
            <p className="mt-3 border-t border-border/60 pt-3 text-sm text-muted-foreground">
              {dialogue.transcriptTranslation}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Quiz */}
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Comprensión auditiva
        </p>
        {dialogue.questions.map((q, qi) => (
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
            Volver a diálogos
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
