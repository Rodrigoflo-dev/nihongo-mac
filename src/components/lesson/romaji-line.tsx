import { toRomaji } from "wanakana";

import { cn } from "@/lib/utils";

/**
 * Renders the rōmaji pronunciation for a kana reading, on its own line.
 *
 * Used under the kana reading of a Japanese sentence/word so learners always
 * see: 日本語 → kana → rōmaji → meaning. The kana in our content has no word
 * boundaries, so the rōmaji is a continuous pronunciation guide (still correct).
 */
export function RomajiLine({
  reading,
  className,
}: {
  reading?: string | null;
  className?: string;
}) {
  if (!reading) return null;
  let romaji = "";
  try {
    romaji = toRomaji(reading);
  } catch {
    return null;
  }
  if (!romaji || romaji === reading) return null;
  return (
    <p className={cn("font-mono text-[11px] lowercase text-muted-foreground/70", className)}>
      {romaji}
    </p>
  );
}
