import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface HoloItem {
  char: string;
  meaning: string;
}

const DEFAULT_SET: HoloItem[] = [
  { char: "夢", meaning: "Sueño" },
  { char: "光", meaning: "Luz" },
  { char: "力", meaning: "Fuerza" },
  { char: "道", meaning: "Camino" },
  { char: "心", meaning: "Corazón" },
  { char: "魂", meaning: "Alma" },
];

/**
 * The "Holo-Core" — a 3D animated kanji centerpiece for the portada.
 *
 * Pure CSS/framer (no WebGL) so it's light and runs everywhere: the kanji sits
 * in a glass holo-frame, oscillates in 3D (perspective rotateY/X), floats, and
 * cycles through characters with a glitch fade. A subtle mouse parallax adds
 * depth. Cyberpunk scanlines + neon glow complete the look.
 */
export function HoloKanji({
  size = 360,
  className,
  items = DEFAULT_SET,
  interval = 3000,
}: {
  size?: number;
  className?: string;
  items?: HoloItem[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      interval
    );
    return () => clearInterval(id);
  }, [items.length, interval]);

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width;
    const y = (e.clientY - (r.top + r.height / 2)) / r.height;
    setParallax({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  };

  const current = items[index];

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* Pulsing glow halo */}
      <motion.div
        aria-hidden
        className="absolute inset-6 rounded-full bg-gradient-to-br from-primary via-neon-violet to-neon-cyan blur-3xl"
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating holo-frame */}
      <div
        className="animate-holo-float absolute inset-0"
        style={{
          transform: `translate3d(${parallax.x * 14}px, ${parallax.y * 14}px, 0)`,
          transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="glass-strong relative grid size-full place-items-center overflow-hidden rounded-[2.2rem] border border-primary/30 shadow-[0_0_60px_-10px_color-mix(in_oklch,var(--color-primary)_45%,transparent)]">
          {/* concentric ping ring */}
          <div className="pointer-events-none absolute size-[78%] animate-ping rounded-full border border-primary/15 opacity-20" />
          <div className="pointer-events-none absolute size-[60%] rounded-full border border-neon-cyan/15" />

          {/* 3D kanji stage */}
          <div className="relative grid place-items-center [perspective:1000px]">
            <div className="animate-holo-spin [transform-style:preserve-3d]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={current.char}
                  initial={{ opacity: 0, filter: "blur(10px) brightness(2)", scale: 0.85 }}
                  animate={{ opacity: 1, filter: "blur(0px) brightness(1)", scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(10px) brightness(2)", scale: 0.85 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="block select-none font-jp font-bold leading-none text-primary"
                  style={{
                    fontSize: size * 0.46,
                    textShadow:
                      "0 0 18px color-mix(in oklch, var(--color-primary) 80%, transparent), 0 0 40px color-mix(in oklch, var(--color-neon-violet) 55%, transparent)",
                  }}
                >
                  {current.char}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* meaning label */}
          <div className="absolute bottom-[18%] grid place-items-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={current.meaning}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="font-mono text-xs uppercase tracking-[0.35em] text-neon-cyan"
              >
                {current.meaning}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* scanline overlay */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.2rem]">
            <div className="animate-scanline absolute left-0 h-8 w-full bg-gradient-to-b from-transparent via-neon-cyan/10 to-transparent" />
          </div>
          {/* CRT grid tint */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background:repeating-linear-gradient(0deg,#fff_0,#fff_1px,transparent_1px,transparent_4px)]" />
        </div>
      </div>

      {/* Holo-Core badge */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-4 py-1.5 backdrop-blur-md">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
            Holo-Core
          </span>
        </div>
      </div>
    </div>
  );
}
