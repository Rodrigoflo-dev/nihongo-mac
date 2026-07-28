import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Headphones,
  type LucideIcon,
  Mic,
  ScrollText,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { cn } from "@/lib/utils";
import { useT, type TFn } from "@/lib/i18n";

interface PracticeMode {
  to: string;
  labelKey: string;
  descKey: string;
  jp: string;
  icon: LucideIcon;
  tone: string;
}

// Los tres modos de práctica que antes vivían sueltos en el sidebar. Ahora
// entran por aquí; las páginas destino (/reading, /listening, /speaking) no
// cambian.
const MODES: PracticeMode[] = [
  {
    to: "/reading",
    labelKey: "practica.reading",
    descKey: "practica.readingDesc",
    jp: "読解",
    icon: ScrollText,
    tone: "from-neon-cyan/40 to-primary/20 text-neon-cyan",
  },
  {
    to: "/listening",
    labelKey: "practica.listening",
    descKey: "practica.listeningDesc",
    jp: "聴解",
    icon: Headphones,
    tone: "from-neon-violet/40 to-primary/20 text-neon-violet",
  },
  {
    to: "/speaking",
    labelKey: "practica.speaking",
    descKey: "practica.speakingDesc",
    jp: "会話",
    icon: Mic,
    tone: "from-neon-pink/40 to-neon-violet/20 text-neon-pink",
  },
];

export default function PracticaPage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="flex items-start justify-between gap-8">
        <PageHeader
          eyebrow={t("practica.eyebrow")}
          title={
            <>
              {t("practica.title.a")}{" "}
              <span className="gradient-text">{t("practica.title.b")}</span>
            </>
          }
          description={t("practica.desc")}
        />
        <HoloKanji
          size={170}
          className="hidden lg:block"
          items={[
            { char: "読", meaning: "Leer" },
            { char: "聴", meaning: "Escuchar" },
            { char: "話", meaning: "Hablar" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((mode, i) => (
          <ModeCard key={mode.to} mode={mode} index={i} t={t} />
        ))}
      </div>
    </div>
  );
}

function ModeCard({
  mode,
  index,
  t,
}: {
  mode: PracticeMode;
  index: number;
  t: TFn;
}) {
  const { icon: Icon } = mode;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        to={mode.to}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass-strong p-5 transition-shadow hover:shadow-[0_0_32px_-12px_color-mix(in_oklch,var(--color-primary)_70%,transparent)]"
      >
        {/* glow blob */}
        <div
          className={cn(
            "pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition-opacity group-hover:opacity-70",
            mode.tone
          )}
        />
        {/* hover corner brackets */}
        <span className="hud-corner left-2 top-2 border-l-2 border-t-2 opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="hud-corner right-2 top-2 border-r-2 border-t-2 opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative flex items-center justify-between">
          <div
            className={cn(
              "grid size-12 place-items-center rounded-2xl bg-gradient-to-br transition-transform group-hover:scale-110",
              mode.tone
            )}
          >
            <Icon className="size-6" />
          </div>
          <span className="font-jp text-2xl text-sidebar-foreground/25 transition-colors group-hover:text-sidebar-foreground/45">
            {mode.jp}
          </span>
        </div>

        <h2 className="relative mt-4 font-display text-xl font-extrabold tracking-tight">
          {t(mode.labelKey)}
        </h2>
        <p className="relative mt-1.5 flex-1 text-sm text-muted-foreground">
          {t(mode.descKey)}
        </p>

        <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          {t("common.start")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}
