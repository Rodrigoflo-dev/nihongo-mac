import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Ambient "aether" layer: glowing motes and a few faint kana that drift slowly
 * upward, like embers. Sits on top of the mesh background to give the login /
 * hero screens depth and life without heavy WebGL. Purely decorative.
 */

// Deterministic particle field (no runtime randomness → stable across renders).
const MOTES = [
  { left: "8%", size: 3, delay: 0, duration: 15, drift: 14, color: "cyan" },
  { left: "16%", size: 2, delay: 3.5, duration: 19, drift: -10, color: "violet" },
  { left: "24%", size: 4, delay: 1.2, duration: 17, drift: 8, color: "violet" },
  { left: "33%", size: 2, delay: 6, duration: 21, drift: -16, color: "cyan" },
  { left: "41%", size: 3, delay: 2.4, duration: 16, drift: 12, color: "pink" },
  { left: "52%", size: 2, delay: 4.8, duration: 22, drift: -8, color: "cyan" },
  { left: "60%", size: 5, delay: 0.6, duration: 18, drift: 10, color: "violet" },
  { left: "68%", size: 2, delay: 7.2, duration: 20, drift: -14, color: "cyan" },
  { left: "76%", size: 3, delay: 3, duration: 17, drift: 16, color: "pink" },
  { left: "84%", size: 2, delay: 5.4, duration: 23, drift: -10, color: "violet" },
  { left: "92%", size: 4, delay: 1.8, duration: 19, drift: 8, color: "cyan" },
  { left: "48%", size: 2, delay: 8, duration: 24, drift: 12, color: "violet" },
] as const;

const KANA = [
  { char: "あ", left: "12%", delay: 0, duration: 26 },
  { char: "み", left: "38%", delay: 9, duration: 30 },
  { char: "ち", left: "70%", delay: 5, duration: 28 },
  { char: "道", left: "88%", delay: 13, duration: 32 },
] as const;

const COLOR: Record<string, string> = {
  cyan: "var(--color-neon-cyan)",
  violet: "var(--color-neon-violet)",
  pink: "var(--color-neon-pink)",
};

export function AetherParticles({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {MOTES.map((m, i) => (
        <motion.span
          key={`mote-${i}`}
          className="absolute rounded-full"
          style={{
            left: m.left,
            bottom: "-2%",
            width: m.size,
            height: m.size,
            background: COLOR[m.color],
            boxShadow: `0 0 ${m.size * 3}px ${m.size}px color-mix(in oklch, ${COLOR[m.color]} 70%, transparent)`,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: ["0vh", "-108vh"],
            x: [0, m.drift, 0],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {KANA.map((k, i) => (
        <motion.span
          key={`kana-${i}`}
          className="absolute font-jp text-2xl text-primary/20"
          style={{ left: k.left, bottom: "-6%" }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: ["0vh", "-112vh"],
            opacity: [0, 0.35, 0.35, 0],
            rotate: [0, 8, -6, 0],
          }}
          transition={{
            duration: k.duration,
            delay: k.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {k.char}
        </motion.span>
      ))}
    </div>
  );
}
