import { useEffect } from "react";

import { api } from "@/lib/api";

/**
 * Hook that periodically checks whether the daily reminder is due and sends
 * a native macOS notification if the user has not been active yet today.
 *
 * Runs once on mount and then every 10 minutes.
 */
export function useReminderCheck() {
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const msg = await api.checkReminderDue();
        if (cancelled || !msg) return;
        await api.sendNotification(
          "Tu sesión de hoy te está esperando",
          msg
        );
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
