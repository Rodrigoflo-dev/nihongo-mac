import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import HanziWriter from "hanzi-writer";
import { Check, Eraser, PlayCircle, RotateCcw, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { speakJapanese } from "@/lib/tts";
import { cn } from "@/lib/utils";

/**
 * Kanji stroke trainer: animated stroke order + interactive writing practice
 * with per-stroke validation, powered by hanzi-writer using stroke data bundled
 * offline under /public/kanji-data (see scripts/bundle-kanji-data.mjs).
 *
 * If a kanji has no stroke data, falls back to a "trace mode" — the glyph is
 * shown faded and the user free-draws over it on a canvas.
 */
export interface StrokeProgress {
  /** Whether real stroke-order data exists (false → trace fallback). */
  hasData: boolean;
  /** Whether the learner completed the writing quiz. */
  passed: boolean;
  /** Stroke mistakes made during the quiz. */
  mistakes: number;
}

export function StrokeTrainer({
  char,
  size = 240,
  onProgress,
}: {
  char: string;
  size?: number;
  onProgress?: (s: StrokeProgress) => void;
}) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "nodata">("loading");
  const [quizActive, setQuizActive] = useState(false);
  const [quizResult, setQuizResult] = useState<null | "passed">(null);
  const [mistakes, setMistakes] = useState(0);

  // Keep onProgress in a ref so the writer effect doesn't re-run on each render.
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;

  useEffect(() => {
    setStatus("loading");
    setQuizActive(false);
    setQuizResult(null);
    setMistakes(0);
    const el = targetRef.current;
    if (!el) return;
    el.innerHTML = "";

    let cancelled = false;
    const writer = HanziWriter.create(el, char, {
      width: size,
      height: size,
      padding: 8,
      showCharacter: false,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 180,
      strokeColor: "#a78bfa",
      outlineColor: "#3f3f53",
      drawingColor: "#22d3ee",
      radicalColor: "#38bdf8",
      charDataLoader: (c, onComplete) => {
        fetch(`/kanji-data/${encodeURIComponent(c)}.json`)
          .then((r) => {
            if (!r.ok) throw new Error(`no data (${r.status})`);
            return r.json();
          })
          .then((d) => {
            if (!cancelled) onComplete(d);
          })
          .catch(() => {
            if (!cancelled) {
              setStatus("nodata");
              progressRef.current?.({ hasData: false, passed: false, mistakes: 0 });
            }
          });
      },
      onLoadCharDataError: () => {
        if (!cancelled) {
          setStatus("nodata");
          progressRef.current?.({ hasData: false, passed: false, mistakes: 0 });
        }
      },
    });
    writerRef.current = writer;

    // hanzi-writer resolves data async; mark ready shortly after if no error.
    const t = setTimeout(() => {
      if (!cancelled) {
        setStatus((s) => {
          if (s === "loading") {
            progressRef.current?.({ hasData: true, passed: false, mistakes: 0 });
            return "ready";
          }
          return s;
        });
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(t);
      if (el) el.innerHTML = "";
      writerRef.current = null;
    };
  }, [char, size]);

  const animate = () => {
    setQuizActive(false);
    writerRef.current?.animateCharacter();
  };

  const startQuiz = () => {
    setQuizResult(null);
    setMistakes(0);
    setQuizActive(true);
    writerRef.current?.quiz({
      leniency: 1.1,
      onComplete: (summary?: { totalMistakes?: number }) => {
        const m = summary?.totalMistakes ?? 0;
        setMistakes(m);
        setQuizResult("passed");
        setQuizActive(false);
        progressRef.current?.({ hasData: true, passed: true, mistakes: m });
      },
    });
  };

  const reset = () => {
    setQuizActive(false);
    setQuizResult(null);
    setMistakes(0);
    writerRef.current?.cancelQuiz();
    writerRef.current?.hideCharacter();
    writerRef.current?.showOutline();
    progressRef.current?.({ hasData: true, passed: false, mistakes: 0 });
  };

  if (status === "nodata") {
    return <TraceFallback char={char} size={size} />;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative rounded-2xl border border-border/60 bg-card/40"
        style={{ width: size, height: size }}
      >
        {/* hanzi-writer renders its SVG into this div */}
        <div ref={targetRef} className="absolute inset-0 grid place-items-center" />
      </div>

      {quizResult === "passed" ? (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium",
            mistakes === 0 ? "text-success" : "text-warning"
          )}
        >
          <Check className="size-4" />
          {mistakes === 0
            ? "¡Perfecto! Todos los trazos en orden 🎉"
            : `Completado con ${mistakes} ${mistakes === 1 ? "corrección" : "correcciones"} — ¡sigue practicando!`}
        </motion.p>
      ) : quizActive ? (
        <p className="text-xs text-muted-foreground">
          Dibuja los trazos en orden sobre la guía…
        </p>
      ) : null}

      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="outline" onClick={animate}>
          <PlayCircle className="size-3.5" /> Ver orden
        </Button>
        <Button size="sm" variant={quizActive ? "default" : "outline"} onClick={startQuiz}>
          <Eraser className="size-3.5" /> Practicar
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          <RotateCcw className="size-3.5" /> Reiniciar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => speakJapanese(char).catch(() => {})}
        >
          <Volume2 className="size-3.5" /> Sonido
        </Button>
      </div>
    </div>
  );
}

/** Free-draw trace mode for kanji that have no stroke-order data. */
function TraceFallback({ char, size }: { char: string; size: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 11;
    ctx.strokeStyle = "#22d3ee";
  }, [size, char]);

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    const m = e as React.MouseEvent;
    return { x: m.clientX - rect.left, y: m.clientY - rect.top };
  };
  const down = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    drawing.current = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!hasInk) setHasInk(true);
  };
  const up = () => {
    drawing.current = false;
  };
  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card/40"
        style={{ width: size, height: size }}
      >
        <span className="pointer-events-none absolute inset-0 grid place-items-center font-jp leading-none text-foreground/10"
          style={{ fontSize: size * 0.7 }}
        >
          {char}
        </span>
        <canvas
          ref={canvasRef}
          className={cn("absolute inset-0 cursor-crosshair")}
          style={{ width: size, height: size }}
          onMouseDown={down}
          onMouseMove={move}
          onMouseUp={up}
          onMouseLeave={up}
          onTouchStart={down}
          onTouchMove={move}
          onTouchEnd={up}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={clear} disabled={!hasInk}>
          <Eraser className="size-3.5" /> Borrar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => speakJapanese(char).catch(() => {})}
        >
          <Volume2 className="size-3.5" /> Sonido
        </Button>
      </div>
      <p className="max-w-xs text-center text-[11px] text-muted-foreground">
        Calca el kanji sobre la guía. (Este kanji aún no tiene animación de
        orden de trazos.)
      </p>
    </div>
  );
}
