import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { RomajiLine } from "@/components/lesson/romaji-line";
import type { KanjiListItem } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useLanguage } from "@/stores/language";

interface KanjiTileProps {
  item: KanjiListItem;
  onClick?: () => void;
  active?: boolean;
}

const STATUS_LABEL: Record<string, { key: string; tone: string }> = {
  new: { key: "kanjiTile.new", tone: "secondary" },
  learning: { key: "kanjiTile.learning", tone: "warning" },
  mastered: { key: "kanjiTile.mastered", tone: "success" },
  leech: { key: "kanjiTile.hard", tone: "destructive" },
};

export function KanjiTile({ item, onClick, active }: KanjiTileProps) {
  const t = useT();
  const lang = useLanguage((s) => s.lang);
  const status = STATUS_LABEL[item.status] ?? STATUS_LABEL.new;
  const { kanji } = item;
  const meaning =
    lang === "en" && kanji.meaningEn ? kanji.meaningEn : kanji.meaningEs;

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group flex flex-col items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all",
        "hover:border-primary/40 hover:bg-accent/40",
        active && "border-primary ring-2 ring-primary/20 bg-primary/5"
      )}
    >
      <div className="flex w-full items-start justify-between">
        <span className="font-jp text-4xl leading-none">{kanji.character}</span>
        <Badge variant={status.tone as never} className="text-[10px]">
          {t(status.key)}
        </Badge>
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{meaning}</p>
        <p className="font-jp text-xs text-muted-foreground">
          {[...kanji.onyomi, ...kanji.kunyomi].slice(0, 2).join(" · ") || "—"}
        </p>
        <RomajiLine
          reading={[...kanji.onyomi, ...kanji.kunyomi].slice(0, 2).join(" · ")}
          className="text-[10px]"
        />
      </div>
    </motion.button>
  );
}
