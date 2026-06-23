import { AVATARS, useCosmetics } from "@/providers/cosmetics";
import { cn } from "@/lib/utils";

/**
 * Renders the player's equipped avatar: a kana/kanji tile, an animated 3D-ish
 * gradient orb, or their uploaded photo. Falls back to the level number.
 */
export function PlayerAvatar({
  level,
  size = 40,
  className,
  avatarId: forcedId,
}: {
  level?: number;
  size?: number;
  className?: string;
  /** Override the equipped avatar (used for store previews). */
  avatarId?: string;
}) {
  const { avatarId: equipped, photo } = useCosmetics();
  const id = forcedId ?? equipped;
  const def = AVATARS.find((a) => a.id === id) ?? AVATARS[0];
  const radius = Math.round(size * 0.28);

  const frame = cn(
    "relative grid shrink-0 place-items-center overflow-hidden",
    "shadow-[0_8px_24px_-6px_color-mix(in_oklch,var(--color-primary)_55%,transparent)]",
    className
  );
  const style = { width: size, height: size, borderRadius: radius } as const;

  if (def.kind === "photo") {
    if (photo) {
      return (
        <div className={frame} style={style}>
          <img src={photo} alt="Tu avatar" className="size-full object-cover" />
          <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20" />
        </div>
      );
    }
    // No photo uploaded yet → show level fallback tile.
    return <LevelTile level={level} frame={frame} style={style} />;
  }

  if (def.kind === "orb") {
    return (
      <div className={frame} style={style}>
        <div
          className={cn(
            "size-full bg-gradient-to-br",
            def.value,
            def.fx
          )}
        />
        <div className="absolute inset-[15%] rounded-full bg-white/15 blur-md" />
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/25" />
      </div>
    );
  }

  // kanji / kana tile
  return (
    <div
      className={cn(frame, "bg-gradient-to-br from-neon-violet via-primary to-neon-cyan text-primary-foreground")}
      style={style}
    >
      <span
        className="font-jp font-bold leading-none"
        style={{ fontSize: size * 0.5 }}
      >
        {def.value}
      </span>
      <div className="absolute inset-[8%] rounded-[inherit] border border-white/30" />
    </div>
  );
}

function LevelTile({
  level,
  frame,
  style,
}: {
  level?: number;
  frame: string;
  style: React.CSSProperties;
}) {
  return (
    <div
      className={cn(frame, "bg-gradient-to-br from-neon-violet via-primary to-neon-cyan text-primary-foreground")}
      style={style}
    >
      <span className="font-bold tabular-nums" style={{ fontSize: (style.width as number) * 0.4 }}>
        {level ?? "?"}
      </span>
    </div>
  );
}
