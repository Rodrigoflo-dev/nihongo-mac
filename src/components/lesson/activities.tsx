import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ExternalLink,
  Info,
  Keyboard,
  Lightbulb,
  Mic,
  Play,
  Sparkles,
  Square,
  Trophy,
  Volume2,
} from "lucide-react";
import { toKana, toRomaji } from "wanakana";

import { Button } from "@/components/ui/button";
import { JapaneseKeyboard } from "@/components/lesson/japanese-keyboard";
import { RomajiLine } from "@/components/lesson/romaji-line";
import { StrokeTrainer, type StrokeProgress } from "@/components/kanji/stroke-trainer";
import { usePlayTts } from "@/hooks/use-listening";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { api } from "@/lib/api";
import type { Activity } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Generate a romaji hint to show below quiz options, but only when it adds
 * value. Skip if the option is pure ASCII (already romaji) or pure kanji
 * with no kana to anchor the reading.
 */
function romajiHint(text: string): string | null {
  const hasKana = /[぀-ヿ]/.test(text);
  if (!hasKana) return null;
  try {
    const romaji = toRomaji(text);
    if (!romaji || romaji === text) return null;
    return romaji;
  } catch {
    return null;
  }
}

/** Inline warning shown under a play button when TTS fails (e.g. no JP voice). */
function TtsErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="mx-auto mt-3 max-w-sm rounded-lg bg-warning/10 px-3 py-2 text-xs leading-relaxed text-warning">
      {message}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Smart, encouraging feedback for free-text sentence answers.
// ---------------------------------------------------------------------------

function normalizeSentence(s: string): string {
  return s.trim().replace(/[。、.\s]+$/g, "").replace(/\s+/g, "");
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array(n + 1);
  const cur = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = cur[j];
  }
  return prev[n];
}

export interface SentenceVerdict {
  correct: boolean;
  tone: "success" | "close" | "wrong";
  title: string;
  detail?: string;
}

/**
 * Compare a learner's answer to the accepted variants and return warm,
 * specific feedback so the app visibly "pays attention" to their mistakes.
 */
export function evaluateSentence(
  raw: string,
  accepted: string[]
): SentenceVerdict {
  const v = normalizeSentence(raw);
  const variants = accepted.map(normalizeSentence).filter(Boolean);
  if (variants.includes(v)) {
    return { correct: true, tone: "success", title: "¡Perfecto! 🎉 Lo escribiste tal cual." };
  }
  // Closest accepted variant by edit distance.
  let best = variants[0] ?? "";
  let bestDist = Infinity;
  for (const t of variants) {
    const d = levenshtein(v, t);
    if (d < bestDist) {
      bestDist = d;
      best = t;
    }
  }
  const diff = v.length - best.length;
  if (bestDist <= 2 && v.length > 0) {
    if (diff < 0) {
      return {
        correct: false,
        tone: "close",
        title: "¡Casi! Te falta un poquito ✍️",
        detail: `Escribiste ${v.length} caracteres y la respuesta tiene ${best.length}. Revisa si te faltó una partícula o el final です/ます.`,
      };
    }
    if (diff > 0) {
      return {
        correct: false,
        tone: "close",
        title: "¡Casi! Pusiste algo de más ✂️",
        detail: `Sobra ${diff} carácter${diff === 1 ? "" : "es"}. Quita lo extra y vuelve a intentar.`,
      };
    }
    return {
      correct: false,
      tone: "close",
      title: "¡Muy cerca! Solo un carácter distinto 🔍",
      detail: "Compara con la versión natural de abajo y corrige el carácter.",
    };
  }
  if (v.length === 0) {
    return { correct: false, tone: "wrong", title: "Escribe tu intento antes de verificar ✏️" };
  }
  return {
    correct: false,
    tone: "wrong",
    title: "Aún no es correcto — ¡tú puedes! 💪",
    detail: "Apóyate en la pista y en el teclado. Mira la versión natural de abajo.",
  };
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1 transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Activity shell
// ---------------------------------------------------------------------------

function ActivityShell({
  eyebrow,
  jp,
  children,
}: {
  eyebrow: string;
  jp?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.32, ease: [0.21, 1.02, 0.73, 1] }}
      className="mx-auto w-full max-w-2xl space-y-6"
    >
      <div className="text-center">
        {jp ? (
          <p className="font-jp text-[11px] tracking-[0.4em] text-primary">
            {jp}
          </p>
        ) : null}
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
      </div>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export interface ActivityRenderProps {
  activity: Activity;
  verified: boolean;
  attempt: number;
  onAnswer: (correct: boolean) => void;
}

export function ActivityView({
  activity,
  verified,
  attempt,
  onAnswer,
}: ActivityRenderProps) {
  switch (activity.kind) {
    case "intro_kanji":
      return <IntroKanji activity={activity} />;
    case "intro_vocab":
      return <IntroVocab activity={activity} />;
    case "intro_grammar":
      return <IntroGrammar activity={activity} />;
    case "quiz":
      return (
        <QuizActivity
          key={`${activity.id}-${attempt}`}
          activity={activity}
          verified={verified}
          onAnswer={onAnswer}
        />
      );
    case "listening":
      return (
        <ListeningActivity
          key={`${activity.id}-${attempt}`}
          activity={activity}
          verified={verified}
          onAnswer={onAnswer}
        />
      );
    case "speaking":
      return <SpeakingActivity activity={activity} />;
    case "write_kanji":
      return (
        <WriteKanjiActivity
          activity={activity}
          onComplete={() => onAnswer(true)}
        />
      );
    case "write_sentence":
      return (
        <WriteSentenceActivity
          key={`${activity.id}-${attempt}`}
          activity={activity}
          verified={verified}
          onAnswer={onAnswer}
        />
      );
    case "summary":
      return <SummaryActivity activity={activity} />;
  }
}

export function isActivityQuiz(activity: Activity): boolean {
  return (
    activity.kind === "quiz" ||
    activity.kind === "listening" ||
    activity.kind === "write_sentence"
  );
}

// ---------------------------------------------------------------------------
// 1. Intro kanji
// ---------------------------------------------------------------------------

function IntroKanji({
  activity,
}: {
  activity: Extract<Activity, { kind: "intro_kanji" }>;
}) {
  return (
    <ActivityShell eyebrow="Nuevo kanji" jp="新しい漢字">
      <div className="rounded-3xl glass-strong p-10">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-neon-violet to-neon-cyan opacity-30 blur-2xl" />
            <span className="relative font-jp text-[140px] leading-none">
              {activity.kanjiChar}
            </span>
          </div>
          <p className="mt-4 text-2xl font-semibold tracking-tight">
            {activity.meaning}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <ReadingBlock label="On'yomi (lectura china)" readings={activity.onyomi} />
          <ReadingBlock label="Kun'yomi (lectura japonesa)" readings={activity.kunyomi} />
        </div>

        {activity.example ? (
          <div className="mt-6 rounded-xl bg-accent/30 p-4">
            <p className="font-jp text-xl">{activity.example.jp}</p>
            <p className="font-jp text-xs text-muted-foreground">
              {activity.example.reading}
            </p>
            <RomajiLine reading={activity.example.reading} />
            <p className="mt-1 text-sm text-muted-foreground">
              {activity.example.meaning}
            </p>
          </div>
        ) : null}

        {activity.note ? (
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {activity.note}
          </p>
        ) : null}
      </div>
    </ActivityShell>
  );
}

function ReadingBlock({
  label,
  readings,
}: {
  label: string;
  readings: string[];
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-jp text-base">
        {readings.length > 0 ? readings.join(" · ") : "—"}
      </p>
      {readings.length > 0 ? (
        <RomajiLine reading={readings.join(" · ")} />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Intro vocab
// ---------------------------------------------------------------------------

function IntroVocab({
  activity,
}: {
  activity: Extract<Activity, { kind: "intro_vocab" }>;
}) {
  const play = usePlayTts();
  return (
    <ActivityShell eyebrow="Nueva palabra" jp="新しい単語">
      <div className="rounded-3xl glass-strong p-10 text-center">
        <div className="space-y-2">
          <p className="font-jp text-[10px] tracking-[0.4em] text-muted-foreground">
            {activity.reading}
          </p>
          <h2 className="font-jp text-4xl font-medium tracking-tight">
            {activity.word}
          </h2>
          <RomajiLine reading={activity.reading} className="text-center" />
          <p className="text-xl text-foreground/80">{activity.meaning}</p>
        </div>
        <Button
          variant="outline"
          className="mt-5"
          disabled={play.isPending}
          onClick={() =>
            play.mutate({ text: activity.word, voice: "Kyoko", rate: 160 })
          }
        >
          <Volume2 className="size-4" />
          Escuchar
        </Button>
        <TtsErrorNote message={play.ttsError} />
        {activity.example ? (
          <div className="mt-6 rounded-xl bg-accent/30 p-4 text-left">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Ejemplo
            </p>
            <p className="mt-1 font-jp text-lg">{activity.example}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {toRomaji(activity.example)}
            </p>
          </div>
        ) : null}
      </div>
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// 3. Intro grammar
// ---------------------------------------------------------------------------

function IntroGrammar({
  activity,
}: {
  activity: Extract<Activity, { kind: "intro_grammar" }>;
}) {
  return (
    <ActivityShell eyebrow="Nueva gramática" jp="新しい文法">
      <div className="rounded-3xl glass-strong p-10">
        <h2 className="text-balance text-2xl font-semibold tracking-tight">
          {activity.title}
        </h2>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-jp text-base text-primary">
          {activity.pattern}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          {activity.explanation}
        </p>
        <div className="mt-6 rounded-xl border border-success/30 bg-success/5 p-4">
          <p className="text-[10px] uppercase tracking-widest text-success">
            Ejemplo
          </p>
          <p className="mt-1 font-jp text-lg">{activity.example.jp}</p>
          <p className="font-jp text-xs text-muted-foreground">
            {activity.example.reading}
          </p>
          <RomajiLine reading={activity.example.reading} />
          <p className="mt-1 text-sm text-muted-foreground">
            {activity.example.meaning}
          </p>
        </div>
      </div>
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// 4. Quiz
// ---------------------------------------------------------------------------

function QuizActivity({
  activity,
  verified,
  onAnswer,
}: {
  activity: Extract<Activity, { kind: "quiz" }>;
  verified: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  // Shuffle options once per activity mount so the correct answer doesn't
  // always sit in the same slot.
  const shuffled = useMemo(() => {
    const indices = activity.options.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.map((origIdx) => ({
      text: activity.options[origIdx],
      isCorrect: origIdx === activity.correctIndex,
    }));
  }, [activity]);

  const [selectedShuffled, setSelectedShuffled] = useState<number | null>(null);
  const correctIndex = shuffled.findIndex((o) => o.isCorrect);

  return (
    <ActivityShell eyebrow="Pregunta" jp="質問">
      <div className="rounded-3xl glass-strong p-10">
        <div className="text-center">
          {activity.promptJp ? (
            <p className="font-jp text-3xl leading-tight tracking-tight">
              {activity.promptJp}
            </p>
          ) : null}
          <p
            className={cn(
              "text-balance text-base text-foreground/85",
              activity.promptJp ? "mt-4" : ""
            )}
          >
            {activity.prompt}
          </p>
        </div>

        <div className="mt-7 grid gap-3">
          {shuffled.map((opt, idx) => {
            const isPicked = selectedShuffled === idx;
            const romaji = romajiHint(opt.text);
            return (
              <button
                key={`${activity.id}-${idx}`}
                disabled={verified}
                onClick={() => {
                  setSelectedShuffled(idx);
                  onAnswer(opt.isCorrect);
                }}
                className={cn(
                  "rounded-xl border bg-card/60 px-5 py-3 text-left transition-all",
                  "hover:border-primary/40 hover:bg-accent/30",
                  isPicked &&
                    !verified &&
                    "border-primary bg-primary/5 ring-2 ring-primary/20",
                  verified && opt.isCorrect && "border-success bg-success/15 text-success",
                  verified && isPicked && !opt.isCorrect && "border-destructive bg-destructive/15 text-destructive",
                  verified && !opt.isCorrect && !isPicked && "opacity-60"
                )}
              >
                <div className="font-jp text-base">{opt.text}</div>
                {romaji ? (
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {romaji}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        {verified &&
        selectedShuffled !== null &&
        selectedShuffled !== correctIndex &&
        activity.explanation ? (
          <ExplanationCard
            correctAnswer={activity.options[activity.correctIndex]}
            explanation={activity.explanation}
          />
        ) : null}
      </div>
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// 5. Listening
// ---------------------------------------------------------------------------

function ListeningActivity({
  activity,
  verified,
  onAnswer,
}: {
  activity: Extract<Activity, { kind: "listening" }>;
  verified: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  const play = usePlayTts();
  const [rate, setRate] = useState(160);
  const shuffled = useMemo(() => {
    const indices = activity.options.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.map((origIdx) => ({
      text: activity.options[origIdx],
      isCorrect: origIdx === activity.correctIndex,
    }));
  }, [activity]);
  const [selectedShuffled, setSelectedShuffled] = useState<number | null>(null);
  const correctIndex = shuffled.findIndex((o) => o.isCorrect);

  return (
    <ActivityShell eyebrow="Listening" jp="聴解">
      <div className="rounded-3xl glass-strong p-10 text-center">
        <button
          disabled={play.isPending}
          onClick={() =>
            play.mutate({
              text: activity.textJp,
              voice: activity.voice,
              rate,
            })
          }
          className={cn(
            "relative mx-auto flex size-24 items-center justify-center rounded-full",
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
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          {play.isPending ? "Reproduciendo…" : "Pulsa para escuchar"}
        </p>
        <div className="mt-3 inline-flex gap-2">
          {[
            { label: "Lento", value: 110 },
            { label: "Natural", value: 160 },
            { label: "Rápido", value: 210 },
          ].map((r) => (
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
        <TtsErrorNote message={play.ttsError} />
      </div>

      <div className="rounded-3xl glass p-6">
        <p className="text-base font-semibold">{activity.prompt}</p>
        <div className="mt-4 grid gap-3">
          {shuffled.map((opt, idx) => {
            const isPicked = selectedShuffled === idx;
            const romaji = romajiHint(opt.text);
            return (
              <button
                key={`${activity.id}-${idx}`}
                disabled={verified}
                onClick={() => {
                  setSelectedShuffled(idx);
                  onAnswer(opt.isCorrect);
                }}
                className={cn(
                  "rounded-xl border bg-card/60 px-5 py-3 text-left transition-all",
                  "hover:border-primary/40 hover:bg-accent/30",
                  isPicked &&
                    !verified &&
                    "border-primary bg-primary/5 ring-2 ring-primary/20",
                  verified && opt.isCorrect && "border-success bg-success/15 text-success",
                  verified && isPicked && !opt.isCorrect && "border-destructive bg-destructive/15 text-destructive",
                  verified && !opt.isCorrect && !isPicked && "opacity-60"
                )}
              >
                <div className="text-sm">{opt.text}</div>
                {romaji ? (
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {romaji}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
        {verified ? (
          <div className="mt-4 rounded-xl bg-accent/30 p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Texto en japonés
            </p>
            <p className="mt-1 font-jp text-lg">{activity.textJp}</p>
          </div>
        ) : null}
        {verified &&
        selectedShuffled !== null &&
        selectedShuffled !== correctIndex &&
        activity.explanation ? (
          <ExplanationCard
            correctAnswer={activity.options[activity.correctIndex]}
            explanation={activity.explanation}
          />
        ) : null}
      </div>
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// 6. Speaking — with mic permission flow
// ---------------------------------------------------------------------------

function SpeakingActivity({
  activity,
}: {
  activity: Extract<Activity, { kind: "speaking" }>;
}) {
  const play = usePlayTts();
  const rec = useVoiceRecorder();

  return (
    <ActivityShell eyebrow="Practica tu voz" jp="話してみよう">
      <div className="rounded-3xl glass-strong p-10 text-center">
        <p className="font-jp text-[10px] tracking-[0.4em] text-muted-foreground">
          {activity.reading}
        </p>
        <p className="mt-3 font-jp text-3xl leading-tight">{activity.textJp}</p>
        <RomajiLine reading={activity.reading} className="mt-1 text-center" />
        <p className="mt-2 text-sm text-muted-foreground">{activity.meaning}</p>
        <Button
          className="mt-5"
          variant="outline"
          disabled={play.isPending}
          onClick={() =>
            play.mutate({
              text: activity.textJp,
              voice: activity.voice,
              rate: 150,
            })
          }
        >
          <Volume2 className="size-4" />
          {play.isPending ? "Sonando…" : "Escuchar nativa"}
        </Button>
        <TtsErrorNote message={play.ttsError} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={rec.recording ? rec.stop : rec.start}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl glass p-5 transition-all",
            rec.recording && "ring-2 ring-destructive bg-destructive/5"
          )}
        >
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              rec.recording
                ? "bg-destructive text-destructive-foreground"
                : "bg-gradient-to-br from-primary via-neon-violet to-neon-cyan text-primary-foreground"
            )}
            style={
              rec.recording
                ? {
                    boxShadow: `0 0 ${20 + rec.level * 60}px ${
                      4 + rec.level * 16
                    }px color-mix(in oklch, var(--color-destructive) ${
                      30 + rec.level * 40
                    }%, transparent)`,
                  }
                : undefined
            }
          >
            {rec.recording ? <Square className="size-6" /> : <Mic className="size-6" />}
          </div>
          <p className="text-xs font-medium">
            {rec.recording ? "Detener" : rec.recordedUrl ? "Repetir grabación" : "Grabar"}
          </p>
          {rec.recording ? (
            <div className="mt-1 flex h-1.5 w-24 items-center overflow-hidden rounded-full bg-secondary/50">
              <div
                className="h-full rounded-full bg-destructive transition-[width] duration-150"
                style={{ width: `${Math.round(rec.level * 100)}%` }}
              />
            </div>
          ) : null}
        </button>
        <div
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl glass p-5 transition-all",
            !rec.recordedUrl && "opacity-50"
          )}
        >
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              rec.recordedUrl
                ? "bg-gradient-to-br from-success to-neon-cyan text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Play className="size-6" />
          </div>
          <p className="text-xs font-medium">Tu grabación</p>
          {rec.recordedDuration ? (
            <p className="text-[10px] tabular-nums text-muted-foreground">
              {rec.recordedDuration.toFixed(1)}s
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground">Sin grabar aún</p>
          )}
        </div>
      </div>

      {/* Sustained-silence tip (stable, no flicker) */}
      {rec.recording && rec.silent ? (
        <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          No detecto sonido. Verifica que tu mic esté seleccionado en Ajustes de
          macOS → Sonido → Entrada.
        </p>
      ) : null}

      {/* Native player with controls — most reliable playback path */}
      {rec.recordedUrl ? (
        <div className="space-y-2 rounded-2xl glass p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            ▶ Tu voz grabada — pulsa play para escucharte
          </p>
          <audio
            src={rec.recordedUrl}
            preload="auto"
            controls
            controlsList="nodownload"
            className="w-full"
          />
          <p className="text-[10px] text-muted-foreground">
            Compara con la "Escuchar nativa" arriba para ajustar tu pronunciación.
          </p>
        </div>
      ) : null}

      {rec.error ? (
        <div className="space-y-3 rounded-2xl border border-warning/40 bg-warning/5 p-5 text-sm text-warning">
          <p>{rec.error}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => api.openMicSettings()}
            >
              <ExternalLink className="size-3.5" />
              Abrir Ajustes
            </Button>
            <Button size="sm" variant="ghost" onClick={rec.start}>
              Reintentar
            </Button>
          </div>
        </div>
      ) : null}
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// 7. Write kanji — animated stroke order + writing practice (hanzi-writer)
// ---------------------------------------------------------------------------

function WriteKanjiActivity({
  activity,
  onComplete,
}: {
  activity: Extract<Activity, { kind: "write_kanji" }>;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState<StrokeProgress>({
    hasData: true,
    passed: false,
    mistakes: 0,
  });
  // Real validation: if the kanji has stroke data, the learner must complete
  // the writing quiz. If there's no data (trace fallback), we can't validate
  // strokes, so we allow continuing.
  const canContinue = progress.passed || !progress.hasData;

  return (
    <ActivityShell eyebrow="Escribe el kanji" jp="書いてみよう">
      <div className="rounded-3xl glass-strong p-8">
        <div className="text-center">
          <p className="font-jp text-5xl leading-none">{activity.kanjiChar}</p>
          <p className="mt-3 text-sm font-medium">{activity.meaning}</p>
          <p className="font-jp text-xs text-muted-foreground">
            {activity.reading}
          </p>
          <RomajiLine reading={activity.reading} className="text-center" />
        </div>

        <div className="mt-6 flex justify-center">
          <StrokeTrainer
            char={activity.kanjiChar}
            size={240}
            onProgress={setProgress}
          />
        </div>

        {activity.note ? (
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-accent/30 p-4 text-sm text-muted-foreground">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>{activity.note}</span>
          </p>
        ) : null}

        {progress.hasData && !progress.passed ? (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Pulsa <span className="font-medium text-foreground">Practicar</span> y
            escribe el kanji trazo por trazo para continuar.
          </p>
        ) : null}

        <Button
          size="lg"
          className="mt-3 w-full"
          disabled={!canContinue}
          onClick={onComplete}
        >
          <Check className="size-4" />
          {canContinue ? "Continuar" : "Practica el trazo para continuar"}
        </Button>
      </div>
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// 8. Write sentence
// ---------------------------------------------------------------------------

function WriteSentenceActivity({
  activity,
  verified,
  onAnswer,
}: {
  activity: Extract<Activity, { kind: "write_sentence" }>;
  verified: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  // Keyboard visible by default; remember user preference across activities
  const [showKeyboard, setShowKeyboard] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("nihongo-keyboard-visible") !== "false";
  });
  const [romajiInput, setRomajiInput] = useState("");
  // Default to romaji input (most accessible for users without a JP keyboard)
  const [inputMode, setInputMode] = useState<"native" | "romaji">(() => {
    if (typeof window === "undefined") return "romaji";
    return (localStorage.getItem("nihongo-input-mode") as "native" | "romaji") || "romaji";
  });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Persist keyboard preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "nihongo-keyboard-visible",
        showKeyboard ? "true" : "false"
      );
    }
  }, [showKeyboard]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nihongo-input-mode", inputMode);
    }
  }, [inputMode]);

  // Extract kanji from accepted answers to offer as quick-tap keys
  const quickKanji = useMemo(() => {
    const set = new Set<string>();
    const re = /[一-鿿]/g;
    for (const a of activity.accepted) {
      for (const m of a.matchAll(re)) set.add(m[0]);
    }
    return Array.from(set);
  }, [activity.accepted]);

  // Real-time romaji preview of whatever is in the textarea
  const romajiPreview = useMemo(() => {
    if (!value) return "";
    try {
      return toRomaji(value);
    } catch {
      return "";
    }
  }, [value]);

  const insertAtCursor = (chunk: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setValue((v) => v + chunk);
      return;
    }
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const next = value.slice(0, start) + chunk + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + chunk.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const backspace = () => {
    const ta = textareaRef.current;
    if (!ta) {
      setValue((v) => v.slice(0, -1));
      return;
    }
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    if (start === end && start > 0) {
      const next = value.slice(0, start - 1) + value.slice(end);
      setValue(next);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(start - 1, start - 1);
      });
    } else if (start !== end) {
      const next = value.slice(0, start) + value.slice(end);
      setValue(next);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(start, start);
      });
    }
  };

  const handleRomajiChange = (raw: string) => {
    setRomajiInput(raw);
    // Convert any complete romaji syllables to hiragana
    const converted = toKana(raw, { IMEMode: "toHiragana" });
    setValue(converted);
  };

  const verdict = useMemo(
    () => evaluateSentence(value, activity.accepted),
    [value, activity.accepted]
  );

  const check = () => {
    onAnswer(verdict.correct);
  };

  return (
    <ActivityShell eyebrow="Escribe la oración" jp="文を書いてみよう">
      <div className="rounded-3xl glass-strong space-y-5 p-8">
        <div>
          <p className="text-base text-foreground">{activity.prompt}</p>
          {activity.hint ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3" />
              Pista: {activity.hint}
            </p>
          ) : null}
        </div>

        {/* Input mode tabs + keyboard toggle (prominent) */}
        {!verified ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-secondary/40 p-1 text-xs">
              <ModeTab
                active={inputMode === "native"}
                onClick={() => setInputMode("native")}
              >
                Teclado nativo
              </ModeTab>
              <ModeTab
                active={inputMode === "romaji"}
                onClick={() => setInputMode("romaji")}
              >
                Escribir en romaji
              </ModeTab>
            </div>
            <Button
              variant={showKeyboard ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => setShowKeyboard((v) => !v)}
            >
              <Keyboard className="size-4" />
              {showKeyboard
                ? "Ocultar teclado japonés"
                : "Mostrar teclado japonés (hiragana / katakana / kanji)"}
            </Button>
          </div>
        ) : null}

        {/* Romaji input (auto-converts to kana) */}
        {!verified && inputMode === "romaji" ? (
          <div className="space-y-2 rounded-xl border bg-card/40 p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Escribe en romaji (se convierte a hiragana automáticamente)
            </p>
            <input
              value={romajiInput}
              onChange={(e) => handleRomajiChange(e.target.value)}
              disabled={verified}
              placeholder="watashi wa gakusei desu"
              autoFocus
              className="w-full rounded-md border-0 bg-transparent px-2 py-1 text-base outline-none placeholder:text-muted-foreground/40"
            />
          </div>
        ) : null}

        {/* Main textarea (always shown) */}
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={verified}
            placeholder="Escribe aquí…"
            rows={3}
            className="w-full resize-none rounded-xl border bg-card/60 px-4 py-3 font-jp text-2xl outline-none transition-colors placeholder:font-sans placeholder:text-sm placeholder:text-muted-foreground focus:border-primary disabled:opacity-70"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !verified && value.trim()) {
                e.preventDefault();
                check();
              }
            }}
          />
          {/* Real-time pronunciation (romaji) preview */}
          <div className="flex items-center gap-2 rounded-lg bg-accent/30 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Pronunciación:</span>
            <span className="font-mono text-foreground">
              {romajiPreview || "—"}
            </span>
          </div>
        </div>

        {/* Virtual keyboard */}
        {!verified && showKeyboard ? (
          <JapaneseKeyboard
            onInsert={insertAtCursor}
            onBackspace={backspace}
            quickKanji={quickKanji}
          />
        ) : null}

        {!verified ? (
          <Button
            size="lg"
            className="w-full"
            disabled={!value.trim()}
            onClick={check}
          >
            Verificar
          </Button>
        ) : null}

        {verified ? (
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "rounded-xl border p-3 text-sm font-medium",
                verdict.tone === "success" && "border-success/40 bg-success/10 text-success",
                verdict.tone === "close" && "border-warning/40 bg-warning/10 text-warning",
                verdict.tone === "wrong" && "border-destructive/30 bg-destructive/10 text-destructive"
              )}
            >
              <p>{verdict.title}</p>
              {verdict.detail ? (
                <p className="mt-1 text-xs font-normal opacity-90">{verdict.detail}</p>
              ) : null}
              {!verdict.correct && value.trim() ? (
                <p className="mt-2 text-xs font-normal">
                  <span className="opacity-70">Tu intento: </span>
                  <span className="font-jp text-sm">{value.trim()}</span>
                </p>
              ) : null}
            </motion.div>
            <div className="rounded-xl border border-success/30 bg-success/5 p-3">
              <p className="text-[10px] uppercase tracking-widest text-success">
                Versión natural
              </p>
              <p className="mt-1 font-jp text-lg">{activity.accepted[0]}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {toRomaji(activity.accepted[0])}
              </p>
            </div>
            <p className="rounded-xl bg-accent/30 p-3 text-sm leading-relaxed text-foreground/85">
              {activity.explanation}
            </p>
          </div>
        ) : null}
      </div>
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// 9. Summary
// ---------------------------------------------------------------------------

function SummaryActivity({
  activity,
}: {
  activity: Extract<Activity, { kind: "summary" }>;
}) {
  return (
    <ActivityShell eyebrow="Lección completada" jp="お疲れさま">
      <div className="rounded-3xl glass-strong p-10">
        <div className="flex items-center justify-center">
          <div className="relative inline-flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-warning via-streak to-neon-pink text-warning-foreground">
            <Trophy className="size-9" />
            <span className="absolute inset-0 rounded-full ring-1 ring-white/40" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl font-semibold">¡Bien hecho!</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Esto es lo que aprendiste en esta lección:
        </p>
        <ul className="mt-6 space-y-2">
          {activity.learned.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm"
            >
              <Check className="size-4 shrink-0 text-success" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          Vas a ganar XP al confirmar
        </p>
      </div>
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// Shared explanation card
// ---------------------------------------------------------------------------

function ExplanationCard({
  correctAnswer,
  explanation,
}: {
  correctAnswer: string;
  explanation: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-5 space-y-2 rounded-xl border border-warning/30 bg-warning/5 p-4"
    >
      <p className="text-[10px] uppercase tracking-widest text-warning">
        ¿Por qué?
      </p>
      <p className="text-sm">
        <span className="text-muted-foreground">Respuesta correcta: </span>
        <span className="font-jp text-base text-success">{correctAnswer}</span>
      </p>
      <p className="text-sm leading-relaxed text-foreground/85">{explanation}</p>
    </motion.div>
  );
}

export { ActivityShell };
