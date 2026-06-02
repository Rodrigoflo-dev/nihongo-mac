import { motion } from "framer-motion";

/**
 * Animated aurora-like mesh gradient that lives behind the whole app.
 * Four radial blobs that slowly drift to create a sense of motion without
 * being distracting.
 */
export function MeshBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base wash */}
      <div className="absolute inset-0 mesh-bg opacity-90" />

      {/* Drifting blobs for added motion */}
      <motion.div
        animate={{
          x: ["-2%", "2%", "-1%", "-2%"],
          y: ["-1%", "2%", "-2%", "-1%"],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 size-[42rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-neon-violet) 60%, transparent), transparent 70%)",
        }}
      />
      <motion.div
        animate={{
          x: ["1%", "-2%", "2%", "1%"],
          y: ["2%", "-1%", "2%", "2%"],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 right-0 size-[36rem] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-neon-cyan) 60%, transparent), transparent 70%)",
        }}
      />
      <motion.div
        animate={{
          x: ["-2%", "1%", "2%", "-2%"],
          y: ["-1%", "1%", "-2%", "-1%"],
        }}
        transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 size-[44rem] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-neon-pink) 50%, transparent), transparent 70%)",
        }}
      />
      <motion.div
        animate={{
          x: ["2%", "-1%", "1%", "2%"],
          y: ["1%", "-2%", "1%", "1%"],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-32 right-0 size-[32rem] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-neon-amber) 55%, transparent), transparent 70%)",
        }}
      />

      {/* Subtle dot grid overlay — adds technical feel */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.09]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          color: "var(--color-foreground)",
        }}
      />
    </div>
  );
}
