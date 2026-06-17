import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

import { api } from "@/lib/api";
import { burstLevelUp } from "@/components/visual/confetti";

const SEEN_KEY = "nihongo-seen-achievements";

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore */
  }
}

async function notifyUnlock(title: string, description: string | null) {
  try {
    let granted = await isPermissionGranted();
    if (!granted) granted = (await requestPermission()) === "granted";
    if (granted) {
      sendNotification({
        title: "🏆 ¡Logro desbloqueado!",
        body: description ? `${title} — ${description}` : title,
      });
    }
  } catch {
    /* ignore */
  }
}

/**
 * Watches achievements and fires a personalized native notification (+ a little
 * confetti) the first time each one unlocks. On the very first run it seeds the
 * "seen" set without notifying, so we don't replay already-earned achievements.
 */
export function useAchievementWatch() {
  const initializedRef = useRef(false);

  const { data: achievements } = useQuery({
    queryKey: ["achievements", "watch"],
    queryFn: () => api.getAchievements(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!achievements) return;
    const unlocked = achievements.filter((a) => a.unlocked);
    const seen = loadSeen();

    // First run after install/login: seed silently.
    const firstRun = localStorage.getItem(SEEN_KEY) === null;
    if (firstRun || !initializedRef.current) {
      initializedRef.current = true;
      if (firstRun) {
        const seeded = new Set(unlocked.map((a) => a.key));
        saveSeen(seeded);
        return;
      }
    }

    const fresh = unlocked.filter((a) => !seen.has(a.key));
    if (fresh.length === 0) return;

    for (const a of fresh) {
      seen.add(a.key);
      notifyUnlock(a.title, a.description);
    }
    saveSeen(seen);
    burstLevelUp();
  }, [achievements]);
}
