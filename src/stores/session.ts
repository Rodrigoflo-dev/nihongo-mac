import { create } from "zustand";

/**
 * Session lock state for the local login (see lock-gate.tsx).
 *
 * `unlocked` is session-only (never persisted) so closing the app or logging
 * out always returns to the PIN screen. All learning data lives in SQLite and
 * persists regardless.
 */
interface SessionState {
  unlocked: boolean;
  unlock: () => void;
  lock: () => void;
}

export const useSession = create<SessionState>((set) => ({
  unlocked: false,
  unlock: () => set({ unlocked: true }),
  lock: () => set({ unlocked: false }),
}));
