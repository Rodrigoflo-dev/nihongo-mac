import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Reusable cyberpunk HUD panel: glass surface + animated scanline + neon corner
 * brackets. The shared building block for the v4.0 "alive" redesign so every
 * section feels consistent.
 */
export function HudPanel({
  children,
  className,
  scanline = true,
  corners = true,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  scanline?: boolean;
  corners?: boolean;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl glass-strong",
        glow &&
          "shadow-[0_0_40px_-12px_color-mix(in_oklch,var(--color-primary)_45%,transparent)]",
        className
      )}
    >
      {scanline ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <div className="animate-scanline absolute left-0 h-10 w-full bg-gradient-to-b from-transparent via-neon-cyan/[0.07] to-transparent" />
        </div>
      ) : null}
      {corners ? (
        <>
          <span className="hud-corner left-3 top-3 border-l-2 border-t-2" />
          <span className="hud-corner right-3 top-3 border-r-2 border-t-2" />
          <span className="hud-corner bottom-3 left-3 border-b-2 border-l-2" />
          <span className="hud-corner bottom-3 right-3 border-b-2 border-r-2" />
        </>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}
