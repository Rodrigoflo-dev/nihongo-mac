import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { useGrammarList } from "@/hooks/use-grammar";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { GrammarListItem } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function GrammarPage() {
  const { data: profile } = useUserProfile();
  const level = profile?.currentLevel ?? "N5";
  const { data: lessons, isLoading } = useGrammarList(level);

  const stats = lessons
    ? {
        mastered: lessons.filter((l) => l.status === "mastered").length,
        learning: lessons.filter((l) => l.status === "learning").length,
        total: lessons.length,
      }
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        eyebrow={`文法 — ${level}`}
        title={
          <>
            Gramática <span className="gradient-text">paso a paso</span>
          </>
        }
        description="Explicaciones cortas, ejemplos reales y un quiz de tres preguntas para confirmar que entendiste. Al dominar una lección ganas XP."
        actions={
          stats ? (
            <Badge variant="outline" className="font-mono">
              {stats.mastered}/{stats.total} dominadas
            </Badge>
          ) : null
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando lecciones…</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {lessons?.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson }: { lesson: GrammarListItem }) {
  const statusBadge = {
    new: { label: "Nuevo", tone: "secondary" as const, icon: BookOpen },
    learning: { label: "Aprendiendo", tone: "warning" as const, icon: Sparkles },
    mastered: { label: "Dominado", tone: "success" as const, icon: Check },
  }[lesson.status];

  const Icon = statusBadge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/grammar/${lesson.id}`} className="block">
        <div
          className={cn(
            "group relative overflow-hidden rounded-2xl glass p-5 transition-all",
            "hover:ring-1 hover:ring-primary/40",
            lesson.status === "mastered" && "ring-1 ring-success/30"
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-xl",
                lesson.status === "mastered"
                  ? "bg-success/15 text-success"
                  : lesson.status === "learning"
                    ? "bg-warning/15 text-warning"
                    : "bg-primary/10 text-primary"
              )}
            >
              <Icon className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-jp text-[10px] tracking-[0.3em] text-muted-foreground">
                {lesson.structure ?? "—"}
              </p>
              <p className="text-base font-semibold leading-tight">
                {lesson.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {lesson.category ?? "Gramática"}
              </p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <Badge variant={statusBadge.tone} className="text-[10px]">
                {statusBadge.label}
              </Badge>
              <span className="tabular-nums">
                Confianza {lesson.confidence}%
              </span>
            </div>
            <Progress value={lesson.confidence} className="h-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
