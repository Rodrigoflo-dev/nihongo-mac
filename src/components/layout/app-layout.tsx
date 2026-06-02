import { Outlet } from "react-router-dom";

import { MeshBackground } from "@/components/visual/mesh-background";
import { useReminderCheck } from "@/hooks/use-reminder-check";
import { Sidebar } from "./sidebar";

export function AppLayout() {
  useReminderCheck();
  return (
    <div
      className="relative flex h-screen w-screen overflow-hidden text-foreground"
      data-tauri-drag-region
    >
      <MeshBackground />
      <Sidebar />
      <main className="relative flex-1 overflow-hidden">
        {/* macOS native traffic-light safe area */}
        <div
          className="absolute inset-x-0 top-0 z-10 h-7"
          data-tauri-drag-region
        />
        <div className="h-full overflow-y-auto px-12 pt-14 pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
