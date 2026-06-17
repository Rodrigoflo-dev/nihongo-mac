import { Outlet } from "react-router-dom";

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
      <Sidebar />
      <main className="relative flex-1 overflow-hidden">
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
