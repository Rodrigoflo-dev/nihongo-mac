import * as React from "react";

/**
 * Unlockable app accent themes (Tienda). The chosen accent is written to
 * `data-accent` on <html> (see index.css palettes) and persisted. Some accents
 * are free; others must be bought with stars (ownership is checked against the
 * rewards backend in the store page). Equipping is purely cosmetic + local.
 */
export type Accent = "aether" | "matcha" | "sunset" | "sakura" | "koi" | "sumi";

export interface AccentDef {
  key: Accent;
  label: string;
  jp: string;
  /** swatch gradient (tailwind classes) for the store card. */
  swatch: string;
  /** reward key that can be BOUGHT to unlock, or null if it's the base theme. */
  requires: string | null;
  /** alternatively unlocks for free at this player level (learning path). */
  unlockLevel: number;
  /** short description of the theme's vibe / effect. */
  fx: string;
}

// Every theme except the base Aether starts LOCKED. Unlock by BUYING it with
// your coins OR by reaching its level (which you do by learning) — whichever
// comes first. Each has its own ambient animation (see AccentFX).
export const ACCENTS: AccentDef[] = [
  { key: "aether", label: "Aether", jp: "標準", swatch: "from-neon-violet to-neon-cyan", requires: null, unlockLevel: 1, fx: "Chispas neón" },
  { key: "matcha", label: "Matcha", jp: "抹茶", swatch: "from-green-400 to-emerald-300", requires: "theme_matcha", unlockLevel: 8, fx: "Hojas de té flotando" },
  { key: "sunset", label: "Atardecer", jp: "夕焼け", swatch: "from-amber-400 to-orange-300", requires: "theme_sunset", unlockLevel: 15, fx: "Rayos cálidos y motas doradas" },
  { key: "sakura", label: "Sakura", jp: "桜", swatch: "from-pink-400 to-rose-300", requires: "theme_sakura", unlockLevel: 22, fx: "Pétalos de cerezo cayendo" },
  { key: "koi", label: "Koi", jp: "鯉", swatch: "from-red-500 to-orange-400", requires: "theme_koi", unlockLevel: 30, fx: "Burbujas acuáticas" },
  { key: "sumi", label: "Sumi-e", jp: "墨絵", swatch: "from-slate-400 to-slate-300", requires: "theme_sumi", unlockLevel: 40, fx: "Manchas de tinta" },
];

const STORAGE_KEY = "nihongo-accent";

interface AccentState {
  accent: Accent;
  setAccent: (a: Accent) => void;
}

const AccentContext = React.createContext<AccentState | undefined>(undefined);

function readStored(): Accent {
  if (typeof window === "undefined") return "aether";
  const raw = localStorage.getItem(STORAGE_KEY) as Accent | null;
  return ACCENTS.some((a) => a.key === raw) ? (raw as Accent) : "aether";
}

function apply(accent: Accent) {
  const el = document.documentElement;
  if (accent === "aether") el.removeAttribute("data-accent");
  else el.setAttribute("data-accent", accent);
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = React.useState<Accent>(() => readStored());

  React.useEffect(() => {
    apply(accent);
    localStorage.setItem(STORAGE_KEY, accent);
  }, [accent]);

  const value = React.useMemo<AccentState>(
    () => ({ accent, setAccent: setAccentState }),
    [accent]
  );

  return (
    <AccentContext.Provider value={value}>{children}</AccentContext.Provider>
  );
}

export function useAccent(): AccentState {
  const ctx = React.useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used within AccentProvider");
  return ctx;
}
