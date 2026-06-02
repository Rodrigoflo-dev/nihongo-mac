import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface ToggleCardProps {
  value: boolean;
  onChange: (v: boolean) => void;
  title: string;
  jp?: string;
  description?: string;
  sample?: string;
}

export function ToggleCard({
  value,
  onChange,
  title,
  jp,
  description,
  sample,
}: ToggleCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onChange(!value)}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all",
        "hover:bg-accent hover:border-primary/30",
        value && "border-primary ring-2 ring-primary/20 bg-primary/5"
      )}
    >
      {sample ? (
        <div
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-lg bg-background font-jp text-xl",
            value ? "text-primary" : "text-foreground"
          )}
        >
          {sample}
        </div>
      ) : null}
      <div className="flex-1">
        {jp ? (
          <p
            className={cn(
              "font-jp text-[11px] tracking-[0.25em]",
              value ? "text-primary" : "text-muted-foreground"
            )}
          >
            {jp}
          </p>
        ) : null}
        <p className="text-sm font-semibold">{title}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div
        className={cn(
          "flex size-6 items-center justify-center rounded-full border transition-colors",
          value
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input"
        )}
      >
        {value ? <Check className="size-3.5" /> : null}
      </div>
    </motion.button>
  );
}
