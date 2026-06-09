import { motion } from "framer-motion";

import { MeshBackground } from "@/components/visual/mesh-background";
import { KanjiOrb } from "@/components/visual/kanji-orb";

/**
 * Playful full-screen loading state: a pulsing gradient orb with cycling kana
 * and a shimmering label. Used while the app boots (auth/profile checks).
 */
export function LoadingScreen({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="relative grid h-screen w-screen place-items-center overflow-hidden bg-background text-foreground">
      <MeshBackground />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative grid place-items-center">
          {/* Pulsing halo behind the 3D orb (also a graceful fallback) */}
          <motion.div
            className="absolute size-32 rounded-full bg-gradient-to-br from-primary via-neon-violet to-neon-cyan blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Animated 3D kanji orb */}
          <KanjiOrb character="学" size={220} />
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
