import { Outlet } from "react-router-dom";

import { AccentFX } from "@/components/visual/accent-fx";
import { MeshBackground } from "@/components/visual/mesh-background";
import { useReminderCheck } from "@/hooks/use-reminder-check";
import { useAchievementWatch } from "@/hooks/use-achievement-watch";
import { Sidebar } from "./sidebar";

export function AppLayout() {
  useReminderCheck();
  useAchievementWatch();
  return (
    <div className="relative flex h-screen w-screen overflow-hidden text-foreground">
      <MeshBackground />
      {/* cyberpunk grid + top glow overlay */}
      <div aria-hidden className="holo-grid pointer-events-none absolute inset-0 z-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 [background:radial-gradient(circle_at_50%_-8%,color-mix(in_oklch,var(--color-primary)_14%,transparent)_0%,transparent_55%)]"
      />
      {/* per-theme animated ambient effects (sits behind content, z-0) */}
      <AccentFX />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-hidden">
        {/* Drag region starts AFTER the macOS traffic lights (~80px from left) so
            the red/yellow/green buttons still receive clicks. */}
        <div
          className="absolute left-20 right-0 top-0 z-10 h-7"
          data-tauri-drag-region
        />
        <div className="h-full overflow-y-auto px-12 pt-14 pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
