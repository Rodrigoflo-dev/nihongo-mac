import { useEffect } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import { api } from "@/lib/api";

/**
 * Periodically checks whether the daily reminder is due and sends a native
 * notification (cross-platform via tauri-plugin-notification) if the user has
 * not been active yet today. Runs once on mount and then every 10 minutes
 * while the app is open.
 */
async function ensurePermission(): Promise<boolean> {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const result = await requestPermission();
      granted = result === "granted";
    }
    return granted;
  } catch (e) {
    console.warn("notification permission check failed", e);
    return false;
  }
}

export function useReminderCheck() {
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const msg = await api.checkReminderDue();
        if (cancelled || !msg) return;
        if (!(await ensurePermission())) return;
        sendNotification({
          title: "Tu sesión de hoy te está esperando",
          body: msg,
        });
      } catch (e) {
        // swallow — notification permission may not be granted yet
        console.warn("reminder check failed", e);
      }
    };

    const t1 = setTimeout(check, 4_000);
    const interval = setInterval(check, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, []);
}
