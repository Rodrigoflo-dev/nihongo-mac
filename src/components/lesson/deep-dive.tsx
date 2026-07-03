import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Square, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  cancelSpeech,
  speakText,
  ttsSupported,
  type NarrationLang,
} from "@/lib/tts";
import { cn } from "@/lib/utils";

/**
 * "Escuchar" button: narrates a Spanish (or English) explanation aloud so the
 * learner can listen instead of reading. Toggles between play and stop.
 */
export function ListenButton({
  text,
  label = "Escuchar",
  lang = "es",
  className,
}: {
  text: string;
  label?: string;
  lang?: NarrationLang;
  className?: string;
}) {
  const [speaking, setSpeaking] = useState(false);

  // Stop any narration when the component unmounts (e.g. moving to the next
  // activity) so audio doesn't bleed across screens.
  useEffect(() => {
    return () => cancelSpeech();
  }, []);

  if (!ttsSupported()) return null;

  const toggle = () => {
    if (speaking) {
      cancelSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakText(text, lang)
      .catch(() => {})
      .finally(() => setSpeaking(false));
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      className={cn(
        "border-neon-cyan/40 text-neon-cyan hover:border-neon-cyan hover:text-neon-cyan",
        className
      )}
    >
      {speaking ? (
        <>
          <Square className="size-3.5 fill-current" /> Detener
        </>
      ) : (
        <>
          <Volume2 className="size-3.5" /> {label}
        </>
      )}
    </Button>
  );
}

export interface DeepDivePage {
  /** Small section label (e.g. "¿Cómo se usa?"). */
  label: string;
  /** Plain Spanish text read aloud when the learner presses "Escuchar". */
  narrate: string;
  /** The visual content of the page. */
  body: React.ReactNode;
}

/**
 * A paginated "A fondo" panel: extended explanation split into pages so long
 * content never overflows the card (Rodrigo #4). Each page can be listened to.
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
      <div className="flex items-center justify-between gap-3">
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
              詳しく · A fondo
            </p>
            <p className="font-display text-base font-bold leading-tight">
              {title}
            </p>
          </div>
        </div>
        <ListenButton text={current.narrate} />
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
            <ChevronLeft className="size-4" /> Anterior
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
            Siguiente <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : null}
    </motion.div>
  );
}
