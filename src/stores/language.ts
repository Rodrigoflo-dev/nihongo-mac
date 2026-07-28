import { create } from "zustand";

import type { NarrationLang } from "@/lib/tts";

/**
 * App language preference: besides Japanese, everything spoken/explained is in
 * Spanish OR English. The learner picks it during onboarding and can change it
 * in Ajustes; "system" follows the OS language. Stored on-device (localStorage).
 *
 * Today this drives the narration language (the «Escuchar» audio) so we could
 * drop the per-card Español/English toggle. UI-string localization can hook into
 * the same `lang` value later.
 */
export type LangMode = "system" | "es" | "en";

const KEY = "michi-lang-mode";

function systemLang(): NarrationLang {
  const l = (navigator.language || "es").toLowerCase();
  return l.startsWith("es") ? "es" : "en";
}

function resolve(mode: LangMode): NarrationLang {
  return mode === "system" ? systemLang() : mode;
}

interface LanguageState {
  /** What the user chose: a fixed language or "follow the system". */
  mode: LangMode;
  /** The resolved narration language (never "system"). */
  lang: NarrationLang;
  setMode: (mode: LangMode) => void;
}

const initialMode = ((): LangMode => {
  const stored = localStorage.getItem(KEY);
  return stored === "es" || stored === "en" || stored === "system"
    ? stored
    : "system";
})();

export const useLanguage = create<LanguageState>((set) => ({
  mode: initialMode,
  lang: resolve(initialMode),
  setMode: (mode) => {
    localStorage.setItem(KEY, mode);
    set({ mode, lang: resolve(mode) });
  },
}));

/** Non-reactive read for helpers that aren't React components. */
export function currentNarrationLang(): NarrationLang {
  return useLanguage.getState().lang;
}
