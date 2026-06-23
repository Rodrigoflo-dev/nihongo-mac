import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, HelpCircle, Search, Sparkles } from "lucide-react";

import { HudPanel } from "@/components/visual/hud-panel";
import { cn } from "@/lib/utils";

export interface DudaTopic {
  /** Spanish label shown in the list. */
  label: string;
  /** Japanese tag. */
  jp: string;
  /** Searchable keywords (meaning, reading, pattern…). */
  keywords: string;
  /** Step index in the player to jump to. */
  stepIndex: number;
}

const BANDS = {
  facil: {
    label: "Fácil",
    jp: "やさしい",
    desc: "Reconoce lo que acabas de aprender.",
    tone: "from-success to-neon-cyan",
    dots: 1,
  },
  medio: {
    label: "Medio",
    jp: "ふつう",
    desc: "Ahora prodúcelo tú — sin mirar.",
    tone: "from-primary to-neon-violet",
    dots: 2,
  },
  dificil: {
    label: "Difícil",
    jp: "実践",
    desc: "Úsalo en frases reales — completa el contexto.",
    tone: "from-warning to-neon-pink",
    dots: 3,
  },
} as const;

export type BandKey = keyof typeof BANDS;

/**
 * Full-screen-ish announcement shown when the learner enters a new difficulty
 * band, so the progression (fácil → medio → difícil) is felt, game-style.
 */
export function BandIntro({ band }: { band: BandKey }) {
  const b = BANDS[band];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.45, ease: [0.21, 1.02, 0.73, 1] }}
      className="mx-auto w-full max-w-2xl text-center [perspective:1000px]"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-neon-cyan">
        Nuevo nivel
      </p>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {[1, 2, 3].map((d) => (
          <span
            key={d}
            className={cn(
              "h-2 w-8 rounded-full transition-colors",
              d <= b.dots
                ? cn("bg-gradient-to-r", b.tone)
                : "bg-muted-foreground/20"
            )}
          />
        ))}
      </div>
      <h2
        className={cn(
          "mt-5 bg-gradient-to-r bg-clip-text font-display text-5xl font-extrabold tracking-tight text-transparent",
          b.tone
        )}
      >
        {b.label}
      </h2>
      <p className="mt-1 font-jp text-lg text-foreground/70">{b.jp}</p>
      <p className="mt-4 text-balance text-muted-foreground">{b.desc}</p>
    </motion.div>
  );
}

/**
 * "¿Tienes dudas?" gate between the explanation and the exercises. Lists the
 * topics just taught; tapping one jumps back to that explanation. There's also
 * a small offline search box: it matches the question text against the topics'
 * keywords and points the learner to the closest explanation (no AI — fully
 * local, no budget needed).
 */
export function DudasInterstitial({
  topics,
  onJump,
}: {
  topics: DudaTopic[];
  onJump: (stepIndex: number) => void;
}) {
  const [q, setQ] = useState("");

  const match = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return null;
    const words = query.split(/\s+/).filter((w) => w.length > 2);
    let best: { topic: DudaTopic; score: number } | null = null;
    for (const t of topics) {
      const hay = `${t.label} ${t.jp} ${t.keywords}`.toLowerCase();
      let score = 0;
      for (const w of words) if (hay.includes(w)) score += 1;
      if (hay.includes(query)) score += 2;
      if (score > 0 && (!best || score > best.score)) best = { topic: t, score };
    }
    return best?.topic ?? null;
  }, [q, topics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-2xl"
    >
      <HudPanel glow className="p-8">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-neon-violet to-neon-cyan text-background">
            <HelpCircle className="size-7" />
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan">
            質問タイム · ¿Dudas?
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
            ¿Listo para practicar?
          </h2>
          <p className="mt-2 text-balance text-sm text-muted-foreground">
            Vienen 20 ejercicios en 3 niveles. Si algo no quedó claro, repásalo
            ahora — toca un tema o escribe tu duda.
          </p>
        </div>

        {topics.length > 0 ? (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {topics.map((t) => (
              <button
                key={t.stepIndex}
                onClick={() => onJump(t.stepIndex)}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-left transition-all hover:border-neon-cyan/50 hover:bg-accent/20"
              >
                <span className="font-jp text-lg text-primary">{t.jp}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {t.label}
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-6">
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Escribe tu duda… (ej. ¿cómo se lee este kanji?)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          {q.trim() ? (
            match ? (
              <button
                onClick={() => onJump(match.stepIndex)}
                className="mt-2 flex w-full items-center gap-2 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-3 text-left text-sm text-neon-cyan transition-colors hover:bg-neon-cyan/15"
              >
                <Sparkles className="size-4 shrink-0" />
                <span>
                  Repasa: <span className="font-semibold">{match.label}</span>
                </span>
                <ArrowRight className="ml-auto size-4" />
              </button>
            ) : (
              <p className="mt-2 rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                No encontré un tema exacto. Revisa la lista de arriba o empieza
                los ejercicios — la respuesta correcta se muestra cuando fallas.
              </p>
            )
          ) : null}
        </div>
      </HudPanel>
    </motion.div>
  );
}
