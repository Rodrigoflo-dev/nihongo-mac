import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, HelpCircle, Search, Sparkles } from "lucide-react";

import { HudPanel } from "@/components/visual/hud-panel";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export interface DudaTopic {
  /** What kind of thing this topic is (drives how we answer). */
  kind: "kanji" | "vocab" | "grammar";
  /** Spanish label shown in the list. */
  label: string;
  /** Japanese tag (kanji char / word / grammar pattern). */
  jp: string;
  /** Searchable keywords (meaning, reading, pattern…). */
  keywords: string;
  /** Step index in the player to jump to. */
  stepIndex: number;
  // Structured data so we can ANSWER the question inline (all verified, no AI):
  meaning?: string;
  reading?: string;
  onyomi?: string[];
  kunyomi?: string[];
  exampleJp?: string;
  exampleMeaning?: string;
  explanation?: string;
  pattern?: string;
}

const PARTICLE_CHARS = ["は", "が", "を", "に", "へ", "で", "の", "と", "か", "も"];

/** What the learner is actually asking about a topic. */
type Intent = "reading" | "meaning" | "example" | "usage" | "full";

function detectIntent(q: string): Intent {
  if (/(lee|leer|lectura|pronunci|se dice|suena|c[oó]mo se dice)/.test(q))
    return "reading";
  if (/(significa|significado|quiere decir|traduc|qu[eé] es)/.test(q))
    return "meaning";
  if (/(ejemplo|ejemplos|frase|oraci[oó]n)/.test(q)) return "example";
  if (/(sirve|se usa|usar|c[uú]ando|para qu[eé]|funciona|diferencia|us[oa])/.test(q))
    return "usage";
  return "full";
}

/** Score how well a topic matches the query. */
function scoreTopic(topic: DudaTopic, q: string, words: string[]): number {
  let score = 0;
  if (topic.jp && q.includes(topic.jp)) score += 6;
  if (topic.reading && q.includes(topic.reading)) score += 5;
  if (topic.kind === "grammar") {
    for (const p of PARTICLE_CHARS) {
      if (topic.pattern?.includes(p) && q.includes(p)) score += 5;
    }
  }
  const hay = `${topic.label} ${topic.jp} ${topic.keywords}`.toLowerCase();
  if (hay.includes(q)) score += 2;
  for (const w of words) if (hay.includes(w)) score += 1;
  return score;
}

/**
 * Answer the typed doubt from the lesson's own verified data. Returns the answer
 * text + which topic it's about (so we can also offer "repasar a fondo").
 */
export function answerDuda(
  rawQuery: string,
  topics: DudaTopic[]
): { topic: DudaTopic; answer: string } | null {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return null;
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  let best: { topic: DudaTopic; score: number } | null = null;
  for (const t of topics) {
    const s = scoreTopic(t, q, words);
    if (s > 0 && (!best || s > best.score)) best = { topic: t, score: s };
  }
  if (!best) return null;

  const t = best.topic;
  const intent = detectIntent(q);
  const example =
    t.exampleJp && t.exampleJp !== t.jp
      ? t.exampleMeaning
        ? `Ejemplo: ${t.exampleJp} — ${t.exampleMeaning}.`
        : `Ejemplo: ${t.exampleJp}.`
      : "";

  let answer = "";
  if (t.kind === "kanji") {
    const on = t.onyomi?.length ? `on'yomi ${t.onyomi.join("・")}` : "";
    const kun = t.kunyomi?.length ? `kun'yomi ${t.kunyomi.join("・")}` : "";
    const readings = [on, kun].filter(Boolean).join(", ");
    if (intent === "reading")
      answer = `El kanji ${t.jp} se lee: ${readings || t.reading || "—"}.`;
    else if (intent === "meaning")
      answer = `El kanji ${t.jp} significa «${t.meaning}».`;
    else if (intent === "example") answer = example || `${t.jp} = «${t.meaning}».`;
    else
      answer = `${t.jp} significa «${t.meaning}». Se lee ${readings || t.reading || "—"}. ${example}`.trim();
  } else if (t.kind === "vocab") {
    if (intent === "reading")
      answer = `«${t.jp}» se lee «${t.reading}».`;
    else if (intent === "meaning")
      answer = `«${t.jp}» significa «${t.meaning}».`;
    else if (intent === "example") answer = example || `«${t.jp}» = «${t.meaning}».`;
    else
      answer = `«${t.jp}» (${t.reading}) significa «${t.meaning}». ${example}`.trim();
  } else {
    // grammar
    const head = t.pattern ? `${t.pattern} — ` : "";
    answer = `${head}${t.explanation ?? t.label}. ${example}`.trim();
  }

  return { topic: t, answer };
}

const BANDS = {
  facil: {
    labelKey: "inter.easy",
    jp: "やさしい",
    descKey: "inter.easyDesc",
    tone: "from-success to-neon-cyan",
    dots: 1,
  },
  medio: {
    labelKey: "inter.medium",
    jp: "ふつう",
    descKey: "inter.mediumDesc",
    tone: "from-primary to-neon-violet",
    dots: 2,
  },
  dificil: {
    labelKey: "inter.hard",
    jp: "実践",
    descKey: "inter.hardDesc",
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
  const t = useT();
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
        {t("inter.newLevel")}
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
        {t(b.labelKey)}
      </h2>
      <p className="mt-1 font-jp text-lg text-foreground/70">{b.jp}</p>
      <p className="mt-4 text-balance text-muted-foreground">{t(b.descKey)}</p>
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
  const tr = useT();
  const [q, setQ] = useState("");

  const result = useMemo(() => answerDuda(q, topics), [q, topics]);

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
            {tr("inter.dudas.jp")}
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
            {tr("inter.dudas.ready")}
          </h2>
          <p className="mt-2 text-balance text-sm text-muted-foreground">
            {tr("inter.dudas.desc")}
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
              placeholder={tr("inter.dudas.placeholder")}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          {q.trim() ? (
            result ? (
              <div className="mt-2 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-neon-cyan" />
                  <p className="text-sm leading-relaxed text-foreground">
                    {result.answer}
                  </p>
                </div>
                <button
                  onClick={() => onJump(result.topic.stepIndex)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-neon-cyan transition-colors hover:text-neon-cyan/80"
                >
                  {tr("inter.dudas.reviewDeep", { topic: result.topic.label })}
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            ) : (
              <p className="mt-2 rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                {tr("inter.dudas.notFound")}
              </p>
            )
          ) : null}
        </div>
      </HudPanel>
    </motion.div>
  );
}
