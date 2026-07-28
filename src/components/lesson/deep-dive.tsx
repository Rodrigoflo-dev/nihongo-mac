import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Square, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  cancelSpeech,
  speakJapanese,
  speakSequence,
  ttsSupported,
  type NarrationLang,
  type NarrationSegment,
} from "@/lib/tts";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/stores/language";
import { useT } from "@/lib/i18n";

/**
 * Tiny "play this Japanese" button — a self-contained module so each reading /
 * word can be heard on its own (Rodrigo: "que sean módulos diferentes").
 */
export function JaSpeakButton({
  text,
  className,
  "aria-label": ariaLabel = "Escuchar",
}: {
  text: string;
  className?: string;
  "aria-label"?: string;
}) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => cancelSpeech(), []);
  if (!ttsSupported()) return null;
  const toggle = () => {
    if (playing) {
      cancelSpeech();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speakJapanese(text)
      .catch(() => {})
      .finally(() => setPlaying(false));
  };
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={toggle}
      className={cn(
        "inline-grid size-7 place-items-center rounded-full border border-neon-cyan/40 text-neon-cyan transition-colors hover:bg-neon-cyan/10",
        className
      )}
    >
      {playing ? (
        <Square className="size-3 fill-current" />
      ) : (
        <Volume2 className="size-3.5" />
      )}
    </button>
  );
}

/** Builds the ordered narration for a given language (Japanese parts stay JP). */
export type SegmentBuilder = (lang: NarrationLang) => NarrationSegment[];

const SPEEDS: { key: string; rate: number }[] = [
  { key: "common.slow", rate: 0.75 },
  { key: "common.normal", rate: 1 },
  { key: "common.fast", rate: 1.3 },
];

/** Small segmented pill control. */
function Segmented<T>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-border/60 bg-card/40 p-0.5">
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "px-2.5 py-1 text-[11px] font-medium transition-colors",
            value === o.value
              ? "rounded-full bg-neon-cyan/20 text-neon-cyan"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * "Escuchar" control: reads a narration aloud, mixing a Japanese voice for the
 * Japanese parts (real pronunciation) with a Spanish/English voice for the
 * explanation. Lets the learner pick language (Español/English) and speed
 * (Lento/Normal/Rápido) — Rodrigo's audio requests.
 */
export function AudioBar({
  getSegments,
  className,
  label,
}: {
  getSegments: SegmentBuilder;
  className?: string;
  label?: string;
}) {
  const t = useT();
  // Narration language comes from the global preference (chosen at onboarding,
  // changed in Ajustes) — no per-card Español/English toggle anymore.
  const lang = useLanguage((s) => s.lang);
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);

  // Stop narration on unmount so audio doesn't bleed to the next screen.
  useEffect(() => () => cancelSpeech(), []);

  if (!ttsSupported()) return null;

  const stop = () => {
    cancelSpeech();
    setPlaying(false);
  };
  const play = () => {
    if (playing) return stop();
    setPlaying(true);
    speakSequence(getSegments(lang), { rate })
      .catch(() => {})
      .finally(() => setPlaying(false));
  };
  // Changing speed mid-playback stops it; the learner presses play again.
  const changeRate = (r: number) => {
    if (playing) stop();
    setRate(r);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={play}
        className="border-neon-cyan/40 text-neon-cyan hover:border-neon-cyan hover:text-neon-cyan"
      >
        {playing ? (
          <>
            <Square className="size-3.5 fill-current" /> {t("common.stop")}
          </>
        ) : (
          <>
            <Volume2 className="size-3.5" /> {label ?? t("common.listen")}
          </>
        )}
      </Button>
      <Segmented
        value={rate}
        onChange={(v) => changeRate(v)}
        options={SPEEDS.map((s) => ({ label: t(s.key), value: s.rate }))}
      />
    </div>
  );
}

export interface DeepDivePage {
  /** Small section label (e.g. "¿Cómo se usa?"). */
  label: string;
  /** Builds the narration for this page in the chosen language. */
  speech: SegmentBuilder;
  /** The visual content of the page. */
  body: React.ReactNode;
}

/**
 * A paginated "A fondo" panel: extended explanation split into pages so long
 * content never overflows the card. Each page can be listened to (bilingual,
 * with speed control).
 */
export function DeepDive({
  title,
  jp,
  pages,
}: {
  title: string;
  jp: string;
  pages: DeepDivePage[];
}) {
  const t = useT();
  const [page, setPage] = useState(0);
  const total = pages.length;
  if (total === 0) return null;
  const current = pages[Math.min(page, total - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="mt-7 rounded-2xl border border-neon-cyan/25 bg-background/40 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="font-jp text-3xl font-bold text-neon-cyan"
            style={{
              textShadow:
                "0 0 18px color-mix(in oklch, var(--color-neon-cyan) 55%, transparent)",
            }}
          >
            {jp}
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan">
              詳しく · {t("deepdive.eyebrow")}
            </p>
            <p className="font-display text-base font-bold leading-tight">
              {title}
            </p>
          </div>
        </div>
        <AudioBar key={page} getSegments={current.speech} />
      </div>

      <div className="mt-4 min-h-[9rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              {current.label}
            </p>
            <div className="mt-2">{current.body}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {total > 1 ? (
        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="size-4" /> {t("common.previous")}
          </Button>
          <div className="flex items-center gap-1.5">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Página ${i + 1}`}
                onClick={() => setPage(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === page ? "w-5 bg-neon-cyan" : "w-1.5 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page >= total - 1}
            onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
          >
            {t("common.next")} <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : null}
    </motion.div>
  );
}
