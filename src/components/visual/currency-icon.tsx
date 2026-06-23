import {
  Coins,
  Fish,
  Flower2,
  Gem,
  Leaf,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { useAccent, type Accent } from "@/providers/accent";
import { cn } from "@/lib/utils";

/**
 * The in-game currency is no longer a generic star — it's a themed token that
 * changes its glyph and tint with the active accent (point: "que sea dinámico
 * según el tema"). Aether shows a crystal, Matcha a leaf, Sakura a blossom, etc.
 */
const CURRENCY: Record<Accent, { icon: LucideIcon; tint: string; name: string }> = {
  aether: { icon: Gem, tint: "text-neon-cyan", name: "cristales" },
  matcha: { icon: Leaf, tint: "text-green-400", name: "hojas" },
  sunset: { icon: Sun, tint: "text-amber-400", name: "soles" },
  sakura: { icon: Flower2, tint: "text-pink-400", name: "pétalos" },
  koi: { icon: Fish, tint: "text-orange-400", name: "koi" },
  sumi: { icon: Coins, tint: "text-slate-300", name: "monedas" },
};

export function useCurrency() {
  const { accent } = useAccent();
  return CURRENCY[accent] ?? CURRENCY.aether;
}

export function CurrencyIcon({ className }: { className?: string }) {
  const { icon: Icon, tint } = useCurrency();
  return <Icon className={cn(tint, className)} aria-hidden />;
}

/** Pill showing the current balance with the themed token. */
export function CurrencyBadge({
  amount,
  className,
  size = "md",
}: {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { icon: Icon, tint } = useCurrency();
  const sz =
    size === "lg"
      ? "px-4 py-2 text-lg gap-2"
      : size === "sm"
        ? "px-2 py-0.5 text-[11px] gap-1"
        : "px-3 py-1 text-sm gap-1.5";
  const iconSz = size === "lg" ? "size-4" : size === "sm" ? "size-3" : "size-3.5";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-warning/12 font-semibold tabular-nums ring-1 ring-inset ring-warning/20",
        sz,
        className
      )}
    >
      <Icon className={cn(iconSz, tint)} aria-hidden />
      <span className="text-foreground/90">{amount}</span>
    </span>
  );
}
