import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * A transparent, draggable title-bar strip.
 *
 * Uses Tauri's `startDragging()` (native `performWindowDragWithEvent`) on
 * mousedown instead of CSS `-webkit-app-region: drag`. The CSS approach moves
 * the window fine within a display but, on macOS, can't drag it across to a
 * SECOND monitor — the native drag can. Double-click toggles maximize, matching
 * the standard title-bar behavior.
 *
 * Place it after the macOS traffic lights (e.g. left-20) so the red/yellow/green
 * buttons still receive clicks.
 */
export function TitleBarDrag({ className }: { className?: string }) {
  return (
    <div
      className={className}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        getCurrentWindow().startDragging().catch(() => {});
      }}
      onDoubleClick={() => {
        getCurrentWindow().toggleMaximize().catch(() => {});
      }}
    />
  );
}
