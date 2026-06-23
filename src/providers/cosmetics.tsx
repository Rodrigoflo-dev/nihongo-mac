import * as React from "react";

/**
 * Profile cosmetics: avatar + profile-card background, persisted locally. Items
 * unlock by LEVELING UP (which you do by learning — "terminando lecciones"),
 * plus you can upload your own photo. Equipping is cosmetic-only; ownership is
 * gated by the player's level in the UI.
 */

export type AvatarKind = "kanji" | "orb" | "photo";

export interface AvatarDef {
  id: string;
  label: string;
  kind: AvatarKind;
  /** kanji/kana glyph for "kanji"; tailwind gradient for "orb". */
  value: string;
  /** Extra flair classes for "orb" (animation). */
  fx?: string;
  unlockLevel: number;
}

export const AVATARS: AvatarDef[] = [
  // Simple — kana/kanji on a soft tile (low levels / default)
  { id: "a-hira", label: "あ", kind: "kanji", value: "あ", unlockLevel: 1 },
  { id: "a-gaku", label: "学 Estudiante", kind: "kanji", value: "学", unlockLevel: 1 },
  { id: "a-chikara", label: "力 Fuerza", kind: "kanji", value: "力", unlockLevel: 2 },
  { id: "a-michi", label: "道 Camino", kind: "kanji", value: "道", unlockLevel: 3 },
  { id: "a-hana", label: "花 Flor", kind: "kanji", value: "花", unlockLevel: 4 },
  { id: "a-ryu", label: "竜 Dragón", kind: "kanji", value: "竜", unlockLevel: 7 },
  // "3D" animated gradient orbs (higher levels)
  { id: "o-aurora", label: "Aurora", kind: "orb", value: "from-neon-violet via-primary to-neon-cyan", fx: "animate-holo-spin", unlockLevel: 3 },
  { id: "o-sakura", label: "Sakura 3D", kind: "orb", value: "from-pink-400 via-rose-400 to-fuchsia-400", fx: "animate-holo-float", unlockLevel: 5 },
  { id: "o-matcha", label: "Matcha 3D", kind: "orb", value: "from-emerald-400 via-green-400 to-teal-300", fx: "animate-holo-float", unlockLevel: 6 },
  { id: "o-koi", label: "Koi 3D", kind: "orb", value: "from-red-500 via-orange-400 to-amber-300", fx: "animate-holo-spin", unlockLevel: 8 },
  { id: "o-void", label: "Vacío 3D", kind: "orb", value: "from-slate-700 via-violet-900 to-black", fx: "animate-holo-spin", unlockLevel: 10 },
  // Your own photo
  { id: "photo", label: "Tu foto", kind: "photo", value: "", unlockLevel: 2 },
];

export interface BackgroundDef {
  id: string;
  label: string;
  /** classes applied to the profile card background layer. */
  className: string;
  unlockLevel: number;
}

export const BACKGROUNDS: BackgroundDef[] = [
  { id: "none", label: "Ninguno", className: "", unlockLevel: 1 },
  { id: "mesh", label: "Niebla violeta", className: "bg-gradient-to-br from-neon-violet/25 via-primary/10 to-neon-cyan/20", unlockLevel: 1 },
  { id: "grid", label: "Rejilla neón", className: "holo-grid opacity-60", unlockLevel: 3 },
  { id: "sakura", label: "Sakura", className: "bg-gradient-to-br from-pink-500/25 via-rose-400/10 to-transparent", unlockLevel: 4 },
  { id: "matcha", label: "Matcha", className: "bg-gradient-to-br from-emerald-500/25 via-green-400/10 to-transparent", unlockLevel: 5 },
  { id: "sunset", label: "Atardecer", className: "bg-gradient-to-br from-amber-500/25 via-orange-400/12 to-transparent", unlockLevel: 6 },
];

interface CosmeticsState {
  avatarId: string;
  backgroundId: string;
  photo: string | null;
  setAvatarId: (id: string) => void;
  setBackgroundId: (id: string) => void;
  setPhoto: (dataUrl: string | null) => void;
}

const KEY_AVATAR = "nihongo-avatar";
const KEY_BG = "nihongo-bg";
const KEY_PHOTO = "nihongo-photo";

const CosmeticsContext = React.createContext<CosmeticsState | undefined>(
  undefined
);

export function CosmeticsProvider({ children }: { children: React.ReactNode }) {
  const [avatarId, setAvatarIdState] = React.useState<string>(
    () => localStorage.getItem(KEY_AVATAR) || "a-hira"
  );
  const [backgroundId, setBackgroundIdState] = React.useState<string>(
    () => localStorage.getItem(KEY_BG) || "mesh"
  );
  const [photo, setPhotoState] = React.useState<string | null>(
    () => localStorage.getItem(KEY_PHOTO) || null
  );

  const setAvatarId = React.useCallback((id: string) => {
    setAvatarIdState(id);
    localStorage.setItem(KEY_AVATAR, id);
  }, []);
  const setBackgroundId = React.useCallback((id: string) => {
    setBackgroundIdState(id);
    localStorage.setItem(KEY_BG, id);
  }, []);
  const setPhoto = React.useCallback((dataUrl: string | null) => {
    setPhotoState(dataUrl);
    if (dataUrl) localStorage.setItem(KEY_PHOTO, dataUrl);
    else localStorage.removeItem(KEY_PHOTO);
  }, []);

  const value = React.useMemo<CosmeticsState>(
    () => ({ avatarId, backgroundId, photo, setAvatarId, setBackgroundId, setPhoto }),
    [avatarId, backgroundId, photo, setAvatarId, setBackgroundId, setPhoto]
  );

  return (
    <CosmeticsContext.Provider value={value}>
      {children}
    </CosmeticsContext.Provider>
  );
}

export function useCosmetics(): CosmeticsState {
  const ctx = React.useContext(CosmeticsContext);
  if (!ctx) throw new Error("useCosmetics must be used within CosmeticsProvider");
  return ctx;
}
