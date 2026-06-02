/**
 * Mini-game catalog + deterministic daily/weekly rotation.
 *
 * The "Featured" picks are deterministic by date so every play of the app on
 * the same day yields the same featured game (matches user expectation of
 * "el juego del día").
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface MinigameDef {
  key: string;
  title: string;
  jp: string;
  description: string;
  difficulties: Difficulty[];
  path: string;
  icon: "sparkles" | "zap" | "puzzle" | "headphones";
  tone: string;
}

export const MINIGAMES: MinigameDef[] = [
  {
    key: "kanji_match",
    title: "Kanji Match",
    jp: "漢字あわせ",
    description:
      "Memoriza pares de kanji y su significado. Más pares en dificultad alta.",
    difficulties: ["easy", "medium", "hard"],
    path: "/play/kanji-match",
    icon: "sparkles",
    tone: "from-primary/40 to-neon-violet/20 ring-primary/30",
  },
  {
    key: "hiragana_speed",
    title: "Hiragana Speed",
    jp: "ひらがな早撃ち",
    description:
      "Time attack. Identifica el romaji del hiragana que aparece.",
    difficulties: ["easy", "medium", "hard"],
    path: "/play/hiragana-speed",
    icon: "zap",
    tone: "from-warning/40 to-streak/20 ring-warning/30",
  },
];

/** Days since epoch — deterministic per local calendar day */
function dayIndex(): number {
  const now = new Date();
  const utc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(utc / 86_400_000);
}

/** Weeks since epoch — same idea but per ISO week */
function weekIndex(): number {
  return Math.floor(dayIndex() / 7);
}

export function dailyFeatured(): MinigameDef {
  return MINIGAMES[dayIndex() % MINIGAMES.length];
}

export function weeklyFeatured(): MinigameDef {
  return MINIGAMES[(weekIndex() + 1) % MINIGAMES.length];
}

export function isDailyFeatured(key: string): boolean {
  return dailyFeatured().key === key;
}

export function isWeeklyFeatured(key: string): boolean {
  return weeklyFeatured().key === key;
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Normal",
  hard: "Difícil",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "text-success",
  medium: "text-primary",
  hard: "text-streak",
};

// ---------------------------------------------------------------------------
// Per-game difficulty configs (consumed by each game page)
// ---------------------------------------------------------------------------

export const KANJI_MATCH_CONFIG = {
  easy: {
    pairs: 6,
    targetMoves: 6,
    xpMultiplier: 0.8,
    label: "6 pares",
  },
  medium: {
    pairs: 8,
    targetMoves: 8,
    xpMultiplier: 1.0,
    label: "8 pares",
  },
  hard: {
    pairs: 12,
    targetMoves: 12,
    xpMultiplier: 1.5,
    label: "12 pares · más kanji",
  },
} as const;

export const HIRAGANA_SPEED_CONFIG = {
  easy: {
    seconds: 45,
    includeDakuten: false,
    includeYouon: false,
    label: "45s · básico",
  },
  medium: {
    seconds: 30,
    includeDakuten: true,
    includeYouon: false,
    label: "30s · con dakuten",
  },
  hard: {
    seconds: 25,
    includeDakuten: true,
    includeYouon: true,
    label: "25s · completo",
  },
} as const;

/**
 * Generic XP/star reward modifier for a given difficulty. The backend already
 * tracks raw score and awards XP per-game — these constants are surfaced in
 * the UI as estimated rewards for the difficulty toggle.
 */
export function difficultyBonusPercent(d: Difficulty): number {
  return d === "easy" ? -20 : d === "medium" ? 0 : 50;
}
