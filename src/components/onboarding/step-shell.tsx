import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MeshBackground } from "@/components/visual/mesh-background";
import { cn } from "@/lib/utils";

interface StepShellProps {
  step: number;
  total: number;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  canGoBack?: boolean;
  onBack?: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function StepShell({
  step,
  total,
  eyebrow,
  title,
  description,
  children,
  canGoBack,
  onBack,
  primaryLabel,
  primaryDisabled,
  primaryLoading,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: StepShellProps) {
  const progress = ((step + 1) / total) * 100;

  return (
    <div className="relative h-screen w-screen overflow-y-auto bg-background text-foreground">
      <MeshBackground />
      <div className="absolute left-20 right-0 top-0 z-10 h-7" data-tauri-drag-region />

      <div className="relative z-10 flex min-h-full items-center justify-center py-16">
      <div className="w-full max-w-xl px-8">
        <div className="mb-10">
          <Progress value={progress} className="h-1" />
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Paso {step + 1} de {total}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.21, 1.02, 0.73, 1] }}
          >
            {eyebrow ? (
              <p className="font-jp text-xs tracking-[0.3em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-prose text-balance text-muted-foreground">
                {description}
              </p>
            ) : null}

            <div className="mt-8">{children}</div>
          </motion.div>
        </AnimatePresence>

        <div className={cn("mt-10 flex items-center gap-3")}>
          {canGoBack ? (
            <Button variant="ghost" onClick={onBack}>
              Atrás
            </Button>
          ) : null}
          <div className="flex-1" />
          {secondaryLabel ? (
            <Button variant="outline" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          ) : null}
          <Button
            size="lg"
            disabled={primaryDisabled || primaryLoading}
            onClick={onPrimary}
          >
            {primaryLoading ? "…" : primaryLabel}
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
