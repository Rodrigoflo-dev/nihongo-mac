import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useAccent, type Accent } from "@/providers/accent";

/**
 * Per-theme animated ambient effects layer. Sits BEHIND the main content
 * (the layout's <main> is z-10) as a fixed, non-interactive overlay and gives
 * each accent a distinct atmosphere:
 *
 *  - sakura : falling cherry petals (the showcase)
 *  - matcha : green tea motes drifting upward
 *  - sunset : warm pulsing glow + rising golden specks
 *  - koi    : aquatic bubbles rising
 *  - sumi   : slow fading ink blots, monochrome
 *  - aether : faint neon violet/cyan sparks (kept subtle)
 *
 * Everything animates transform/opacity only (GPU friendly) and is capped at
 * ~16 particles. pointer-events-none guarantees it never steals clicks.
 */

/** Deterministic-ish pseudo random in [0,1) seeded by an integer. */
function rand(seed: number): number {
  const x = Math.sin(seed * 99.71 + 13.37) * 43758.5453;
  return x - Math.floor(x);
}

const Overlay: React.FC<React.PropsWithChildren> = ({ children }) => (
  <motion.div
    aria-hidden
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8 }}
    className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
  >
    {children}
  </motion.div>
);

/* ----------------------------- sakura ------------------------------ */

function SakuraFX() {
  const petals = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const r1 = rand(i + 1);
        const r2 = rand(i + 50);
        const r3 = rand(i + 120);
        const size = 8 + r1 * 10; // 8..18px
        return {
          left: (i / 14) * 100 + (r2 * 6 - 3), // spread across, jittered
          size,
          duration: 9 + r3 * 9, // 9..18s
          delay: -r1 * 18, // negative -> staggered, already mid-fall
          drift: 24 + r2 * 40, // horizontal sway amplitude px
          spin: r3 > 0.5 ? 1 : -1,
          opacity: 0.3 + r2 * 0.2,
        };
      }),
    []
  );

  return (
    <Overlay>
      {petals.map((p, i) => (
        <motion.div
          key={i}
          className="absolute top-0"
          style={{ left: `${p.left}%` }}
          initial={{ y: "-12vh", x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: ["-12vh", "112vh"],
            x: [0, p.drift, -p.drift * 0.6, p.drift * 0.4, 0],
            rotate: [0, p.spin * 180, p.spin * 360],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* petal shape: asymmetric rounded blob with soft pink gradient */}
          <div
            style={{
              width: p.size,
              height: p.size * 1.2,
              borderRadius: "100% 0 100% 0",
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--color-neon-pink) 85%, white) 0%, color-mix(in oklch, var(--color-neon-pink) 55%, transparent) 100%)",
              boxShadow:
                "0 0 6px color-mix(in oklch, var(--color-neon-pink) 50%, transparent)",
            }}
          />
        </motion.div>
      ))}
    </Overlay>
  );
}

/* ----------------------------- matcha ------------------------------ */

function MatchaFX() {
  const motes = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const r1 = rand(i + 7);
        const r2 = rand(i + 60);
        const r3 = rand(i + 200);
        const size = 5 + r1 * 9;
        return {
          left: (i / 14) * 100 + (r2 * 5 - 2.5),
          size,
          duration: 12 + r3 * 10,
          delay: -r1 * 20,
          drift: 16 + r2 * 30,
          opacity: 0.25 + r2 * 0.2,
        };
      }),
    []
  );

  return (
    <Overlay>
      {motes.map((m, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${m.left}%`,
            width: m.size,
            height: m.size,
            background:
              "radial-gradient(circle at 35% 30%, color-mix(in oklch, #86efac 90%, white), color-mix(in oklch, #16a34a 70%, transparent))",
            boxShadow: "0 0 8px color-mix(in oklch, #22c55e 50%, transparent)",
          }}
          initial={{ y: "110vh", x: 0, opacity: 0 }}
          animate={{
            y: ["110vh", "-12vh"],
            x: [0, m.drift, -m.drift * 0.7, 0],
            opacity: [0, m.opacity, m.opacity, 0],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </Overlay>
  );
}

/* ----------------------------- sunset ------------------------------ */

function SunsetFX() {
  const specks = React.useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const r1 = rand(i + 3);
        const r2 = rand(i + 44);
        const r3 = rand(i + 99);
        return {
          left: (i / 10) * 100 + (r2 * 6 - 3),
          size: 3 + r1 * 5,
          duration: 14 + r3 * 8,
          delay: -r1 * 22,
          drift: 12 + r2 * 24,
          opacity: 0.3 + r2 * 0.2,
        };
      }),
    []
  );

  return (
    <Overlay>
      {/* warm pulsing glow from bottom-right corner */}
      <motion.div
        className="absolute -bottom-40 -right-40 size-[48rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-neon-amber) 60%, transparent) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.18, 0.4, 0.18], scale: [1, 1.08, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* secondary orange glow top-left, offset pulse */}
      <motion.div
        className="absolute -top-48 -left-32 size-[36rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, #fb923c 55%, transparent) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.1, 0.28, 0.1], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* rising golden specks */}
      {specks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            background:
              "radial-gradient(circle, color-mix(in oklch, var(--color-neon-amber) 95%, white), transparent 75%)",
            boxShadow:
              "0 0 8px color-mix(in oklch, var(--color-neon-amber) 70%, transparent)",
          }}
          initial={{ y: "108vh", x: 0, opacity: 0 }}
          animate={{
            y: ["108vh", "-10vh"],
            x: [0, s.drift, -s.drift * 0.5, 0],
            opacity: [0, s.opacity, s.opacity, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </Overlay>
  );
}

/* ------------------------------ koi -------------------------------- */

function KoiFX() {
  const bubbles = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const r1 = rand(i + 11);
        const r2 = rand(i + 70);
        const r3 = rand(i + 150);
        const size = 6 + r1 * 16;
        return {
          left: (i / 14) * 100 + (r2 * 6 - 3),
          size,
          duration: 10 + r3 * 9,
          delay: -r1 * 19,
          drift: 14 + r2 * 26,
          opacity: 0.22 + r2 * 0.22,
        };
      }),
    []
  );

  return (
    <Overlay>
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            border:
              "1px solid color-mix(in oklch, #fb7185 70%, transparent)",
            background:
              "radial-gradient(circle at 35% 30%, color-mix(in oklch, #fdba74 60%, transparent), transparent 65%)",
            boxShadow: "0 0 6px color-mix(in oklch, #ef4444 35%, transparent)",
          }}
          initial={{ y: "110vh", x: 0, opacity: 0 }}
          animate={{
            y: ["110vh", "-12vh"],
            x: [0, b.drift, -b.drift * 0.8, b.drift * 0.5, 0],
            opacity: [0, b.opacity, b.opacity, 0],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </Overlay>
  );
}

/* ------------------------------ sumi ------------------------------- */

function SumiFX() {
  const blots = React.useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const r1 = rand(i + 17);
        const r2 = rand(i + 88);
        const r3 = rand(i + 222);
        return {
          left: 8 + r1 * 84,
          top: 8 + r2 * 80,
          size: 80 + r3 * 180,
          duration: 12 + r1 * 10,
          delay: -r2 * 22,
          opacity: 0.1 + r3 * 0.14,
        };
      }),
    []
  );

  return (
    <Overlay>
      {blots.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            background:
              "radial-gradient(circle, color-mix(in oklch, var(--color-foreground) 55%, transparent) 0%, transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0, b.opacity, 0], scale: [0.7, 1.15, 0.9] }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </Overlay>
  );
}

/* ----------------------------- aether ------------------------------ */

function AetherFX() {
  const sparks = React.useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const r1 = rand(i + 5);
        const r2 = rand(i + 55);
        const r3 = rand(i + 175);
        const cyan = r3 > 0.5;
        return {
          left: (i / 16) * 100 + (r2 * 5 - 2.5),
          size: 2 + r1 * 4,
          duration: 14 + r3 * 12,
          delay: -r1 * 24,
          drift: 10 + r2 * 22,
          opacity: 0.18 + r2 * 0.15,
          color: cyan ? "var(--color-neon-cyan)" : "var(--color-neon-violet)",
        };
      }),
    []
  );

  return (
    <Overlay>
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow: `0 0 8px ${s.color}`,
          }}
          initial={{ y: "110vh", x: 0, opacity: 0 }}
          animate={{
            y: ["110vh", "-10vh"],
            x: [0, s.drift, -s.drift * 0.6, 0],
            opacity: [0, s.opacity, s.opacity, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </Overlay>
  );
}

/* ----------------------------- registry ---------------------------- */

const FX: Record<Accent, React.FC> = {
  sakura: SakuraFX,
  matcha: MatchaFX,
  sunset: SunsetFX,
  koi: KoiFX,
  sumi: SumiFX,
  aether: AetherFX,
};

export function AccentFX() {
  const { accent } = useAccent();
  const Active = FX[accent];

  return (
    <AnimatePresence mode="wait">
      <Active key={accent} />
    </AnimatePresence>
  );
}
