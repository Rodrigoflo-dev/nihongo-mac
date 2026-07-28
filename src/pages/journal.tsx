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
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { burstLevelUp, burstXp } from "@/components/visual/confetti";
import { usePlayTts } from "@/hooks/use-listening";
import {
  useCreateJournalEntry,
  useDeleteJournalEntry,
  useJournalEntries,
} from "@/hooks/use-journal";
import type { JournalEntry } from "@/lib/api";
import { useT } from "@/lib/i18n";

export default function JournalPage() {
  const t = useT();
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
        eyebrow={t("journal.eyebrow")}
        title={
          <>
            {t("journal.title.a")}{" "}
            <span className="gradient-text">{t("journal.title.b")}</span>
          </>
        }
        description={t("journal.desc")}
      />

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <HudPanel glow className="holo-grid p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-gradient-to-br from-primary/30 via-neon-violet/20 to-transparent blur-3xl"
          />
          <div className="relative flex items-start gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
                <Feather className="size-3.5" />
                {t("journal.newEntry")}
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
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t("journal.chars", { n: text.length })}
                </p>
                <Button
                  disabled={!text.trim() || create.isPending}
                  onClick={handleSubmit}
                  className="bg-gradient-to-br from-primary via-primary to-neon-violet shadow-[0_0_24px_-8px_color-mix(in_oklch,var(--color-primary)_70%,transparent)]"
                >
                  {create.isPending ? (
                    <>
                      <Sparkles className="size-4 animate-pulse" />
                      {t("journal.saving")}
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      {t("journal.save")}
                    </>
                  )}
                </Button>
              </div>
            </div>
            <HoloKanji
              size={150}
              className="hidden shrink-0 self-center lg:block"
              items={[
                { char: "日", meaning: "Día" },
                { char: "記", meaning: "Registro" },
                { char: "書", meaning: "Escribir" },
              ]}
            />
          </div>
        </HudPanel>
      </motion.div>

      {/* Entries */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              {t("journal.history.jp")}
            </p>
            <h2 className="font-display text-lg font-extrabold tracking-tight">
              {t("journal.history")}
            </h2>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {t("journal.entries", { n: entries?.length ?? 0 })}
          </Badge>
        </div>
        {entries?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("journal.empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {entries?.map((e) => (
              <EntryCard key={e.id} entry={e} onDelete={() => remove.mutate(e.id)} t={t} />
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
  t,
}: {
  entry: JournalEntry;
  onDelete: () => void;
  t: (k: string) => string;
}) {
  const play = usePlayTts();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <HudPanel scanline={false} className="group p-5 transition-shadow duration-300 hover:shadow-[0_0_32px_-12px_color-mix(in_oklch,var(--color-primary)_45%,transparent)]">
        <div className="relative space-y-4">
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
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
              <Sparkles className="size-4 shrink-0 text-primary" />
              <span>{entry.aiFeedback}</span>
            </div>
          ) : null}
          {entry.corrections.length > 0 ? (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-amber">
                {t("journal.corrections")}
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
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {new Date(entry.createdAt).toLocaleString("es-ES", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </HudPanel>
    </motion.div>
  );
}
