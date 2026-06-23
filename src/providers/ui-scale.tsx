import * as React from "react";

/**
 * Accessibility "lupa" — a global UI zoom. Because Tailwind sizes text AND
 * spacing in rem, scaling the root font-size enlarges fonts and boxes together.
 * The chosen scale is written to `--ui-scale` on <html> (see index.css) and
 * persisted so it survives restarts.
 */
export type UiScale = 0.9 | 1 | 1.15 | 1.3 | 1.5;

export const UI_SCALE_OPTIONS: { value: UiScale; label: string; hint: string }[] = [
  { value: 0.9, label: "Compacto", hint: "Más contenido en pantalla" },
  { value: 1, label: "Normal", hint: "Tamaño estándar" },
  { value: 1.15, label: "Grande", hint: "Un poco más grande" },
  { value: 1.3, label: "Más grande", hint: "Cómodo de leer" },
  { value: 1.5, label: "Máximo", hint: "Letra y cuadros XL" },
];

const STORAGE_KEY = "nihongo-ui-scale";
const MIN: UiScale = 0.9;
const MAX: UiScale = 1.5;

interface UiScaleState {
  scale: UiScale;
  setScale: (s: UiScale) => void;
  /** Step up/down through the preset options (for a quick +/- lupa control). */
  increase: () => void;
  decrease: () => void;
}

const UiScaleContext = React.createContext<UiScaleState | undefined>(undefined);

function readStored(): UiScale {
  if (typeof window === "undefined") return 1;
  const raw = Number(localStorage.getItem(STORAGE_KEY));
  const allowed = UI_SCALE_OPTIONS.map((o) => o.value) as number[];
  return (allowed.includes(raw) ? raw : 1) as UiScale;
}

function apply(scale: UiScale) {
  document.documentElement.style.setProperty("--ui-scale", String(scale));
}

export function UiScaleProvider({ children }: { children: React.ReactNode }) {
  const [scale, setScaleState] = React.useState<UiScale>(() => readStored());

  React.useEffect(() => {
    apply(scale);
    localStorage.setItem(STORAGE_KEY, String(scale));
  }, [scale]);

  const setScale = React.useCallback((s: UiScale) => {
    const clamped = Math.min(MAX, Math.max(MIN, s)) as UiScale;
    setScaleState(clamped);
  }, []);

  const stepBy = React.useCallback((dir: 1 | -1) => {
    setScaleState((cur) => {
      const values = UI_SCALE_OPTIONS.map((o) => o.value);
      const idx = values.indexOf(cur);
      const nextIdx = Math.min(values.length - 1, Math.max(0, idx + dir));
      return values[nextIdx];
    });
  }, []);

  const value = React.useMemo<UiScaleState>(
    () => ({
      scale,
      setScale,
      increase: () => stepBy(1),
      decrease: () => stepBy(-1),
    }),
    [scale, setScale, stepBy]
  );

  return (
    <UiScaleContext.Provider value={value}>{children}</UiScaleContext.Provider>
  );
}

export function useUiScale(): UiScaleState {
  const ctx = React.useContext(UiScaleContext);
  if (!ctx) throw new Error("useUiScale must be used within UiScaleProvider");
  return ctx;
}
