import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Mic, Square, Volume2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { usePlayTts } from "@/hooks/use-listening";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { cn } from "@/lib/utils";

interface SpeakingPhrase {
  id: string;
  jp: string;
  reading: string;
  meaning: string;
  voice: string;
}

const PHRASES: SpeakingPhrase[] = [
  {
    id: "p1",
    jp: "おはようございます。",
    reading: "ohayou gozaimasu",
    meaning: "Buenos días (formal).",
    voice: "Kyoko",
  },
  {
    id: "p2",
    jp: "はじめまして、ロドリゴです。",
    reading: "hajimemashite, Rodorigo desu",
    meaning: "Mucho gusto, soy Rodrigo.",
    voice: "Otoya",
  },
  {
    id: "p3",
    jp: "コーヒーをひとつください。",
    reading: "koohii wo hitotsu kudasai",
    meaning: "Un café, por favor.",
    voice: "Kyoko",
  },
  {
    id: "p4",
    jp: "ありがとうございました。",
    reading: "arigatou gozaimashita",
    meaning: "Muchas gracias (al despedirse).",
    voice: "Kyoko",
  },
  {
    id: "p5",
    jp: "すみません、トイレはどこですか。",
    reading: "sumimasen, toire wa doko desu ka",
    meaning: "Disculpe, ¿dónde está el baño?",
    voice: "Otoya",
  },
];

export default function SpeakingPage() {
  const play = usePlayTts();
  const [idx, setIdx] = useState(0);
  const phrase = PHRASES[idx];
  const rec = useVoiceRecorder();

  // Clear the recording when moving to another phrase.
  useEffect(() => {
    rec.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const next = () => setIdx((i) => (i + 1) % PHRASES.length);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="flex items-start justify-between gap-8">
        <PageHeader
          eyebrow="会話 — Speaking"
          title={
            <>
              Practica tu <span className="gradient-text">pronunciación</span>
            </>
          }
          description="Escucha la frase, grábate y compara. Usa el micrófono de tu Mac — la grabación nunca sale de tu equipo."
          actions={
            <Badge variant="outline" className="border-neon-cyan/40 font-mono text-[10px] text-neon-cyan">
              Frase {idx + 1} / {PHRASES.length}
            </Badge>
          }
        />
        <HoloKanji
          size={180}
          className="hidden lg:block"
          items={[
            { char: "話", meaning: "Hablar" },
            { char: "声", meaning: "Voz" },
            { char: "口", meaning: "Boca" },
          ]}
        />
      </div>

      {rec.error ? (
        <div className="rounded-2xl border border-warning/40 bg-warning/5 px-4 py-3 text-sm text-warning">
          {rec.error}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={phrase.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Phrase card */}
          <HudPanel glow className="p-10 text-center">
            <div className="holo-grid pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-neon-cyan">
              れんしゅう
            </p>
            <p
              className="mt-2 font-jp text-4xl font-bold leading-tight text-primary"
              style={{
                textShadow:
                  "0 0 18px color-mix(in oklch, var(--color-primary) 60%, transparent), 0 0 40px color-mix(in oklch, var(--color-neon-violet) 40%, transparent)",
              }}
            >
              {phrase.jp}
            </p>
            <p className="mt-3 font-jp text-sm tracking-wider text-muted-foreground">
              {phrase.reading}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{phrase.meaning}</p>
            <Button
              className="relative mt-5"
              variant="outline"
              onClick={() =>
                play.mutate({ text: phrase.jp, voice: phrase.voice, rate: 160 })
              }
              disabled={play.isPending}
            >
              {play.isPending ? (
                <span className="absolute inset-0 animate-pulse rounded-md ring-1 ring-neon-cyan/40" />
              ) : null}
              <Volume2 className={cn("size-4", play.isPending && "animate-pulse")} />
              {play.isPending ? "Reproduciendo…" : "Escuchar nativa"}
            </Button>
            {play.ttsError ? (
              <p className="mx-auto mt-3 max-w-sm rounded-lg bg-warning/10 px-3 py-2 text-xs leading-relaxed text-warning">
                {play.ttsError}
              </p>
            ) : null}
            </div>
          </HudPanel>

          {/* Recorder */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
            <RecordPanel
              recording={rec.recording}
              recordedUrl={rec.recordedUrl}
              level={rec.level}
              onStart={rec.start}
              onStop={rec.stop}
            />
            <PlaybackPanel recordedUrl={rec.recordedUrl} />
            <Button
              size="lg"
              variant="outline"
              onClick={next}
              className="h-full"
            >
              Siguiente
              <CheckCircle2 className="size-4" />
            </Button>
          </div>

          {rec.recording && rec.silent ? (
            <p className="rounded-lg bg-warning/10 px-3 py-2 text-center text-xs text-warning">
              No detecto sonido. Verifica que tu mic esté seleccionado en Ajustes
              de macOS → Sonido → Entrada.
            </p>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function RecordPanel({
  recording,
  recordedUrl,
  level,
  onStart,
  onStop,
}: {
  recording: boolean;
  recordedUrl: string | null;
  level: number;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <HudPanel scanline={false} className="p-5 text-center">
      <div className="space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan">
        Tu grabación
      </p>
      <button
        onClick={recording ? onStop : onStart}
        className={cn(
          "relative mx-auto flex size-20 items-center justify-center rounded-full transition-all hover:scale-105",
          recording
            ? "bg-destructive text-destructive-foreground"
            : "bg-gradient-to-br from-primary via-neon-violet to-neon-cyan text-primary-foreground"
        )}
        style={
          recording
            ? {
                boxShadow: `0 0 ${20 + level * 60}px ${4 + level * 16}px color-mix(in oklch, var(--color-destructive) ${30 + level * 40}%, transparent)`,
              }
            : undefined
        }
      >
        {recording ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" />
        ) : null}
        {recording ? (
          <Square className="relative size-7" />
        ) : (
          <Mic className="relative size-7" />
        )}
        <span className="absolute inset-0 rounded-full ring-1 ring-white/20" />
      </button>
      {recording ? (
        <div className="mx-auto flex h-1.5 w-24 items-center overflow-hidden rounded-full bg-secondary/50">
          <div
            className="h-full rounded-full bg-destructive transition-[width] duration-150"
            style={{ width: `${Math.round(level * 100)}%` }}
          />
        </div>
      ) : null}
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {recording ? "Grabando…" : recordedUrl ? "Listo" : "Pulsa para grabar"}
      </p>
      </div>
    </HudPanel>
  );
}

function PlaybackPanel({ recordedUrl }: { recordedUrl: string | null }) {
  return (
    <HudPanel scanline={false} className="p-5 text-center">
      <div className="space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan">
        Reproducir
      </p>
      {recordedUrl ? (
        <audio
          src={recordedUrl}
          preload="auto"
          controls
          controlsList="nodownload"
          className="w-full"
        />
      ) : (
        <p className="py-6 text-xs text-muted-foreground">Aún sin grabación</p>
      )}
      </div>
    </HudPanel>
  );
}
