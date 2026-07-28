import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Info,
  Keyboard,
  Lightbulb,
  Mic,
  Play,
  Sparkles,
  Square,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import { toKana, toRomaji } from "wanakana";

import { Button } from "@/components/ui/button";
import { HudPanel } from "@/components/visual/hud-panel";
import { JapaneseKeyboard } from "@/components/lesson/japanese-keyboard";
import { RomajiLine } from "@/components/lesson/romaji-line";
import {
  AudioBar,
  DeepDive,
  JaSpeakButton,
  type DeepDivePage,
} from "@/components/lesson/deep-dive";
import { StrokeTrainer, type StrokeProgress } from "@/components/kanji/stroke-trainer";
import { JpReading } from "@/components/shared/jp-reading";
import { useT, type TFn } from "@/lib/i18n";
import { useTc } from "@/lib/content-i18n";
import { useLanguage } from "@/stores/language";
import { usePlayTts } from "@/hooks/use-listening";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { toMixedSegments } from "@/lib/tts";
import { api } from "@/lib/api";
import type { Activity } from "@/lib/api";
import { grammarNoteFor, type GrammarNote } from "@/lib/grammar-notes";
import { kanjiNoteFor, type KanjiNote, type KanjiWord } from "@/lib/kanji-notes";
import { vocabNoteFor, type VocabNote } from "@/lib/vocab-notes";
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

/** Stable small hash of a string → used to vary a question's PRESENTATION style
 * deterministically (same question always looks the same, but consecutive
 * questions differ) so practice doesn't feel like the same card every time. */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
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
  return s
    .trim()
    // strip the apostrophe wanakana inserts to disambiguate ん (kon'nichiwa)
    .replace(/['’ʼ]/g, "")
    .replace(/[。、.\s]+$/g, "")
    .replace(/\s+/g, "");
}

/**
 * Phonetically-loose comparison key. The romaji IME can't always produce a word
 * exactly (こんにちは ↔ こんいちわ): ん before a vowel and the は/わ・へ/え
 * particle spellings collide. We compare on romaji with those quirks collapsed
 * so the learner isn't blocked, while the screen still shows the correct
 * spelling to learn from.
 */
function looseKey(s: string): string {
  try {
    return toRomaji(normalizeSentence(s))
      .toLowerCase()
      .replace(/['’\s]/g, "")
      .replace(/nn/g, "n") // ん double-consonant ambiguity
      .replace(/wa/g, "ha") // は particle pronounced wa
      .replace(/\be\b/g, "he");
  } catch {
    return normalizeSentence(s);
  }
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
  // Phonetically-equivalent (romaji IME quirks like こんにちは↔こんいちわ): accept
  // it as correct but nudge them to notice the proper spelling shown below.
  if (v.length > 0) {
    const key = looseKey(raw);
    if (key && accepted.some((a) => looseKey(a) === key)) {
      return {
        correct: true,
        tone: "success",
        title: "¡Correcto! 🎉 (ojo a la escritura exacta de abajo)",
      };
    }
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
  wide = false,
}: {
  eyebrow: string;
  jp?: string;
  children: React.ReactNode;
  /** Widen the shell for two-column learning cards (explicación | ejemplos). */
  wide?: boolean;
}) {
  return (
    <div className="w-full [perspective:1400px]">
      <motion.div
        initial={{ opacity: 0, y: 18, rotateX: 7 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, y: -16, rotateX: -5 }}
        transition={{ duration: 0.4, ease: [0.21, 1.02, 0.73, 1] }}
        className={cn(
          "mx-auto w-full space-y-6 [transform-style:preserve-3d]",
          wide ? "max-w-5xl" : "max-w-3xl"
        )}
      >
        <div className="text-center">
          {jp ? (
            <p className="font-jp text-[11px] tracking-[0.4em] text-primary">
              {jp}
            </p>
          ) : null}
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            {eyebrow}
          </p>
        </div>
        {children}
      </motion.div>
    </div>
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
  /** Jump to learn this kanji/word (in-lesson if possible). */
  onLearn?: (target: string) => void;
}

export function ActivityView({
  activity,
  verified,
  attempt,
  onAnswer,
  onLearn,
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
          onLearn={onLearn}
        />
      );
    case "listening":
      return (
        <ListeningActivity
          key={`${activity.id}-${attempt}`}
          activity={activity}
          verified={verified}
          onAnswer={onAnswer}
          onLearn={onLearn}
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
    case "order_sentence":
      return (
        <OrderSentenceActivity
          key={`${activity.id}-${attempt}`}
          activity={activity}
          verified={verified}
          onAnswer={onAnswer}
        />
      );
    case "match_pairs":
      return (
        <MatchPairsActivity
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
    activity.kind === "write_sentence" ||
    activity.kind === "order_sentence" ||
    activity.kind === "match_pairs"
  );
}

// ---------------------------------------------------------------------------
// 1. Intro kanji
// ---------------------------------------------------------------------------

/** Build the word/example chips shared by kanji & grammar deep dives. */
function WordChips({
  items,
  lang = "es",
}: {
  items: { jp: string; reading: string; meaning: string; meaningEn?: string }[];
  lang?: UiLang;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((w, i) => (
        <div
          key={i}
          className="rounded-xl border border-l-2 border-border/40 border-l-neon-cyan/60 bg-card/40 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-jp text-base">{w.jp}</p>
            <JaSpeakButton text={w.jp} aria-label={`Escuchar ${w.jp}`} />
          </div>
          <p className="font-jp text-[11px] text-muted-foreground">{w.reading}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {pick(lang, w.meaning, w.meaningEn)}
          </p>
        </div>
      ))}
    </div>
  );
}

/** A short "why is it used like this?" note shown on the examples page, so the
 * learner sees the reason next to the sentences (Rodrigo's request). Reuses the
 * card's already-verified explanation — no new unverified Japanese. */
function WhyBox({ text }: { text: string }) {
  return (
    <div className="mb-3 rounded-xl border border-l-2 border-neon-violet/30 border-l-neon-violet/70 bg-neon-violet/5 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-violet">
        なぜ · Por qué se usa así
      </p>
      <p className="mt-1 text-xs leading-relaxed text-foreground/85">{text}</p>
    </div>
  );
}

/** Examples shown ONE AT A TIME in a clean, centered card with arrows + dots and
 * a slide animation (Rodrigo asked for a carousel — less cramped, more focused). */
function ExampleCarousel({
  items,
  perPage = 1,
  lang = "es",
}: {
  items: ExampleItem[];
  /** How many examples to show per page (fills the wider two-column layout). */
  perPage?: number;
  lang?: UiLang;
}) {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  if (items.length === 0) return null;
  const pageCount = Math.ceil(items.length / perPage);
  const clamped = Math.min(page, pageCount - 1);
  const start = clamped * perPage;
  const group = items.slice(start, start + perPage);
  const multi = perPage > 1;
  const go = (d: number) => {
    setDir(d);
    setPage((p) => (p + d + pageCount) % pageCount);
  };
  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-neon-cyan/25 bg-gradient-to-br from-card/70 to-background/40 p-5 sm:p-6">
        <span className="hud-corner left-2 top-2 border-l-2 border-t-2 border-neon-cyan/40" />
        <span className="hud-corner bottom-2 right-2 border-b-2 border-r-2 border-neon-cyan/40" />
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={clamped}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 40 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -40 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className={multi ? "space-y-4" : ""}
          >
            {group.map((ex, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center text-center",
                  multi && i > 0 && "border-t border-border/30 pt-4"
                )}
              >
                <div className="flex items-center gap-3">
                  <p
                    className={cn(
                      "font-jp leading-snug",
                      multi ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
                    )}
                  >
                    {ex.jp}
                  </p>
                  <JaSpeakButton text={ex.jp} aria-label={`Escuchar ${ex.jp}`} />
                </div>
                {ex.reading ? (
                  <p className="mt-2 font-jp text-sm text-muted-foreground">
                    {ex.reading}
                  </p>
                ) : null}
                {ex.meaning ? (
                  <p className="mt-1 text-sm text-foreground/85">
                    {pick(lang, ex.meaning, ex.meaningEn)}
                  </p>
                ) : null}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {pageCount > 1 ? (
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="grid size-8 place-items-center rounded-full border border-border/50 text-muted-foreground transition-colors hover:border-neon-cyan/60 hover:text-neon-cyan"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Página ${i + 1}`}
                onClick={() => {
                  setDir(i > clamped ? 1 : -1);
                  setPage(i);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === clamped ? "w-5 bg-neon-cyan" : "w-1.5 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="grid size-8 place-items-center rounded-full border border-border/50 text-muted-foreground transition-colors hover:border-neon-cyan/60 hover:text-neon-cyan"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Two-module learning card: Explicación | Ejemplos (Rodrigo: "separarlo en dos
// módulos, uno la explicación y otro los ejemplos + escucharlos"). Applies to
// every intro card in the app (kanji, vocabulario, gramática).
// ---------------------------------------------------------------------------

interface ExampleItem {
  jp: string;
  reading: string;
  meaning: string;
  meaningEn?: string;
}

/** Merge headline + note examples, dropping duplicates by Japanese text. */
function dedupeExamples(items: (ExampleItem | undefined | null)[]): ExampleItem[] {
  const seen = new Set<string>();
  const out: ExampleItem[] = [];
  for (const it of items) {
    if (!it || !it.jp || seen.has(it.jp)) continue;
    seen.add(it.jp);
    out.push(it);
  }
  return out;
}

/** Small header shared by both modules: JP glyph + eyebrow (kana + romaji). */
function ModuleHeader({
  jp,
  kana,
  romaji,
  label,
  accent = "cyan",
}: {
  jp: string;
  kana: string;
  romaji: string;
  label: string;
  accent?: "cyan" | "violet";
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "font-jp text-2xl font-bold",
          accent === "violet" ? "text-neon-violet" : "text-neon-cyan"
        )}
      >
        {jp}
      </span>
      <div className="leading-tight">
        <p
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.25em]",
            accent === "violet" ? "text-neon-violet" : "text-neon-cyan"
          )}
        >
          {label}
        </p>
        <JpReading jp={jp} kana={kana} romaji={romaji} className="mt-0.5 block" />
      </div>
    </div>
  );
}

/**
 * Right-hand module: the worked examples, shown one at a time in a carousel,
 * each with its own 🔊, plus a bilingual "Escuchar todos" to hear them in a row.
 */
function ExamplesModule({
  examples,
  why,
}: {
  examples: ExampleItem[];
  /** Optional "por qué se usa así" context shown above the examples. */
  why?: string;
}) {
  const t = useT();
  const lang = useLanguage((s) => s.lang);
  if (examples.length === 0) return null;
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl glass-strong p-6 sm:p-7">
      <span className="hud-corner right-3 top-3 border-r-2 border-t-2 border-neon-cyan/40" />
      <span className="hud-corner bottom-3 left-3 border-b-2 border-l-2 border-neon-cyan/40" />
      <ModuleHeader jp="例" kana="れい" romaji="rei" label={t("act.examples")} />
      <div className="mt-5 flex flex-1 flex-col">
        {why ? <WhyBox text={why} /> : null}
        {/* Center the carousel in the leftover height so the column isn't top-heavy.
            Each example has its own 🔊 (JaSpeakButton) — no "escuchar todos" that
            would break when you flip the page. */}
        <div className="flex flex-1 items-center">
          <div className="w-full">
            <ExampleCarousel items={examples} perPage={2} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Left-hand module: the teaching content (headline + explanation + deep dive). */
function ExplainModule({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl glass-strong p-6 sm:p-7">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="animate-scanline absolute left-0 h-10 w-full bg-gradient-to-b from-transparent via-neon-violet/[0.06] to-transparent" />
      </div>
      <span className="hud-corner left-3 top-3 border-l-2 border-t-2 border-neon-violet/40" />
      <span className="hud-corner bottom-3 right-3 border-b-2 border-r-2 border-neon-violet/40" />
      <div className="relative flex flex-1 flex-col">
        <ModuleHeader
          jp="説明"
          kana="せつめい"
          romaji="setsumei"
          label={t("act.explanation")}
          accent="violet"
        />
        <div className="mt-5 flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

/** Read words aloud: Japanese pronunciation, then meaning in `lang`. */
function wordSegments(items: KanjiWord[], lang: "es" | "en") {
  return items.flatMap((w) => [
    { text: w.jp, lang: "ja" as const },
    { text: lang === "en" ? w.meaningEn : w.meaning, lang },
  ]);
}

// Pick the Spanish or English variant of a note field for display.
type UiLang = "es" | "en";
const pick = (lang: UiLang, es: string, en?: string) =>
  lang === "en" ? en ?? es : es;
const pickArr = (lang: UiLang, es: string[], en?: string[]) =>
  lang === "en" ? en ?? es : es;

function BulletList({ items, tone = "cyan" }: { items: string[]; tone?: "cyan" | "warning" }) {
  return (
    <ul className="space-y-1.5">
      {items.map((c, i) => (
        <li key={i} className="flex gap-2 text-sm text-foreground/90">
          <span
            className={cn(
              "mt-1 size-1.5 shrink-0 rounded-full",
              tone === "warning" ? "bg-warning" : "bg-neon-cyan"
            )}
          />
          <span>{c}</span>
        </li>
      ))}
    </ul>
  );
}

/** An optional "En detalle" page built from a note's nuance field. */
function detailPage(
  t: TFn,
  lang: UiLang,
  nuance?: string,
  nuanceEn?: string
): DeepDivePage[] {
  if (!nuance) return [];
  return [
    {
      label: t("deepdive.detail"),
      speech: (l) => toMixedSegments(pick(l, nuance, nuanceEn), l),
      body: (
        <p className="text-sm leading-relaxed text-foreground/90">
          {pick(lang, nuance, nuanceEn)}
        </p>
      ),
    },
  ];
}

/** Turn an extended kanji note into paginated "A fondo" pages (bilingual audio). */
function kanjiPages(note: KanjiNote, t: TFn, lang: UiLang): DeepDivePage[] {
  return [
    {
      label: t("deepdive.howUsed"),
      speech: (l) => toMixedSegments(pick(l, note.usage, note.usageEn), l),
      body: (
        <p className="text-sm leading-relaxed text-foreground/90">
          {pick(lang, note.usage, note.usageEn)}
        </p>
      ),
    },
    {
      label: t("deepdive.howCombine"),
      speech: (l) =>
        pickArr(l, note.combos, note.combosEn).flatMap((c) => toMixedSegments(c, l)),
      body: <BulletList items={pickArr(lang, note.combos, note.combosEn)} />,
    },
    {
      label: t("deepdive.commonWords"),
      speech: (l) => [
        { text: l === "en" ? "Common words:" : "Palabras comunes:", lang: l },
        ...wordSegments(note.words, l),
      ],
      body: <WordChips items={note.words} lang={lang} />,
    },
    ...detailPage(t, lang, note.nuance, note.nuanceEn),
    {
      label: t("deepdive.realExamples"),
      speech: (l) => [
        { text: l === "en" ? "Examples:" : "Ejemplos:", lang: l },
        ...wordSegments(note.examples, l),
      ],
      body: (
        <div>
          <WhyBox text={pick(lang, note.usage, note.usageEn)} />
          <ExampleCarousel items={note.examples} lang={lang} />
        </div>
      ),
    },
  ];
}

/** Turn a grammar note into paginated "A fondo" pages (bilingual audio). */
function grammarPages(note: GrammarNote, t: TFn, lang: UiLang): DeepDivePage[] {
  return [
    {
      label: t("deepdive.why"),
      speech: (l) => toMixedSegments(pick(l, note.why, note.whyEn), l),
      body: (
        <p className="text-sm leading-relaxed text-foreground/90">
          {pick(lang, note.why, note.whyEn)}
        </p>
      ),
    },
    {
      label: t("deepdive.when"),
      speech: (l) =>
        pickArr(l, note.whenToUse, note.whenToUseEn).flatMap((c) =>
          toMixedSegments(c, l)
        ),
      body: <BulletList items={pickArr(lang, note.whenToUse, note.whenToUseEn)} />,
    },
    {
      label: t("deepdive.mistakes"),
      speech: (l) => [
        { text: l === "en" ? "Common mistakes:" : "Errores comunes:", lang: l },
        ...pickArr(l, note.mistakes, note.mistakesEn).flatMap((m) =>
          toMixedSegments(m, l)
        ),
      ],
      body: (
        <BulletList
          items={pickArr(lang, note.mistakes, note.mistakesEn)}
          tone="warning"
        />
      ),
    },
    ...detailPage(t, lang, note.nuance, note.nuanceEn),
    {
      label: t("deepdive.examples"),
      speech: (l) => [
        { text: l === "en" ? "Examples:" : "Ejemplos:", lang: l },
        ...note.examples.flatMap((e) => [
          { text: e.jp, lang: "ja" as const },
          { text: pick(l, e.meaning, e.meaningEn), lang: l },
        ]),
      ],
      body: (
        <div>
          <WhyBox text={pick(lang, note.why, note.whyEn)} />
          <ExampleCarousel items={note.examples} lang={lang} />
        </div>
      ),
    },
  ];
}

/** Turn a vocabulary note into paginated "A fondo" pages (bilingual audio). */
function vocabPages(note: VocabNote, t: TFn, lang: UiLang): DeepDivePage[] {
  return [
    {
      label: t("deepdive.howUsed"),
      speech: (l) => toMixedSegments(pick(l, note.usage, note.usageEn), l),
      body: (
        <p className="text-sm leading-relaxed text-foreground/90">
          {pick(lang, note.usage, note.usageEn)}
        </p>
      ),
    },
    {
      label: t("deepdive.usefulNotes"),
      speech: (l) =>
        pickArr(l, note.notes, note.notesEn).flatMap((n) => toMixedSegments(n, l)),
      body: <BulletList items={pickArr(lang, note.notes, note.notesEn)} />,
    },
    ...detailPage(t, lang, note.nuance, note.nuanceEn),
    {
      label: t("deepdive.realExamples"),
      speech: (l) => [
        { text: l === "en" ? "Examples:" : "Ejemplos:", lang: l },
        ...note.examples.flatMap((e) => [
          { text: e.jp, lang: "ja" as const },
          { text: pick(l, e.meaning, e.meaningEn), lang: l },
        ]),
      ],
      body: (
        <div>
          <WhyBox text={pick(lang, note.usage, note.usageEn)} />
          <ExampleCarousel items={note.examples} lang={lang} />
        </div>
      ),
    },
  ];
}

function IntroKanji({
  activity,
}: {
  activity: Extract<Activity, { kind: "intro_kanji" }>;
}) {
  const t = useT();
  const tc = useTc();
  const lang = useLanguage((s) => s.lang);
  const note = kanjiNoteFor(activity.kanjiChar);
  const examples = dedupeExamples([
    activity.example ?? null,
    ...(note?.examples ?? []),
  ]);
  // The examples live in the right-hand module, so drop those pages here.
  const exLabels = [t("deepdive.examples"), t("deepdive.realExamples")];
  const explainPages = note
    ? kanjiPages(note, t, lang).filter((p) => !exLabels.includes(p.label))
    : [];
  const hasExamples = examples.length > 0;
  return (
    <ActivityShell eyebrow={t("act.newKanji")} jp="新しい漢字" wide={hasExamples}>
      <div
        className={cn(
          "grid items-stretch gap-6",
          hasExamples && "lg:grid-cols-2"
        )}
      >
        {/* Módulo 1 — Explicación */}
        <ExplainModule>
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-primary via-neon-violet to-neon-cyan opacity-30 blur-2xl" />
              <span
                className="animate-holo-float relative font-jp text-[110px] leading-none text-primary"
                style={{
                  textShadow:
                    "0 0 22px color-mix(in oklch, var(--color-primary) 75%, transparent), 0 0 48px color-mix(in oklch, var(--color-neon-violet) 50%, transparent)",
                }}
              >
                {activity.kanjiChar}
              </span>
            </div>
            <p className="mt-4 font-display text-2xl font-bold tracking-tight">
              {tc(activity.meaning)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Toca 🔊 en cada lectura para oírla por separado.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ReadingBlock label="On'yomi (lectura china)" readings={activity.onyomi} />
            <ReadingBlock label="Kun'yomi (lectura japonesa)" readings={activity.kunyomi} />
          </div>

          {activity.note ? (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {activity.note}
            </p>
          ) : null}

          {explainPages.length ? (
            <DeepDive
              title={`El kanji ${activity.kanjiChar}`}
              jp={activity.kanjiChar}
              pages={explainPages}
            />
          ) : null}
        </ExplainModule>

        {/* Módulo 2 — Ejemplos */}
        {hasExamples ? (
          <ExamplesModule examples={examples} why={note?.usage} />
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
    <div className="relative rounded-xl border border-l-2 border-border/50 border-l-neon-cyan/60 bg-card/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/90">
          {label}
        </p>
        {readings.length > 0 ? (
          <JaSpeakButton
            text={readings.join("、")}
            aria-label={`Escuchar ${label}`}
          />
        ) : null}
      </div>
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
  const t = useT();
  const tc = useTc();
  const lang = useLanguage((s) => s.lang);
  const note = vocabNoteFor(activity.word);
  // Prefer the rich note examples; fall back to the single bare-string example.
  const examples = dedupeExamples(
    note?.examples?.length
      ? note.examples
      : activity.example
        ? [{ jp: activity.example, reading: "", meaning: "" }]
        : []
  );
  const exLabels = [t("deepdive.examples"), t("deepdive.realExamples")];
  const explainPages = note
    ? vocabPages(note, t, lang).filter((p) => !exLabels.includes(p.label))
    : [];
  const hasExamples = examples.length > 0;
  return (
    <ActivityShell eyebrow={t("act.newWord")} jp="新しい単語" wide={hasExamples}>
      <div
        className={cn(
          "grid items-stretch gap-6",
          hasExamples && "lg:grid-cols-2"
        )}
      >
        {/* Módulo 1 — Explicación */}
        <ExplainModule>
          <div className="relative space-y-3 text-center [perspective:900px]">
            {/* radial holo backdrop */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-4 size-48 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/25 via-neon-violet/15 to-transparent blur-3xl"
            />
            <p className="relative font-mono text-[10px] tracking-[0.4em] text-neon-cyan/80">
              {activity.reading}
            </p>
            {/* Holographic 3D word — the centerpiece */}
            <motion.h2
              initial={{ opacity: 0, rotateX: 25, y: 12 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{ duration: 0.6, ease: [0.21, 1.02, 0.73, 1] }}
              className="animate-holo-float relative font-jp text-6xl font-semibold tracking-tight text-primary [transform-style:preserve-3d]"
              style={{
                textShadow:
                  "0 0 24px color-mix(in oklch, var(--color-primary) 70%, transparent), 0 0 56px color-mix(in oklch, var(--color-neon-violet) 45%, transparent)",
              }}
            >
              {activity.word}
            </motion.h2>
            <RomajiLine reading={activity.reading} className="text-center" />
            <p className="font-display text-xl font-bold text-foreground/90">
              {tc(activity.meaning)}
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <AudioBar
              getSegments={(lang) => [
                { text: activity.word, lang: "ja" as const },
                ...toMixedSegments(
                  lang === "en"
                    ? `means ${activity.meaning}`
                    : `significa ${activity.meaning}`,
                  lang
                ),
              ]}
            />
          </div>

          {explainPages.length ? (
            <div className="text-left">
              <DeepDive
                title={`«${tc(activity.meaning)}»`}
                jp={activity.word}
                pages={explainPages}
              />
            </div>
          ) : null}
        </ExplainModule>

        {/* Módulo 2 — Ejemplos */}
        {hasExamples ? (
          <ExamplesModule examples={examples} why={note?.usage} />
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
  const t = useT();
  const tc = useTc();
  const lang = useLanguage((s) => s.lang);
  const note = grammarNoteFor(activity.pattern, activity.title);
  const examples = dedupeExamples([activity.example, ...(note?.examples ?? [])]);
  const exLabels = [t("deepdive.examples"), t("deepdive.realExamples")];
  const explainPages = note
    ? grammarPages(note, t, lang).filter((p) => !exLabels.includes(p.label))
    : [];
  const hasExamples = examples.length > 0;
  return (
    <ActivityShell eyebrow={t("act.newGrammar")} jp="新しい文法" wide={hasExamples}>
      <div
        className={cn(
          "grid items-stretch gap-6",
          hasExamples && "lg:grid-cols-2"
        )}
      >
        {/* Módulo 1 — Explicación */}
        <ExplainModule>
          <h2 className="font-display text-balance text-2xl font-extrabold tracking-tight">
            {tc(activity.title)}
          </h2>
          <div className="relative mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 font-jp text-base text-primary shadow-[0_0_24px_-8px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]">
            <span className="size-1.5 animate-pulse rounded-full bg-neon-cyan" />
            {activity.pattern}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {tc(activity.explanation)}
          </p>
          <div className="mt-4">
            <AudioBar
              getSegments={(lang) =>
                toMixedSegments(
                  `${activity.title}. ${activity.explanation}`,
                  lang
                )
              }
            />
          </div>

          {explainPages.length ? (
            <DeepDive title={note!.title} jp={note!.jp} pages={explainPages} />
          ) : null}
        </ExplainModule>

        {/* Módulo 2 — Ejemplos */}
        {hasExamples ? (
          <ExamplesModule examples={examples} why={note?.why} />
        ) : null}
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
  onLearn,
}: {
  activity: Extract<Activity, { kind: "quiz" }>;
  verified: boolean;
  onAnswer: (correct: boolean) => void;
  onLearn?: (target: string) => void;
}) {
  const t = useT();
  const tc = useTc();
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

  // Rotate the PRESENTATION so practice never feels like the same card twice.
  // Same question always renders the same way (stable), but different questions
  // get different looks: A/B/C list, a 2-col card grid, or a ✓/✗ true-false.
  const h = hashStr(activity.id);
  const canTrueFalse = Boolean(activity.promptJp) && shuffled.length >= 2;
  const styleName = canTrueFalse
    ? (["list", "grid", "truefalse"] as const)[h % 3]
    : (["list", "grid"] as const)[h % 2];

  // --- True/False: claim the prompt equals one option; is it true? ----------
  const tfClaim = shuffled[h % shuffled.length];
  const tfIsTrue = tfClaim?.isCorrect ?? false;
  const [tfPicked, setTfPicked] = useState<boolean | null>(null);

  const wrongForExplain =
    styleName === "truefalse"
      ? verified && tfPicked !== null && tfPicked !== tfIsTrue
      : verified && selectedShuffled !== null && selectedShuffled !== correctIndex;

  const explanation =
    verified && wrongForExplain && activity.explanation ? (
      <ExplanationCard
        correctAnswer={activity.options[activity.correctIndex]}
        explanation={tc(activity.explanation)}
        onLearn={onLearn}
        learnTarget={
          japaneseToken(activity.promptJp) ??
          japaneseToken(activity.options[activity.correctIndex])
        }
      />
    ) : null;

  const prompt = (
    <div className="text-center">
      {activity.promptJp ? (
        <p
          className="font-jp text-3xl leading-tight tracking-tight text-foreground"
          style={{
            textShadow:
              "0 0 24px color-mix(in oklch, var(--color-primary) 35%, transparent)",
          }}
        >
          {activity.promptJp}
        </p>
      ) : null}
      <p
        className={cn(
          "text-balance text-base text-foreground/85",
          activity.promptJp ? "mt-4" : ""
        )}
      >
        {tc(activity.prompt)}
      </p>
    </div>
  );

  // ---- TRUE / FALSE ---------------------------------------------------------
  if (styleName === "truefalse") {
    const pick = (val: boolean) => {
      if (verified) return;
      setTfPicked(val);
      onAnswer(val === tfIsTrue);
    };
    const btn = (val: boolean, label: string, Icon: typeof Check) => {
      const isPicked = tfPicked === val;
      const isRightChoice = val === tfIsTrue;
      return (
        <motion.button
          whileHover={!verified ? { y: -3 } : undefined}
          whileTap={!verified ? { scale: 0.97 } : undefined}
          disabled={verified}
          onClick={() => pick(val)}
          className={cn(
            "flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 px-6 py-6 text-lg font-semibold transition-all",
            "border-border/60 bg-card/50 hover:border-neon-amber/60 hover:bg-neon-amber/5",
            isPicked && !verified && "border-primary bg-primary/10 ring-1 ring-primary/40",
            verified && isRightChoice && "border-success bg-success/15 text-success",
            verified && isPicked && !isRightChoice && "border-destructive bg-destructive/15 text-destructive",
            verified && !isRightChoice && !isPicked && "opacity-40"
          )}
        >
          <Icon className="size-7" />
          {label}
        </motion.button>
      );
    };
    return (
      <ActivityShell eyebrow={t("act.trueFalse")} jp="正しい?">
        <HudPanel className="p-10">
          <p className="text-center text-sm text-muted-foreground">
            {t("act.isCorrect")}
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 rounded-2xl border border-neon-amber/30 bg-neon-amber/5 p-6 text-center"
          >
            <p className="font-jp text-3xl leading-tight">{activity.promptJp}</p>
            <p className="mt-2 text-xl font-semibold">
              = «{tc(tfClaim.text)}»
            </p>
          </motion.div>
          <div className="mt-7 flex gap-3">
            {btn(true, t("act.true"), Check)}
            {btn(false, t("act.false"), X)}
          </div>
          {explanation}
        </HudPanel>
      </ActivityShell>
    );
  }

  // ---- GRID (2-column cards) ------------------------------------------------
  if (styleName === "grid") {
    return (
      <ActivityShell eyebrow={t("act.choose")} jp="選ぶ">
        <HudPanel className="p-10">
          {prompt}
          <div className="mt-7 grid grid-cols-2 gap-3">
            {shuffled.map((opt, idx) => {
              const isPicked = selectedShuffled === idx;
              const romaji = romajiHint(opt.text);
              return (
                <motion.button
                  key={`${activity.id}-g-${idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  whileHover={!verified ? { y: -3 } : undefined}
                  whileTap={!verified ? { scale: 0.97 } : undefined}
                  disabled={verified}
                  onClick={() => {
                    setSelectedShuffled(idx);
                    onAnswer(opt.isCorrect);
                  }}
                  className={cn(
                    "relative flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-2xl border border-border/60 bg-card/50 p-4 text-center transition-all",
                    "hover:border-neon-violet/60 hover:bg-neon-violet/5 hover:shadow-[0_0_28px_-10px_color-mix(in_oklch,var(--color-neon-violet)_70%,transparent)]",
                    isPicked && !verified && "border-primary bg-primary/10 ring-1 ring-primary/40",
                    verified && opt.isCorrect && "border-success bg-success/15 text-success",
                    verified && isPicked && !opt.isCorrect && "border-destructive bg-destructive/15 text-destructive",
                    verified && !opt.isCorrect && !isPicked && "opacity-40"
                  )}
                >
                  <div className="font-jp text-lg">{tc(opt.text)}</div>
                  {romaji ? (
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {romaji}
                    </div>
                  ) : null}
                </motion.button>
              );
            })}
          </div>
          {explanation}
        </HudPanel>
      </ActivityShell>
    );
  }

  // ---- LIST (A/B/C) — default ----------------------------------------------
  return (
    <ActivityShell eyebrow={t("act.question")} jp="質問">
      <HudPanel className="p-10">
        {prompt}
        <div className="mt-7 grid gap-3">
          {shuffled.map((opt, idx) => {
            const isPicked = selectedShuffled === idx;
            const romaji = romajiHint(opt.text);
            return (
              <motion.button
                key={`${activity.id}-${idx}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                whileHover={!verified ? { x: 4 } : undefined}
                whileTap={!verified ? { scale: 0.99 } : undefined}
                disabled={verified}
                onClick={() => {
                  setSelectedShuffled(idx);
                  onAnswer(opt.isCorrect);
                }}
                className={cn(
                  "group relative flex items-center gap-4 overflow-hidden rounded-xl border border-border/60 bg-card/50 px-5 py-3.5 text-left transition-all",
                  "hover:border-neon-cyan/50 hover:bg-accent/20 hover:shadow-[0_0_24px_-10px_color-mix(in_oklch,var(--color-neon-cyan)_70%,transparent)]",
                  isPicked &&
                    !verified &&
                    "border-primary bg-primary/10 ring-1 ring-primary/40",
                  verified && opt.isCorrect && "border-success bg-success/15 text-success",
                  verified && isPicked && !opt.isCorrect && "border-destructive bg-destructive/15 text-destructive",
                  verified && !opt.isCorrect && !isPicked && "opacity-50"
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 font-mono text-[11px] text-muted-foreground transition-colors",
                    "group-hover:border-neon-cyan/60 group-hover:text-neon-cyan",
                    isPicked && !verified && "border-primary/60 text-primary"
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <div className="min-w-0">
                  <div className="font-jp text-base">{tc(opt.text)}</div>
                  {romaji ? (
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {romaji}
                    </div>
                  ) : null}
                </div>
              </motion.button>
            );
          })}
        </div>
        {explanation}
      </HudPanel>
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
  onLearn,
}: {
  activity: Extract<Activity, { kind: "listening" }>;
  verified: boolean;
  onAnswer: (correct: boolean) => void;
  onLearn?: (target: string) => void;
}) {
  const t = useT();
  const tc = useTc();
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
    <ActivityShell eyebrow={t("act.listening")} jp="聴解">
      <HudPanel glow className="p-10 text-center">
        <div className="relative mx-auto flex size-24 items-center justify-center">
          {/* Pulsing concentric rings — alive while playing */}
          {play.isPending ? (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-neon-cyan/30" />
              <span className="absolute -inset-3 animate-pulse rounded-full border border-neon-cyan/40" />
            </>
          ) : null}
          <span className="absolute -inset-2 rounded-full border border-primary/20" />
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
          </button>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan/80">
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
      </HudPanel>

      <div className="rounded-3xl glass p-6">
        <p className="text-base font-semibold">{tc(activity.prompt)}</p>
        <div className="mt-4 grid gap-3">
          {shuffled.map((opt, idx) => {
            const isPicked = selectedShuffled === idx;
            const romaji = romajiHint(opt.text);
            return (
              <motion.button
                key={`${activity.id}-${idx}`}
                whileHover={!verified ? { x: 4 } : undefined}
                whileTap={!verified ? { scale: 0.99 } : undefined}
                disabled={verified}
                onClick={() => {
                  setSelectedShuffled(idx);
                  onAnswer(opt.isCorrect);
                }}
                className={cn(
                  "group flex items-center gap-4 rounded-xl border border-border/60 bg-card/50 px-5 py-3.5 text-left transition-all",
                  "hover:border-neon-cyan/50 hover:bg-accent/20 hover:shadow-[0_0_24px_-10px_color-mix(in_oklch,var(--color-neon-cyan)_70%,transparent)]",
                  isPicked &&
                    !verified &&
                    "border-primary bg-primary/10 ring-1 ring-primary/40",
                  verified && opt.isCorrect && "border-success bg-success/15 text-success",
                  verified && isPicked && !opt.isCorrect && "border-destructive bg-destructive/15 text-destructive",
                  verified && !opt.isCorrect && !isPicked && "opacity-50"
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 font-mono text-[11px] text-muted-foreground transition-colors",
                    "group-hover:border-neon-cyan/60 group-hover:text-neon-cyan",
                    isPicked && !verified && "border-primary/60 text-primary"
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <div className="min-w-0">
                  <div className="text-sm">{tc(opt.text)}</div>
                  {romaji ? (
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {romaji}
                    </div>
                  ) : null}
                </div>
              </motion.button>
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
            explanation={tc(activity.explanation)}
            onLearn={onLearn}
            learnTarget={
              japaneseToken(activity.textJp) ??
              japaneseToken(activity.options[activity.correctIndex])
            }
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
  const t = useT();
  const tc = useTc();
  const play = usePlayTts();
  const rec = useVoiceRecorder();

  return (
    <ActivityShell eyebrow={t("act.speaking")} jp="話してみよう">
      <HudPanel glow className="p-10 text-center">
        <p className="font-mono text-[10px] tracking-[0.4em] text-neon-cyan/80">
          {activity.reading}
        </p>
        <p
          className="mt-3 font-jp text-3xl leading-tight text-foreground"
          style={{
            textShadow:
              "0 0 22px color-mix(in oklch, var(--color-primary) 45%, transparent)",
          }}
        >
          {activity.textJp}
        </p>
        <RomajiLine reading={activity.reading} className="mt-1 text-center" />
        <p className="mt-2 text-sm text-muted-foreground">{tc(activity.meaning)}</p>
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
      </HudPanel>

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
  const t = useT();
  const tc = useTc();
  const [progress, setProgress] = useState<StrokeProgress>({
    hasData: true,
    passed: false,
    mistakes: 0,
  });
  return (
    <ActivityShell eyebrow={t("act.writeKanji")} jp="書いてみよう">
      <HudPanel glow className="p-8">
        <div className="text-center">
          <p
            className="animate-holo-float font-jp text-5xl leading-none text-primary"
            style={{
              textShadow:
                "0 0 20px color-mix(in oklch, var(--color-primary) 60%, transparent), 0 0 44px color-mix(in oklch, var(--color-neon-violet) 40%, transparent)",
            }}
          >
            {activity.kanjiChar}
          </p>
          <p className="mt-3 font-display text-sm font-bold">{tc(activity.meaning)}</p>
          <p className="font-jp text-xs text-muted-foreground">
            {activity.reading}
          </p>
          <RomajiLine reading={activity.reading} className="text-center" />
        </div>

        <div className="mt-6 flex justify-center">
          <StrokeTrainer
            char={activity.kanjiChar}
            size={240}
            onProgress={(p) => {
              setProgress(p);
              // Record the practice (harmless for this non-graded step); the
              // learner advances with the floating "Continuar" button — no
              // second in-card button (Rodrigo #5).
              if (p.passed) onComplete();
            }}
          />
        </div>

        {activity.note ? (
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-accent/30 p-4 text-sm text-muted-foreground">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>{activity.note}</span>
          </p>
        ) : null}

        {progress.passed ? (
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-sm font-medium text-success">
            <Check className="size-4" /> ¡Kanji practicado! Pulsa «Continuar».
          </p>
        ) : progress.hasData ? (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Pulsa <span className="font-medium text-foreground">Practicar</span> para
            escribir el kanji trazo por trazo. Cuando termines, pulsa
            «Continuar».
          </p>
        ) : null}
      </HudPanel>
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
  const t = useT();
  const tc = useTc();
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
    <ActivityShell eyebrow={t("act.writeSentence")} jp="文を書いてみよう">
      <HudPanel className="p-8">
       <div className="space-y-5">
        <div>
          <p className="text-base text-foreground">{tc(activity.prompt)}</p>
          {activity.hint ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3" />
              {t("act.hint")}: {tc(activity.hint)}
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
      </HudPanel>
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// 8b. Order the sentence (tap tiles into order) — a new, active format.
// ---------------------------------------------------------------------------

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function OrderSentenceActivity({
  activity,
  verified,
  onAnswer,
}: {
  activity: Extract<Activity, { kind: "order_sentence" }>;
  verified: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  const t = useT();
  const tc = useTc();
  // The bank includes the correct tiles PLUS any decoys (harder variant). The
  // puzzle is "done" once you've placed as many tiles as the correct sentence
  // has — so placing a decoy just makes the answer wrong.
  const correctCount = activity.tokens.length;
  const hasDecoys = (activity.decoys?.length ?? 0) > 0;
  const tiles = useMemo(
    () =>
      shuffleArray([
        ...activity.tokens.map((text, i) => ({ id: i, text })),
        ...(activity.decoys ?? []).map((text, i) => ({
          id: activity.tokens.length + i,
          text,
        })),
      ]),
    [activity]
  );
  const target = activity.tokens.join("");
  const [placed, setPlaced] = useState<number[]>([]);
  const placedSet = new Set(placed);
  const built = placed.map((id) => tiles.find((t) => t.id === id)!.text).join("");
  const isComplete = placed.length === correctCount;
  const isCorrect = isComplete && built === target;

  const add = (id: number) => {
    if (verified) return;
    const next = [...placed, id];
    setPlaced(next);
    if (next.length === correctCount) {
      const s = next.map((i) => tiles.find((t) => t.id === i)!.text).join("");
      onAnswer(s === target);
    }
  };
  const removeAt = (pos: number) => {
    if (verified) return;
    setPlaced(placed.filter((_, i) => i !== pos));
  };

  return (
    <ActivityShell eyebrow={t("act.orderSentence")} jp="文をならべよう">
      <HudPanel className="p-8">
        <p className="text-center text-sm text-muted-foreground">
          {t("act.orderPrompt")}
        </p>
        <p className="mt-1 text-center text-lg font-semibold">«{tc(activity.meaning)}»</p>
        {hasDecoys ? (
          <p className="mt-1 text-center text-[11px] text-neon-amber/80">
            {t("act.orderDecoys")}
          </p>
        ) : null}

        {/* Answer row */}
        <div
          className={cn(
            "mt-5 flex min-h-[3.75rem] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors",
            verified && isCorrect && "border-success/50 bg-success/5",
            verified && !isCorrect && "border-destructive/50 bg-destructive/5",
            !verified && "border-border/50 bg-card/30"
          )}
        >
          {placed.length === 0 ? (
            <span className="px-2 text-sm text-muted-foreground/60">
              {t("act.orderYours")}
            </span>
          ) : (
            placed.map((id, pos) => (
              <button
                key={`${id}-${pos}`}
                onClick={() => removeAt(pos)}
                disabled={verified}
                className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 font-jp text-lg text-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10"
              >
                {tiles.find((t) => t.id === id)!.text}
              </button>
            ))
          )}
        </div>

        {/* Available tiles */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {tiles.map((t) => (
            <motion.button
              key={t.id}
              layout
              whileTap={!verified ? { scale: 0.94 } : undefined}
              onClick={() => add(t.id)}
              disabled={verified || placedSet.has(t.id)}
              className={cn(
                "rounded-xl border border-neon-cyan/40 bg-card/60 px-4 py-2.5 font-jp text-lg transition-all hover:border-neon-cyan hover:bg-neon-cyan/10",
                placedSet.has(t.id) && "pointer-events-none opacity-25"
              )}
            >
              {t.text}
            </motion.button>
          ))}
        </div>

        {verified ? (
          <div className="mt-6 space-y-3">
            <div
              className={cn(
                "rounded-xl border p-3 text-sm font-medium",
                isCorrect
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              )}
            >
              {isCorrect ? t("act.orderCorrect") : t("act.orderWrong")}
            </div>
            <div className="rounded-xl border border-success/30 bg-success/5 p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-success">
                {t("act.correctVersion")}
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <p className="font-jp text-xl">{target}</p>
                <JaSpeakButton text={target} aria-label={`Escuchar ${target}`} />
              </div>
              {activity.reading ? (
                <p className="mt-1 font-jp text-xs text-muted-foreground">
                  {activity.reading}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </HudPanel>
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// 8c. Match pairs (tap Japanese ↔ meaning) — a new, active format.
// ---------------------------------------------------------------------------

function MatchPairsActivity({
  activity,
  verified,
  onAnswer,
}: {
  activity: Extract<Activity, { kind: "match_pairs" }>;
  verified: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  const t = useT();
  const tc = useTc();
  const left = useMemo(
    () => shuffleArray(activity.pairs.map((p, i) => ({ i, text: p.jp }))),
    [activity]
  );
  const right = useMemo(
    () => shuffleArray(activity.pairs.map((p, i) => ({ i, text: tc(p.meaning) }))),
    [activity, tc]
  );
  const [selJp, setSelJp] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const pickJp = (i: number) => {
    if (verified || matched.has(i)) return;
    setSelJp(i);
    setWrongPair(null);
  };
  const pickMeaning = (i: number) => {
    if (verified || matched.has(i) || selJp === null) return;
    if (selJp === i) {
      const next = new Set(matched).add(i);
      setMatched(next);
      setSelJp(null);
      if (next.size === activity.pairs.length) onAnswer(mistakes === 0);
    } else {
      setWrongPair([selJp, i]);
      setMistakes((m) => m + 1);
      setSelJp(null);
    }
  };

  const cell = (
    side: "jp" | "meaning",
    i: number,
    text: string
  ) => {
    const isMatched = matched.has(i);
    const isSel = side === "jp" && selJp === i;
    const isWrong = wrongPair !== null && wrongPair[side === "jp" ? 0 : 1] === i;
    return (
      <motion.button
        key={`${side}-${i}`}
        animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.35 }}
        onClick={() => (side === "jp" ? pickJp(i) : pickMeaning(i))}
        disabled={verified || isMatched}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-center transition-all",
          side === "jp" ? "font-jp text-lg" : "text-sm",
          isMatched && "border-success/50 bg-success/10 text-success opacity-70",
          !isMatched && isSel && "border-primary bg-primary/15 ring-1 ring-primary/40",
          !isMatched && !isSel && "border-border/60 bg-card/50 hover:border-neon-violet/60 hover:bg-neon-violet/5"
        )}
      >
        {text}
      </motion.button>
    );
  };

  return (
    <ActivityShell eyebrow={t("act.matchPairs")} jp="えらんでつなぐ">
      <HudPanel className="p-8">
        <p className="text-center text-sm text-muted-foreground">{activity.prompt}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {left.map((l) => cell("jp", l.i, l.text))}
          </div>
          <div className="space-y-2">
            {right.map((r) => cell("meaning", r.i, r.text))}
          </div>
        </div>
        {verified ? (
          <div
            className={cn(
              "mt-5 rounded-xl border p-3 text-center text-sm font-medium",
              mistakes === 0
                ? "border-success/40 bg-success/10 text-success"
                : "border-warning/40 bg-warning/10 text-warning"
            )}
          >
            {mistakes === 0
              ? "¡Todos correctos a la primera! 🎉"
              : `Emparejados — con ${mistakes} intento${mistakes === 1 ? "" : "s"} fallido${mistakes === 1 ? "" : "s"}.`}
          </div>
        ) : null}
      </HudPanel>
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
  const t = useT();
  const tc = useTc();
  return (
    <ActivityShell eyebrow={t("act.complete")} jp="お疲れさま">
      <HudPanel glow className="p-10">
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="relative inline-flex size-20 items-center justify-center"
          >
            <span className="absolute -inset-3 animate-ping rounded-full bg-warning/20" />
            <span className="absolute -inset-2 animate-pulse rounded-full border border-warning/40" />
            <div className="animate-holo-float relative inline-flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-warning via-streak to-neon-pink text-warning-foreground shadow-[0_0_40px_-6px_color-mix(in_oklch,var(--color-warning)_70%,transparent)]">
              <Trophy className="size-9" />
              <span className="absolute inset-0 rounded-full ring-1 ring-white/40" />
            </div>
          </motion.div>
        </div>
        <h2 className="mt-5 text-center font-display text-2xl font-extrabold">¡Bien hecho!</h2>
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
              <span>{tc(item)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-primary">
          <Sparkles className="size-3.5" />
          Vas a ganar XP al confirmar
        </p>
      </HudPanel>
    </ActivityShell>
  );
}

// ---------------------------------------------------------------------------
// Shared explanation card
// ---------------------------------------------------------------------------

/** Returns the string if it contains Japanese (kana/kanji), else undefined. */
function japaneseToken(s?: string | null): string | undefined {
  return s && /[぀-ヿ㐀-鿿]/.test(s) ? s : undefined;
}

function ExplanationCard({
  correctAnswer,
  explanation,
  onLearn,
  learnTarget,
}: {
  correctAnswer: string;
  explanation: string;
  onLearn?: (target: string) => void;
  /** The Japanese kanji/word to review (may differ from the answer, e.g. when
   *  the answer is a Spanish meaning and the kanji is in the prompt). */
  learnTarget?: string;
}) {
  const target = learnTarget ?? japaneseToken(correctAnswer);
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
      {onLearn && target ? (
        <button
          onClick={() => onLearn(target)}
          className="mt-1 inline-flex items-center gap-2 rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-2 text-xs font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/15"
        >
          <GraduationCap className="size-4" />
          Ir a la lección de {target}
          <ArrowRight className="size-3.5" />
        </button>
      ) : null}
    </motion.div>
  );
}

export { ActivityShell };
