import { motion } from "framer-motion";

import { MeshBackground } from "@/components/visual/mesh-background";

const KANA = ["あ", "い", "う", "え", "お", "日", "本", "語"];

/**
 * Playful full-screen loading state: a pulsing gradient orb with cycling kana
 * and a shimmering label. Used while the app boots (auth/profile checks).
 */
export function LoadingScreen({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="relative grid h-screen w-screen place-items-center overflow-hidden bg-background text-foreground">
      <MeshBackground />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative grid place-items-center">
          {/* Pulsing halo */}
          <motion.div
            className="absolute size-32 rounded-full bg-gradient-to-br from-primary via-neon-violet to-neon-cyan blur-2xl"
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Rotating ring */}
          <motion.div
            className="absolute size-28 rounded-full border-2 border-transparent border-t-primary border-r-neon-cyan"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
          {/* Cycling kana */}
          <div className="relative grid size-28 place-items-center">
            {KANA.map((k, i) => (
              <motion.span
                key={k}
                className="absolute font-jp text-5xl font-medium"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
                transition={{
                  duration: KANA.length * 0.5,
                  times: [0, 0.06, 0.12],
                  delay: i * 0.5,
                  repeat: Infinity,
                }}
              >
                {k}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.p
          className="text-sm tracking-[0.3em] text-muted-foreground"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
}
