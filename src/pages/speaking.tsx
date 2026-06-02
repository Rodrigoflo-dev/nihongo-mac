import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Mic,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { usePlayTts } from "@/hooks/use-listening";
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

  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setRecordedUrl(null);
  }, [idx]);

  const start = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (e) {
      setPermissionError(
        "No tengo permiso para el micrófono. Activa el permiso en Ajustes de macOS → Privacidad → Micrófono."
      );
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const next = () => setIdx((i) => (i + 1) % PHRASES.length);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PageHeader
        eyebrow="会話 — Speaking"
        title={
          <>
            Practica tu <span className="gradient-text">pronunciación</span>
          </>
        }
        description="Escucha la frase, grábate y compara. Usa el micrófono de tu Mac — la grabación nunca sale de tu equipo."
        actions={
          <Badge variant="outline" className="text-[10px]">
            Frase {idx + 1} / {PHRASES.length}
          </Badge>
        }
      />

      {permissionError ? (
        <div className="rounded-2xl border border-warning/40 bg-warning/5 px-4 py-3 text-sm text-warning">
          {permissionError}
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
          <div className="relative overflow-hidden rounded-3xl glass-strong p-10 text-center">
            <p className="font-jp text-[10px] tracking-[0.4em] text-muted-foreground">
              れんしゅう
            </p>
            <p className="mt-2 font-jp text-4xl leading-tight">{phrase.jp}</p>
            <p className="mt-3 font-jp text-sm tracking-wider text-muted-foreground">
              {phrase.reading}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{phrase.meaning}</p>
            <Button
              className="mt-5"
              variant="outline"
              onClick={() =>
                play.mutate({ text: phrase.jp, voice: phrase.voice, rate: 160 })
              }
              disabled={play.isPending}
            >
              <Volume2 className="size-4" />
              {play.isPending ? "Reproduciendo…" : "Escuchar nativa"}
            </Button>
          </div>

          {/* Recorder */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
            <RecordPanel
              recording={recording}
              recordedUrl={recordedUrl}
              onStart={start}
              onStop={stop}
            />
            <PlaybackPanel recordedUrl={recordedUrl} />
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function RecordPanel({
  recording,
  recordedUrl,
  onStart,
  onStop,
}: {
  recording: boolean;
  recordedUrl: string | null;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl glass p-5 text-center">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Tu grabación
      </p>
      <button
        onClick={recording ? onStop : onStart}
        className={cn(
          "relative mx-auto flex size-20 items-center justify-center rounded-full transition-all",
          recording
            ? "bg-destructive text-destructive-foreground shadow-[0_0_40px_0_color-mix(in_oklch,var(--color-destructive)_50%,transparent)] animate-pulse"
            : "bg-gradient-to-br from-primary via-neon-violet to-neon-cyan text-primary-foreground"
        )}
      >
        {recording ? <Square className="size-7" /> : <Mic className="size-7" />}
      </button>
      <p className="text-xs text-muted-foreground">
        {recording ? "Grabando…" : recordedUrl ? "Listo" : "Pulsa para grabar"}
      </p>
    </div>
  );
}

function PlaybackPanel({ recordedUrl }: { recordedUrl: string | null }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  return (
    <div className="space-y-3 rounded-2xl glass p-5 text-center">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Reproducir
      </p>
      <button
        onClick={() => ref.current?.play()}
        disabled={!recordedUrl}
        className={cn(
          "relative mx-auto flex size-20 items-center justify-center rounded-full transition-all",
          recordedUrl
            ? "bg-gradient-to-br from-success to-neon-cyan text-primary-foreground"
            : "bg-secondary text-muted-foreground"
        )}
      >
        {recordedUrl ? <Play className="size-7" /> : <RotateCcw className="size-7" />}
      </button>
      <p className="text-xs text-muted-foreground">
        {recordedUrl ? "Pulsa para escuchar" : "Aún sin grabación"}
      </p>
      {recordedUrl ? (
        <audio ref={ref} src={recordedUrl} preload="auto" />
      ) : null}
    </div>
  );
}
