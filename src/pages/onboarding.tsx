import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Star, Target } from "lucide-react";

import { ChoiceGrid } from "@/components/onboarding/choice-grid";
import { StepShell } from "@/components/onboarding/step-shell";
import { ToggleCard } from "@/components/onboarding/toggle-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { HudPanel } from "@/components/visual/hud-panel";
import {
  useCompleteOnboarding,
  useUserProfile,
} from "@/hooks/use-user-profile";
import type { JlptLevel } from "@/lib/api";

type Step =
  | "welcome"
  | "name"
  | "kana"
  | "current-level"
  | "target-level"
  | "minutes"
  | "reminder"
  | "ready";

const STEP_ORDER: Step[] = [
  "welcome",
  "name",
  "kana",
  "current-level",
  "target-level",
  "minutes",
  "reminder",
  "ready",
];

const LEVELS: { value: JlptLevel; jp: string; description: string }[] = [
  { value: "N5", jp: "ごじゅう", description: "Lo más básico" },
  { value: "N4", jp: "よんきゅう", description: "Conversaciones simples" },
  { value: "N3", jp: "さんきゅう", description: "Intermedio" },
  { value: "N2", jp: "にきゅう", description: "Avanzado" },
  { value: "N1", jp: "いっきゅう", description: "Maestría" },
];

const MINUTE_OPTIONS: { value: string; label: string; description: string }[] =
  [
    { value: "10", label: "10 min", description: "Para mantener la racha" },
    { value: "15", label: "15 min", description: "Hábito diario" },
    { value: "20", label: "20 min", description: "Equilibrado (recomendado)" },
    { value: "30", label: "30 min", description: "Ritmo serio" },
    { value: "45", label: "45 min", description: "Inmersión" },
    { value: "60", label: "60 min", description: "Acelerador" },
  ];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useUserProfile();
  const completeOnboarding = useCompleteOnboarding();

  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [knowsHiragana, setKnowsHiragana] = useState(false);
  const [knowsKatakana, setKnowsKatakana] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<JlptLevel>("N5");
  const [targetLevel, setTargetLevel] = useState<JlptLevel>("N3");
  const [minutes, setMinutes] = useState<string>("20");
  const [reminder, setReminder] = useState<string>("");

  if (isLoading) return null;
  if (profile?.onboardedAt) return <Navigate to="/" replace />;

  const step = STEP_ORDER[stepIndex];
  const total = STEP_ORDER.length;

  const next = () => setStepIndex((i) => Math.min(total - 1, i + 1));
  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  const handleComplete = async () => {
    await completeOnboarding.mutateAsync({
      name: name.trim() || "Estudiante",
      knowsHiragana,
      knowsKatakana,
      currentLevel,
      targetLevel,
      dailyMinutesGoal: Number(minutes),
      reminderTime: reminder || null,
    });
    navigate("/", { replace: true });
  };

  // -----------------------------------------------------------------------
  // Step content
  // -----------------------------------------------------------------------
  switch (step) {
    case "welcome":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="ようこそ"
          title={
            <>
              Bienvenido a <span className="text-primary">Nihongo</span>
            </>
          }
          description="Tu compañero personal para aprender japonés con constancia. Vamos a configurar tu plan en menos de un minuto."
          primaryLabel="Comenzar"
          onPrimary={next}
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="hidden justify-center sm:flex"
            >
              <HoloKanji
                size={170}
                interval={2600}
                items={[
                  { char: "日", meaning: "Japón" },
                  { char: "本", meaning: "Origen" },
                  { char: "語", meaning: "Idioma" },
                  { char: "学", meaning: "Aprender" },
                ]}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-3 gap-3"
            >
              <FeaturePill icon={<Target className="size-4" />} label="Misiones diarias" />
              <FeaturePill icon={<Star className="size-4" />} label="Sube de nivel" />
              <FeaturePill icon={<Sparkles className="size-4" />} label="Aprende por situaciones" />
            </motion.div>
          </div>
        </StepShell>
      );

    case "name":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="お名前"
          title="¿Cómo te llamas?"
          description="Lo usaré para saludarte cada día."
          canGoBack
          onBack={back}
          primaryLabel="Continuar"
          primaryDisabled={!name.trim()}
          onPrimary={next}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) next();
              }}
              placeholder="Rodrigo"
              className="h-12 text-base"
            />
          </div>
        </StepShell>
      );

    case "kana":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="仮名"
          title="¿Qué silabarios ya conoces?"
          description="Si no los conoces, los integraré en tu plan diario antes que cualquier kanji."
          canGoBack
          onBack={back}
          primaryLabel="Continuar"
          onPrimary={next}
        >
          <div className="space-y-3">
            <ToggleCard
              value={knowsHiragana}
              onChange={setKnowsHiragana}
              title="Hiragana"
              jp="ひらがな"
              description="El silabario base del japonés"
              sample="あ"
            />
            <ToggleCard
              value={knowsKatakana}
              onChange={setKnowsKatakana}
              title="Katakana"
              jp="カタカナ"
              description="Para préstamos del extranjero"
              sample="ア"
            />
          </div>
        </StepShell>
      );

    case "current-level":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="今のレベル"
          title="¿En qué punto estás?"
          description="Sé honesto. Empezar bajo es mucho mejor que aburrirse o frustrarse."
          canGoBack
          onBack={back}
          primaryLabel="Continuar"
          onPrimary={next}
        >
          <ChoiceGrid
            value={currentLevel}
            onChange={(v) => setCurrentLevel(v)}
            options={LEVELS.map((l) => ({
              value: l.value,
              label: l.value,
              jp: l.jp,
              description: l.description,
            }))}
            columns={5}
          />
        </StepShell>
      );

    case "target-level":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="目標"
          title="¿Cuál es tu meta?"
          description="Esto define hacia dónde escala el contenido. Puedes cambiarlo cuando quieras."
          canGoBack
          onBack={back}
          primaryLabel="Continuar"
          onPrimary={next}
        >
          <ChoiceGrid
            value={targetLevel}
            onChange={(v) => setTargetLevel(v)}
            options={LEVELS.map((l) => ({
              value: l.value,
              label: l.value,
              jp: l.jp,
              description: l.description,
            }))}
            columns={5}
          />
        </StepShell>
      );

    case "minutes":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="毎日"
          title="¿Cuánto tiempo al día?"
          description="La constancia gana al volumen. Elige algo realista que puedas mantener."
          canGoBack
          onBack={back}
          primaryLabel="Continuar"
          onPrimary={next}
        >
          <ChoiceGrid
            value={minutes}
            onChange={(v) => setMinutes(v)}
            options={MINUTE_OPTIONS.map((m) => ({
              value: m.value,
              label: m.label,
              description: m.description,
            }))}
            columns={3}
          />
        </StepShell>
      );

    case "reminder":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="通知"
          title="¿A qué hora te aviso?"
          description="Notificación nativa de macOS para mantener tu racha. Puedes saltarlo si prefieres."
          canGoBack
          onBack={back}
          primaryLabel="Continuar"
          onPrimary={next}
          secondaryLabel="Saltar"
          onSecondary={() => {
            setReminder("");
            next();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="reminder">Hora del recordatorio</Label>
            <Input
              id="reminder"
              type="time"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="h-12 text-base"
            />
          </div>
        </StepShell>
      );

    case "ready":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="準備完了"
          title="Todo listo, がんばって"
          description="Tu plan diario se generará al abrir el dashboard. Empezamos pulsando crear."
          canGoBack
          onBack={back}
          primaryLabel={
            completeOnboarding.isPending ? "Creando…" : "Crear mi plan"
          }
          primaryLoading={completeOnboarding.isPending}
          onPrimary={handleComplete}
        >
          <HudPanel glow className="p-5">
            <div className="relative">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
                <span className="font-jp">あなたのプラン</span>
              </p>
              <h3 className="mt-1 font-display text-lg font-extrabold tracking-tight">
                Tu plan
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Nombre</dt>
                <dd className="font-medium">{name || "—"}</dd>
                <dt className="text-muted-foreground">Nivel actual</dt>
                <dd className="font-medium text-neon-cyan">{currentLevel}</dd>
                <dt className="text-muted-foreground">Objetivo</dt>
                <dd className="font-medium text-neon-violet">{targetLevel}</dd>
                <dt className="text-muted-foreground">Hiragana</dt>
                <dd className="font-medium">
                  {knowsHiragana ? "Conocido" : "Empezar desde cero"}
                </dd>
                <dt className="text-muted-foreground">Katakana</dt>
                <dd className="font-medium">
                  {knowsKatakana ? "Conocido" : "Empezar desde cero"}
                </dd>
                <dt className="text-muted-foreground">Meta diaria</dt>
                <dd className="font-medium">{minutes} min</dd>
                <dt className="text-muted-foreground">Recordatorio</dt>
                <dd className="font-medium">
                  {reminder ? reminder : "Sin recordatorio"}
                </dd>
              </dl>
            </div>
          </HudPanel>
        </StepShell>
      );
  }
}

function FeaturePill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-primary/20 glass px-3 py-4 text-center"
    >
      <span className="hud-corner left-2 top-2 border-l-2 border-t-2" />
      <span className="hud-corner bottom-2 right-2 border-b-2 border-r-2" />
      <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-neon-cyan shadow-[0_0_18px_-4px_color-mix(in_oklch,var(--color-primary)_60%,transparent)] transition-transform group-hover:scale-110">
        {icon}
      </div>
      <p className="text-xs font-medium">{label}</p>
    </motion.div>
  );
}

