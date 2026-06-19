import { motion } from "framer-motion";

import { MeshBackground } from "@/components/visual/mesh-background";
import { HoloKanji } from "@/components/visual/holo-kanji";

/**
 * Playful full-screen loading state: the 3D holo-kanji + a shimmering label.
 * Used while the app boots (auth/profile checks).
 */
export function LoadingScreen({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="relative grid h-screen w-screen place-items-center overflow-hidden bg-background text-foreground">
      <MeshBackground />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <HoloKanji size={240} />

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
