import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Feather,
  Send,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";
import { usePlayTts } from "@/hooks/use-listening";
import {
  useCreateJournalEntry,
  useDeleteJournalEntry,
  useJournalEntries,
} from "@/hooks/use-journal";
import type { JournalEntry } from "@/lib/api";

export default function JournalPage() {
  const { data: entries } = useJournalEntries();
  const create = useCreateJournalEntry();
  const remove = useDeleteJournalEntry();
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    const res = await create.mutateAsync(text.trim());
    setText("");
    burstXp();
    if (res.award.leveledUp) burstLevelUp();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PageHeader
        eyebrow="日記 — Diario"
        title={
          <>
            Escribe tu día <span className="gradient-text">en japonés</span>
          </>
        }
        description="Una sola frase basta. Escribe en japonés cada día y recibe consejos para mejorar tu constancia y estilo."
      />

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl glass-strong p-6"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <Feather className="size-3.5" />
          Nueva entrada
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="今日は…"
          className="mt-3 w-full resize-none bg-transparent font-jp text-xl leading-relaxed outline-none placeholder:text-muted-foreground/40"
          autoFocus
        />
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {text.length} caracteres
          </p>
          <Button
            disabled={!text.trim() || create.isPending}
            onClick={handleSubmit}
            className="bg-gradient-to-br from-primary via-primary to-neon-violet"
          >
            {create.isPending ? (
              <>
                <Sparkles className="size-4 animate-pulse" />
                Guardando…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Guardar entrada
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Entries */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Historial</h2>
          <Badge variant="outline" className="text-[10px]">
            {entries?.length ?? 0} entradas
          </Badge>
        </div>
        {entries?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no has escrito nada. Empieza con una frase corta.
          </p>
        ) : (
          <div className="space-y-3">
            {entries?.map((e) => (
              <EntryCard key={e.id} entry={e} onDelete={() => remove.mutate(e.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EntryCard({
  entry,
  onDelete,
}: {
  entry: JournalEntry;
  onDelete: () => void;
}) {
  const play = usePlayTts();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 rounded-2xl glass p-5"
    >
      <div className="flex items-start justify-between">
        <p className="font-jp text-base leading-relaxed">{entry.textJp}</p>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              play.mutate({ text: entry.textJp, voice: "Kyoko", rate: 160 })
            }
          >
            <Volume2 className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {entry.textTranslation ? (
        <p className="text-sm text-muted-foreground">{entry.textTranslation}</p>
      ) : null}
      {entry.aiFeedback ? (
        <div className="flex items-start gap-3 rounded-xl bg-primary/5 px-3 py-2 text-sm">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <span>{entry.aiFeedback}</span>
        </div>
      ) : null}
      {entry.corrections.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Correcciones
          </p>
          {entry.corrections.map((c, idx) => (
            <div
              key={idx}
              className="space-y-1 rounded-xl border border-warning/30 bg-warning/5 px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-jp text-base text-destructive line-through">
                  {c.original}
                </span>
                <span className="font-jp text-base text-success">
                  → {c.corrected}
                </span>
                {c.category ? (
                  <Badge variant="outline" className="text-[10px]">
                    {c.category}
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{c.explanation}</p>
            </div>
          ))}
        </div>
      ) : entry.aiFeedback ? null : (
        <p className="text-xs text-success">
          <Check className="mr-1 inline size-3" />
          Sin correcciones
        </p>
      )}
      <p className="text-[10px] text-muted-foreground">
        {new Date(entry.createdAt).toLocaleString("es-ES", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
    </motion.div>
  );
}
