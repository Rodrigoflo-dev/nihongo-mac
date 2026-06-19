import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 1.02, 0.73, 1] }}
      className={cn("flex items-start justify-between gap-6", className)}
    >
      <div>
        {eyebrow ? (
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-prose text-balance text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2" data-tauri-no-drag>
          {actions}
        </div>
      ) : null}
    </motion.header>
  );
}
