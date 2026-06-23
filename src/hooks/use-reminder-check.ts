import { useEffect } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import { api } from "@/lib/api";
import { useUserProfile } from "@/hooks/use-user-profile";

const SENT_KEY = "nihongo-reminder-sent-date";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

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
  // Re-evaluate whenever the reminder time changes (so editing it in Ajustes
  // takes effect right away, not only on the next 10-min tick).
  const { data: profile } = useUserProfile();
  const reminderTime = profile?.reminderTime ?? null;

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        // Only fire once per day, even if the app stays open past the hour.
        if (localStorage.getItem(SENT_KEY) === todayStr()) return;
        const msg = await api.checkReminderDue();
        if (cancelled || !msg) return;
        if (!(await ensurePermission())) return;
        sendNotification({
          title: "Tu sesión de hoy te está esperando",
          body: msg,
        });
        localStorage.setItem(SENT_KEY, todayStr());
      } catch (e) {
        // swallow — notification permission may not be granted yet
        console.warn("reminder check failed", e);
      }
    };

    const t1 = setTimeout(check, 4_000);
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, [reminderTime]);
}
