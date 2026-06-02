import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import type { ReviewGrade } from "@/lib/api";
import { cn } from "@/lib/utils";

interface GradeButtonsProps {
  onGrade: (g: ReviewGrade) => void;
  disabled?: boolean;
}

interface GradeOption {
  grade: ReviewGrade;
  label: string;
  hint: string;
  className: string;
  key?: string;
}

const OPTIONS: GradeOption[] = [
  {
    grade: "again",
    label: "De nuevo",
    hint: "No lo recuerdo",
    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    key: "1",
  },
  {
    grade: "hard",
    label: "Difícil",
    hint: "Con esfuerzo",
    className: "bg-warning text-warning-foreground hover:bg-warning/90",
    key: "2",
  },
  {
    grade: "good",
    label: "Bien",
    hint: "Lo recordé",
    className: "bg-primary text-primary-foreground hover:bg-primary/90",
    key: "3",
  },
  {
    grade: "easy",
    label: "Fácil",
    hint: "Instantáneo",
    className: "bg-success text-success-foreground hover:bg-success/90",
    key: "4",
  },
];

export function GradeButtons({ onGrade, disabled }: GradeButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-4 gap-2"
    >
      {OPTIONS.map((opt) => (
        <Button
          key={opt.grade}
          size="lg"
          disabled={disabled}
          onClick={() => onGrade(opt.grade)}
          className={cn(
            "h-auto flex-col gap-0.5 px-3 py-3 shadow-sm",
            opt.className
          )}
        >
          <span className="text-sm font-semibold">{opt.label}</span>
          <span className="text-[10px] opacity-80">{opt.hint}</span>
        </Button>
      ))}
    </motion.div>
  );
}
