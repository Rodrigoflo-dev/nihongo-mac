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
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
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
import { useT } from "@/lib/i18n";
import { useTc } from "@/lib/content-i18n";

const RATES = [
  { key: "common.slow", value: 110 },
  { key: "listening.natural", value: 170 },
  { key: "common.fast", value: 220 },
];

export default function ListeningPage() {
  const t = useT();
  const tc = useTc();
  const { data: profile } = useUserProfile();
  const level = profile?.currentLevel ?? "N5";
  const [activeId, setActiveId] = useState<number | undefined>(undefined);
  const { data: list, isLoading } = useListeningList(level);

  if (activeId !== undefined) {
    return <DialogueView dialogueId={activeId} onBack={() => setActiveId(undefined)} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="flex items-start justify-between gap-8">
        <PageHeader
          eyebrow={`聴解 — ${level}`}
          title={
            <>
              {t("listening.title.a")}{" "}
              <span className="gradient-text">{t("listening.title.b")}</span>
            </>
          }
          description={t("listening.desc")}
        />
        <HoloKanji
          size={200}
          className="hidden lg:block"
          items={[
            { char: "聴", meaning: "Escuchar" },
            { char: "音", meaning: "Sonido" },
            { char: "声", meaning: "Voz" },
          ]}
        />
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {list?.map((d, i) => (
            <DialogueCard key={d.id} item={d} index={i} onOpen={() => setActiveId(d.id)} tc={tc} />
          ))}
        </div>
      )}
    </div>
  );
}

function DialogueCard({
  item,
  index,
  onOpen,
  tc,
}: {
  item: ListeningListItem;
  index: number;
  onOpen: () => void;
  tc: (s: string) => string;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      onClick={onOpen}
      className={cn(
        "group relative overflow-hidden rounded-3xl glass-strong p-5 text-left transition-all",
        "hover:shadow-[0_0_40px_-12px_color-mix(in_oklch,var(--color-primary)_45%,transparent)]",
        item.completed
          ? "ring-1 ring-success/40"
          : "ring-1 ring-primary/15 hover:ring-primary/50"
      )}
    >
      <span className="hud-corner left-3 top-3 border-l-2 border-t-2" />
      <span className="hud-corner right-3 top-3 border-r-2 border-t-2" />
      <span className="hud-corner bottom-3 left-3 border-b-2 border-l-2" />
      <span className="hud-corner bottom-3 right-3 border-b-2 border-r-2" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="animate-scanline absolute left-0 h-10 w-full bg-gradient-to-b from-transparent via-neon-cyan/[0.07] to-transparent" />
      </div>
      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl ring-1 transition-colors",
            item.completed
              ? "bg-success/15 text-success ring-success/30"
              : "bg-primary/10 text-primary ring-primary/30 group-hover:bg-primary/15"
          )}
        >
          {item.completed ? <Check className="size-5" /> : <Headphones className="size-5" />}
        </div>
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan">
            {item.jlptLevel}
          </p>
          <p className="font-display text-base font-extrabold tracking-tight leading-tight">
            {tc(item.title)}
          </p>
          {item.description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{tc(item.description)}</p>
          ) : null}
          {item.lastScore !== null ? (
            <Badge variant="outline" className="mt-2 border-neon-violet/40 text-[10px] text-neon-violet">
              {tc("Última:")} {Math.round(item.lastScore)}%
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
  const t = useT();
  const tc = useTc();
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
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
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
          <ArrowLeft className="size-3.5" /> {t("reading.back")}
        </Button>
        <Badge variant="outline" className="border-neon-cyan/40 font-mono text-[10px] text-neon-cyan">
          {t("listening.voice", { name: dialogue.voice })}
        </Badge>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan">
          {dialogue.jlptLevel}
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">{tc(dialogue.title)}</h1>
        {dialogue.description ? (
          <p className="text-sm text-muted-foreground">{tc(dialogue.description)}</p>
        ) : null}
      </div>

      {/* Player */}
      <HudPanel glow className="p-6">
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
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-neon-cyan/40" />
                <span className="absolute -inset-3 animate-pulse rounded-full ring-1 ring-neon-cyan/30" />
              </>
            ) : null}
            {play.isPending ? (
              <Volume2 className="relative size-9 animate-pulse" />
            ) : (
              <Play className="relative size-9" />
            )}
            <span className="absolute inset-0 rounded-full ring-1 ring-white/20" />
          </button>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            {play.isPending ? t("listening.playing") : t("listening.tapToListen")}
          </p>
          <div className="flex gap-2">
            {RATES.map((r) => (
              <Button
                key={r.value}
                size="sm"
                variant={rate === r.value ? "default" : "outline"}
                onClick={() => setRate(r.value)}
              >
                {t(r.key)}
              </Button>
            ))}
          </div>
          {play.ttsError ? (
            <p className="max-w-sm rounded-lg bg-warning/10 px-3 py-2 text-xs leading-relaxed text-warning">
              {play.ttsError}
            </p>
          ) : null}
        </div>
      </HudPanel>

      {/* Transcript toggle */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTranscript((v) => !v)}
        >
          {showTranscript ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {showTranscript ? t("listening.hideTranscript") : t("listening.showTranscript")}
        </Button>
        {dialogue.transcriptTranslation ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranslation((v) => !v)}
          >
            {showTranslation ? t("listening.hideTranslation") : t("listening.translate")}
          </Button>
        ) : null}
      </div>
      {showTranscript ? (
        <HudPanel scanline={false} className="p-5">
          <p className="font-jp text-lg leading-relaxed">{dialogue.transcriptJp}</p>
          {showTranslation && dialogue.transcriptTranslation ? (
            <p className="mt-3 border-t border-border/60 pt-3 text-sm text-muted-foreground">
              {tc(dialogue.transcriptTranslation)}
            </p>
          ) : null}
        </HudPanel>
      ) : null}

      {/* Quiz */}
      <div className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
          {t("listening.comprehension")}
        </p>
        {dialogue.questions.map((q, qi) => (
          <HudPanel key={q.id} scanline={false} className="p-5">
            <div className="space-y-3">
            <p className="text-sm font-semibold">
              <span className="font-mono text-neon-cyan">{qi + 1}.</span> {tc(q.prompt)}
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
                      "rounded-xl border border-primary/15 bg-card/60 px-4 py-2.5 text-left text-sm transition-all",
                      !reveal && "hover:border-primary/50 hover:bg-primary/5",
                      selected && !reveal && "border-primary ring-2 ring-primary/30 bg-primary/10 shadow-[0_0_24px_-8px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]",
                      reveal && isCorrect && "border-success bg-success/10 text-success",
                      reveal && !isCorrect && selected && "border-destructive bg-destructive/10 text-destructive"
                    )}
                  >
                    {tc(opt.text)}
                  </button>
                );
              })}
            </div>
            </div>
          </HudPanel>
        ))}
      </div>

      {submitted ? (
        <HudPanel glow className="p-6 text-center">
          <p className="font-jp text-xs tracking-[0.3em] text-primary">完了</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
            {t("listening.correct", { done: submitted.correct, total: submitted.total })}
          </h2>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            +{submitted.xp} XP
          </p>
          <Button onClick={onBack} className="mt-5 w-full">
            {t("listening.backToDialogues")}
          </Button>
        </HudPanel>
      ) : (
        <Button
          size="xl"
          className="w-full"
          disabled={!allAnswered || complete.isPending}
          onClick={handleSubmit}
        >
          {complete.isPending ? t("listening.grading") : t("listening.confirm")}
        </Button>
      )}
    </motion.div>
  );
}
