import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Eraser,
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
import { usePlayTts } from "@/hooks/use-listening";
import { api } from "@/lib/api";
import type { Activity } from "@/lib/api";
import { cn } from "@/lib/utils";

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
        {activity.example ? (
          <div className="mt-6 rounded-xl bg-accent/30 p-4 text-left">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Ejemplo
            </p>
            <p className="mt-1 font-jp text-lg">{activity.example}</p>
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
            return (
              <button
                key={`${activity.id}-${idx}`}
                disabled={verified}
                onClick={() => {
                  setSelectedShuffled(idx);
                  onAnswer(opt.isCorrect);
                }}
                className={cn(
                  "rounded-xl border bg-card/60 px-5 py-3.5 text-left text-base transition-all",
                  "hover:border-primary/40 hover:bg-accent/30",
                  isPicked &&
                    !verified &&
                    "border-primary bg-primary/5 ring-2 ring-primary/20",
                  verified && opt.isCorrect && "border-success bg-success/15 text-success",
                  verified && isPicked && !opt.isCorrect && "border-destructive bg-destructive/15 text-destructive",
                  verified && !opt.isCorrect && !isPicked && "opacity-60"
                )}
              >
                <span className="font-jp">{opt.text}</span>
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
      </div>

      <div className="rounded-3xl glass p-6">
        <p className="text-base font-semibold">{activity.prompt}</p>
        <div className="mt-4 grid gap-3">
          {shuffled.map((opt, idx) => {
            const isPicked = selectedShuffled === idx;
            return (
              <button
                key={`${activity.id}-${idx}`}
                disabled={verified}
                onClick={() => {
                  setSelectedShuffled(idx);
                  onAnswer(opt.isCorrect);
                }}
                className={cn(
                  "rounded-xl border bg-card/60 px-5 py-3 text-left text-sm transition-all",
                  "hover:border-primary/40 hover:bg-accent/30",
                  isPicked &&
                    !verified &&
                    "border-primary bg-primary/5 ring-2 ring-primary/20",
                  verified && opt.isCorrect && "border-success bg-success/15 text-success",
                  verified && isPicked && !opt.isCorrect && "border-destructive bg-destructive/15 text-destructive",
                  verified && !opt.isCorrect && !isPicked && "opacity-60"
                )}
              >
                {opt.text}
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

/**
 * Pick a mime type the current browser actually supports. WKWebView (Tauri's
 * default on macOS) tends to support `audio/mp4` (AAC) but NOT `audio/webm`,
 * which is why earlier playback was silent — we recorded mp4 but wrapped it
 * in a Blob tagged as webm, so the <audio> element couldn't decode it.
 */
function pickRecordingMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/aac",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return "";
}

function SpeakingActivity({
  activity,
}: {
  activity: Extract<Activity, { kind: "speaking" }>;
}) {
  const play = usePlayTts();
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [permError, setPermError] = useState<string | null>(null);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingMimeRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioCtxRef.current?.close().catch(() => {});
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    setPermError(null);
    setRecordedDuration(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Pick a mime type the browser actually supports.
      const mime = pickRecordingMimeType();
      recordingMimeRef.current = mime;
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        // Use the actual recorder.mimeType so the Blob matches what was recorded
        const usedType = recorder.mimeType || mime || "audio/mp4";
        const blob = new Blob(chunksRef.current, { type: usedType });
        const url = URL.createObjectURL(blob);
        setRecordedUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setRecordedDuration((Date.now() - recordingStartRef.current) / 1000);
        stream.getTracks().forEach((t) => t.stop());
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setRecordingLevel(0);
      };

      // Volume meter so the user gets visual feedback that mic actually works
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        setRecordingLevel(Math.min(1, rms * 3));
        animationRef.current = requestAnimationFrame(tick);
      };
      tick();

      recorder.start(250); // emit chunks every 250ms so something is always buffered
      recordingStartRef.current = Date.now();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      const e = err as DOMException;
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setPermError(
          "macOS bloqueó el micrófono. Abre Ajustes del Sistema → Privacidad y seguridad → Micrófono y activa Nihongo."
        );
      } else if (e.name === "NotFoundError") {
        setPermError("No detecté un micrófono conectado.");
      } else {
        setPermError(`No pude acceder al micrófono: ${e.message ?? e.name}`);
      }
    }
  };

  const stop = () => {
    try {
      recorderRef.current?.stop();
    } catch {
      /* ignore */
    }
    setRecording(false);
  };

  return (
    <ActivityShell eyebrow="Practica tu voz" jp="話してみよう">
      <div className="rounded-3xl glass-strong p-10 text-center">
        <p className="font-jp text-[10px] tracking-[0.4em] text-muted-foreground">
          {activity.reading}
        </p>
        <p className="mt-3 font-jp text-3xl leading-tight">{activity.textJp}</p>
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={recording ? stop : start}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl glass p-5 transition-all",
            recording && "ring-2 ring-destructive bg-destructive/5"
          )}
        >
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              recording
                ? "bg-destructive text-destructive-foreground"
                : "bg-gradient-to-br from-primary via-neon-violet to-neon-cyan text-primary-foreground"
            )}
            style={
              recording
                ? {
                    boxShadow: `0 0 ${20 + recordingLevel * 60}px ${
                      4 + recordingLevel * 16
                    }px color-mix(in oklch, var(--color-destructive) ${
                      30 + recordingLevel * 40
                    }%, transparent)`,
                  }
                : undefined
            }
          >
            {recording ? <Square className="size-6" /> : <Mic className="size-6" />}
          </div>
          <p className="text-xs font-medium">
            {recording ? "Detener" : recordedUrl ? "Repetir grabación" : "Grabar"}
          </p>
          {recording ? (
            <div className="mt-1 flex h-1.5 w-24 items-center overflow-hidden rounded-full bg-secondary/50">
              <div
                className="h-full rounded-full bg-destructive transition-[width] duration-75"
                style={{ width: `${Math.round(recordingLevel * 100)}%` }}
              />
            </div>
          ) : null}
        </button>
        <button
          disabled={!recordedUrl}
          onClick={() => audioRef.current?.play()}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl glass p-5 transition-all",
            !recordedUrl && "opacity-50"
          )}
        >
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              recordedUrl
                ? "bg-gradient-to-br from-success to-neon-cyan text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Play className="size-6" />
          </div>
          <p className="text-xs font-medium">Escuchar mi voz</p>
          {recordedDuration ? (
            <p className="text-[10px] tabular-nums text-muted-foreground">
              {recordedDuration.toFixed(1)}s grabados
            </p>
          ) : null}
        </button>
      </div>

      {/* Tip when recording but no signal — likely wrong input device */}
      {recording && recordingLevel < 0.02 ? (
        <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          No detecto sonido. Verifica que tu mic esté seleccionado en Ajustes de
          macOS → Sonido → Entrada.
        </p>
      ) : null}

      {recordedUrl ? (
        <audio
          ref={audioRef}
          src={recordedUrl}
          preload="auto"
          controls
          className="w-full"
        />
      ) : null}

      {permError ? (
        <div className="space-y-3 rounded-2xl border border-warning/40 bg-warning/5 p-5 text-sm text-warning">
          <p>{permError}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => api.openMicSettings()}
            >
              <ExternalLink className="size-3.5" />
              Abrir Ajustes
            </Button>
            <Button size="sm" variant="ghost" onClick={start}>
              Reintentar
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-warning/80">
            En modo desarrollo macOS a veces no muestra el dialog. Si no
            aparece Nihongo en la lista, ejecuta una vez{" "}
            <code className="rounded bg-warning/20 px-1.5 py-0.5 font-mono text-[10px]">
              npm run tauri build
            </code>{" "}
            y abre el .app generado para que el sistema registre los permisos.
          </p>
        </div>
      ) : null}
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// 7. Write kanji — canvas drawing
// ---------------------------------------------------------------------------

function WriteKanjiActivity({
  activity,
  onComplete,
}: {
  activity: Extract<Activity, { kind: "write_kanji" }>;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasStrokes, setHasStrokes] = useState(false);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = container.clientWidth;
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 12;
    ctx.strokeStyle =
      getComputedStyle(document.documentElement).getPropertyValue("--color-foreground") ||
      "#000";
  }, []);

  const point = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const m = e as React.MouseEvent;
    return { x: m.clientX - rect.left, y: m.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    drawingRef.current = true;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!hasStrokes) setHasStrokes(true);
  };
  const endDraw = () => {
    drawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  return (
    <ActivityShell eyebrow="Escribe el kanji" jp="書いてみよう">
      <div className="rounded-3xl glass-strong p-8">
        <div className="grid grid-cols-2 items-start gap-6">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Modelo
            </p>
            <div className="relative mx-auto mt-3 flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/40">
              <span className="font-jp text-[120px] leading-none">
                {activity.kanjiChar}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium">{activity.meaning}</p>
            <p className="font-jp text-xs text-muted-foreground">
              {activity.reading}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Tu turno
            </p>
            <div
              ref={containerRef}
              className="relative mx-auto mt-3 aspect-square w-full overflow-hidden rounded-2xl border border-primary/30 bg-card/60"
            >
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-jp text-[120px] leading-none text-foreground/10">
                {activity.kanjiChar}
              </span>
              <canvas
                ref={canvasRef}
                className="absolute inset-0 size-full cursor-crosshair"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <Button size="sm" variant="outline" onClick={clearCanvas}>
                <Eraser className="size-3.5" />
                Borrar
              </Button>
              <Button size="sm" disabled={!hasStrokes} onClick={onComplete}>
                <Check className="size-3.5" />
                Lo escribí
              </Button>
            </div>
          </div>
        </div>

        {activity.note ? (
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-accent/30 p-4 text-sm text-muted-foreground">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>{activity.note}</span>
          </p>
        ) : null}
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
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [romajiInput, setRomajiInput] = useState("");
  const [inputMode, setInputMode] = useState<"native" | "romaji">("native");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  const normalize = (s: string) =>
    s.trim().replace(/[。、\s]+$/g, "").replace(/\s+/g, "");

  const check = () => {
    const v = normalize(value);
    const accepted = activity.accepted.map(normalize);
    const ok = accepted.includes(v);
    onAnswer(ok);
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

        {/* Input mode tabs */}
        {!verified ? (
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
            <button
              onClick={() => setShowKeyboard((v) => !v)}
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-primary hover:bg-primary/10"
            >
              <Keyboard className="size-3" />
              {showKeyboard ? "Ocultar teclado" : "Teclado en pantalla"}
            </button>
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
