import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface Choice<T extends string> {
  value: T;
  label: React.ReactNode;
  jp?: string;
  description?: React.ReactNode;
}

interface ChoiceGridProps<T extends string> {
  value: T | null;
  onChange: (v: T) => void;
  options: Choice<T>[];
  columns?: 2 | 3 | 4 | 5;
}

export function ChoiceGrid<T extends string>({
  value,
  onChange,
  options,
  columns = 3,
}: ChoiceGridProps<T>) {
  const cols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
  }[columns];

  return (
    <div className={cn("grid gap-3", cols)}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(opt.value)}
            className={cn(
              "group relative flex min-w-0 flex-col items-start gap-1 overflow-hidden rounded-xl border bg-card px-4 py-4 text-left transition-all",
              "hover:bg-accent hover:border-primary/30",
              active && "border-primary ring-2 ring-primary/20 bg-primary/5"
            )}
          >
            {opt.jp ? (
              <span
                className={cn(
                  "block w-full break-words font-jp text-[11px] leading-tight tracking-[0.08em]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {opt.jp}
              </span>
            ) : null}
            <span className="block w-full break-words text-sm font-medium">
              {opt.label}
            </span>
            {opt.description ? (
              <span className="block w-full break-words text-xs text-muted-foreground">
                {opt.description}
              </span>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}
