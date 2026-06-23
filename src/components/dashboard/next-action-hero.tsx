import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Feather,
  Headphones,
  Mic,
  PenTool,
  Plus,
  Repeat,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { NextAction } from "@/lib/api";
import { cn } from "@/lib/utils";

const KanjiOrb = lazy(() =>
  import("@/components/visual/kanji-orb").then((m) => ({ default: m.KanjiOrb }))
);

const ICONS: Record<string, LucideIcon> = {
  "pen-tool": PenTool,
  repeat: Repeat,
  plus: Plus,
  "book-open": BookOpen,
  feather: Feather,
  headphones: Headphones,
  mic: Mic,
  sparkles: Sparkles,
};

interface NextActionHeroProps {
  action: NextAction;
}

const URGENCY_TONE: Record<NextAction["urgency"], string> = {
  high: "from-neon-violet via-primary to-neon-cyan",
  medium: "from-primary via-neon-violet to-neon-pink",
  low: "from-neon-cyan via-primary to-neon-amber",
};

export function NextActionHero({ action }: NextActionHeroProps) {
  const Icon = ICONS[action.icon] ?? Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.21, 1.02, 0.73, 1] }}
      className="relative"
    >
      {/* Animated halo behind the card */}
      <div
        className={cn(
          "absolute -inset-2 rounded-3xl bg-gradient-to-br opacity-50 blur-2xl",
          URGENCY_TONE[action.urgency]
        )}
      />

      {/* Card */}
      <div className="relative overflow-hidden rounded-3xl glass-strong">
        {/* HUD corner brackets */}
        <span className="hud-corner left-3 top-3 z-20 border-l-2 border-t-2" />
        <span className="hud-corner right-3 top-3 z-20 border-r-2 border-t-2" />
        <span className="hud-corner bottom-3 left-3 z-20 border-b-2 border-l-2" />
        <span className="hud-corner bottom-3 right-3 z-20 border-b-2 border-r-2" />
        {/* scanline */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-3xl">
          <div className="animate-scanline absolute left-0 h-12 w-full bg-gradient-to-b from-transparent via-neon-cyan/[0.06] to-transparent" />
        </div>
        {/* Decorative gradient sheen */}
        <div
          aria-hidden
          className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/40"
        />
        <div
          aria-hidden
          className={cn(
            "absolute -right-24 -top-24 size-72 rounded-full opacity-50 blur-3xl",
            "bg-gradient-to-br",
            URGENCY_TONE[action.urgency]
          )}
        />

        <div className="grid grid-cols-12 items-center gap-6 p-8">
          {/* Text + CTA */}
          <div className="relative z-10 col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-background/30 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-neon-cyan backdrop-blur">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  action.urgency === "high" && "bg-neon-pink animate-pulse",
                  action.urgency === "medium" && "bg-neon-violet",
                  action.urgency === "low" && "bg-neon-cyan"
                )}
              />
              Tu próximo paso
            </div>

            <div className="space-y-3">
              <p className="font-jp text-xs tracking-[0.35em] text-muted-foreground">
                {action.jpSubtitle}
              </p>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-balance md:text-4xl">
                {action.title}
              </h2>
              <p className="max-w-md text-balance text-sm text-muted-foreground">
                {action.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="group relative inline-flex">
                {/* Outer pulsing neon glow (behind, not clipped) */}
                <span
                  aria-hidden
                  className="animate-glow-pulse absolute -inset-1 bg-gradient-to-r from-neon-violet via-primary to-neon-cyan opacity-55 blur-lg transition-opacity duration-300 group-hover:opacity-90"
                />
                <Button
                  size="xl"
                  asChild
                  className={cn(
                    "cta-clip relative h-14 overflow-hidden rounded-none px-7 text-base font-extrabold",
                    "bg-gradient-to-r from-neon-violet via-primary to-neon-cyan text-background",
                    "transition-all hover:brightness-110"
                  )}
                >
                  <Link to={action.modulePath}>
                    {/* top neon edge + sheen + HUD ticks */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-px bg-white/70"
                    />
                    <span className="shimmer pointer-events-none absolute inset-0 opacity-40" />
                    <span
                      aria-hidden
                      className="absolute right-1.5 top-1.5 size-2.5 border-r-2 border-t-2 border-background/40"
                    />
                    <span
                      aria-hidden
                      className="absolute bottom-1.5 left-1.5 size-2.5 border-b-2 border-l-2 border-background/40"
                    />
                    <Icon className="relative size-5" />
                    <span className="relative">{action.ctaLabel}</span>
                    <ArrowRight className="relative size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground backdrop-blur">
                <Clock className="size-3" />
                ~{action.estimatedMinutes} min
              </span>
            </div>
          </div>

          {/* 3D orb */}
          <div className="col-span-5 flex h-72 items-center justify-center">
            <Suspense fallback={<OrbFallback />}>
              <KanjiOrb character={action.kanjiHint} size={280} />
            </Suspense>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OrbFallback() {
  return (
    <div className="size-60 rounded-full bg-gradient-to-br from-primary/30 via-neon-violet/20 to-neon-cyan/20 blur-2xl animate-glow-pulse" />
  );
}
