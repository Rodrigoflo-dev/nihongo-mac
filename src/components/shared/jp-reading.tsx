import { cn } from "@/lib/utils";

/**
 * Bilingual gloss: a Japanese word + its reading (kana) + pronunciation
 * (romaji), shown as a subtle secondary line beside/under a Spanish label. Used
 * across the app so every término teaches how it's written AND how it sounds.
 *
 *   <JpReading jp="時間" kana="じかん" romaji="jikan" />  →  時間 · じかん · jikan
 *
 * When the word is already pure kana/katakana (e.g. アバター), omit `kana` and it
 * simply shows  アバター · abatā  without repeating the reading.
 */
export function JpReading({
  jp,
  kana,
  romaji,
  className,
}: {
  jp: string;
  /** Hiragana/furigana reading. Omit when `jp` is itself kana. */
  kana?: string;
  romaji: string;
  className?: string;
}) {
  const showKana = kana && kana !== jp;
  return (
    <span
      className={cn(
        "font-jp text-[10px] font-normal leading-none tracking-wide text-muted-foreground/70",
        className
      )}
    >
      {jp}
      {showKana ? (
        <span className="text-muted-foreground/60"> · {kana}</span>
      ) : null}
      <span className="text-muted-foreground/45"> · {romaji}</span>
    </span>
  );
}
