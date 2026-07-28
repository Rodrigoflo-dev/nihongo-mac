import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, Star, Target } from "lucide-react";

import { ChoiceGrid } from "@/components/onboarding/choice-grid";
import { PlacementExam } from "@/components/onboarding/placement-exam";
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
import { api, type JlptLevel } from "@/lib/api";
import { useLanguage, type LangMode } from "@/stores/language";
import { useT } from "@/lib/i18n";

type Step =
  | "welcome"
  | "language"
  | "kana"
  | "current-level"
  | "target-level"
  | "minutes"
  | "reminder"
  | "ready";

// Note: there is no "name" step — the learner already chose a username (+ PIN)
// at the lock screen, so we greet them with that instead of asking twice.
const STEP_ORDER: Step[] = [
  "welcome",
  "language",
  "kana",
  "current-level",
  "target-level",
  "minutes",
  "reminder",
  "ready",
];

const LANGUAGE_CHOICES: {
  value: LangMode;
  jp: string;
  descKey: string;
}[] = [
  { value: "es", jp: "スペイン語", descKey: "onb.lang.es.desc" },
  { value: "en", jp: "英語", descKey: "onb.lang.en.desc" },
  { value: "system", jp: "自動", descKey: "onb.lang.system.desc" },
];

const LEVELS: { value: JlptLevel; jp: string; descKey: string }[] = [
  { value: "N5", jp: "ごじゅう", descKey: "onb.level.basic" },
  { value: "N4", jp: "よんきゅう", descKey: "onb.level.simple" },
  { value: "N3", jp: "さんきゅう", descKey: "onb.level.intermediate" },
  { value: "N2", jp: "にきゅう", descKey: "onb.level.advanced" },
  { value: "N1", jp: "いっきゅう", descKey: "onb.level.mastery" },
];

const MINUTE_OPTIONS: { value: string; label: string; descKey: string }[] =
  [
    { value: "10", label: "10 min", descKey: "onb.min.streak" },
    { value: "15", label: "15 min", descKey: "onb.min.habit" },
    { value: "20", label: "20 min", descKey: "onb.min.balanced" },
    { value: "30", label: "30 min", descKey: "onb.min.serious" },
    { value: "45", label: "45 min", descKey: "onb.min.immersion" },
    { value: "60", label: "60 min", descKey: "onb.min.accelerator" },
  ];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useUserProfile();
  const { data: auth, isLoading: authLoading } = useQuery({
    queryKey: ["auth-status"],
    queryFn: () => api.authStatus(),
    staleTime: Infinity,
  });
  const completeOnboarding = useCompleteOnboarding();
  const t = useT();

  const [stepIndex, setStepIndex] = useState(0);
  const [knowsHiragana, setKnowsHiragana] = useState(false);
  const [knowsKatakana, setKnowsKatakana] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<JlptLevel>("N5");
  const [targetLevel, setTargetLevel] = useState<JlptLevel>("N3");
  const [minutes, setMinutes] = useState<string>("20");
  const [reminder, setReminder] = useState<string>("");
  const [takingExam, setTakingExam] = useState(false);
  const langMode = useLanguage((s) => s.mode);
  const setLangMode = useLanguage((s) => s.setMode);

  // The learner already picked a username at the lock screen — reuse it as the
  // display name instead of asking again.
  const name = useMemo(
    () => auth?.username?.trim() || t("dash.learner"),
    [auth?.username, t]
  );
  // "Ninguno" is simply neither silabario selected.
  const knowsNone = !knowsHiragana && !knowsKatakana;

  if (isLoading || authLoading) return null;
  if (profile?.onboardedAt) return <Navigate to="/" replace />;

  const step = STEP_ORDER[stepIndex];
  const total = STEP_ORDER.length;

  const next = () => setStepIndex((i) => Math.min(total - 1, i + 1));
  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  // The placement test takes over the whole screen when requested.
  if (takingExam) {
    return (
      <PlacementExam
        onResult={(level) => {
          setCurrentLevel(level);
          setTakingExam(false);
          next();
        }}
        onCancel={() => setTakingExam(false)}
      />
    );
  }

  const handleComplete = async () => {
    await completeOnboarding.mutateAsync({
      name,
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
              {t("onb.welcome.title.a", { name })}{" "}
              <span className="text-primary">Michi</span>
            </>
          }
          description={t("onb.welcome.desc")}
          primaryLabel={t("onb.start")}
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
              <FeaturePill icon={<Target className="size-4" />} label={t("onb.welcome.feat1")} />
              <FeaturePill icon={<Star className="size-4" />} label={t("onb.welcome.feat2")} />
              <FeaturePill icon={<Sparkles className="size-4" />} label={t("onb.welcome.feat3")} />
            </motion.div>
          </div>
        </StepShell>
      );

    case "language":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="言語"
          title={t("onb.lang.title")}
          description={t("onb.lang.desc")}
          canGoBack
          onBack={back}
          primaryLabel={t("common.continue")}
          onPrimary={next}
        >
          <ChoiceGrid
            value={langMode}
            onChange={(v) => setLangMode(v)}
            options={LANGUAGE_CHOICES.map((o) => ({
              value: o.value,
              jp: o.jp,
              label: t(`lang.${o.value}`),
              description: t(o.descKey),
            }))}
            columns={3}
          />
        </StepShell>
      );

    case "kana":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="仮名"
          title={t("onb.kana.title")}
          description={t("onb.kana.desc")}
          canGoBack
          onBack={back}
          primaryLabel={t("common.continue")}
          onPrimary={next}
        >
          <div className="space-y-3">
            <ToggleCard
              value={knowsHiragana}
              onChange={setKnowsHiragana}
              title="Hiragana"
              jp="ひらがな"
              description={t("onb.kana.hiragana")}
              sample="あ"
            />
            <ToggleCard
              value={knowsKatakana}
              onChange={setKnowsKatakana}
              title="Katakana"
              jp="カタカナ"
              description={t("onb.kana.katakana")}
              sample="ア"
            />
            <ToggleCard
              value={knowsNone}
              onChange={(v) => {
                if (v) {
                  setKnowsHiragana(false);
                  setKnowsKatakana(false);
                }
              }}
              title={t("onb.kana.none")}
              jp="まだ"
              description={t("onb.kana.noneDesc")}
              sample="◎"
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
          title={t("onb.curLevel.title")}
          description={t("onb.curLevel.desc")}
          canGoBack
          onBack={back}
          primaryLabel={t("common.continue")}
          onPrimary={next}
        >
          <ChoiceGrid
            value={currentLevel}
            onChange={(v) => setCurrentLevel(v)}
            options={LEVELS.map((l) => ({
              value: l.value,
              label: l.value,
              jp: l.jp,
              description: t(l.descKey),
            }))}
            columns={5}
          />

          <button
            type="button"
            onClick={() => setTakingExam(true)}
            className="group mt-4 flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left transition-all hover:border-primary/60 hover:bg-primary/10"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary transition-transform group-hover:scale-110">
              <GraduationCap className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                {t("onb.curLevel.exam")}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t("onb.curLevel.examDesc")}
              </span>
            </span>
          </button>
        </StepShell>
      );

    case "target-level":
      return (
        <StepShell
          step={stepIndex}
          total={total}
          eyebrow="目標"
          title={t("onb.targetLevel.title")}
          description={t("onb.targetLevel.desc")}
          canGoBack
          onBack={back}
          primaryLabel={t("common.continue")}
          onPrimary={next}
        >
          <ChoiceGrid
            value={targetLevel}
            onChange={(v) => setTargetLevel(v)}
            options={LEVELS.map((l) => ({
              value: l.value,
              label: l.value,
              jp: l.jp,
              description: t(l.descKey),
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
          title={t("onb.minutes.title")}
          description={t("onb.minutes.desc")}
          canGoBack
          onBack={back}
          primaryLabel={t("common.continue")}
          onPrimary={next}
        >
          <ChoiceGrid
            value={minutes}
            onChange={(v) => setMinutes(v)}
            options={MINUTE_OPTIONS.map((m) => ({
              value: m.value,
              label: m.label,
              description: t(m.descKey),
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
          title={t("onb.reminder.title")}
          description={t("onb.reminder.desc")}
          canGoBack
          onBack={back}
          primaryLabel={t("common.continue")}
          onPrimary={next}
          secondaryLabel={t("onb.reminder.skip")}
          onSecondary={() => {
            setReminder("");
            next();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="reminder">{t("onb.reminder.label")}</Label>
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
          title={t("onb.ready.title")}
          description={t("onb.ready.desc")}
          canGoBack
          onBack={back}
          primaryLabel={
            completeOnboarding.isPending
              ? t("onb.ready.creating")
              : t("onb.ready.create")
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
                {t("onb.ready.yourPlan")}
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
                <dt className="text-muted-foreground">{t("onb.ready.name")}</dt>
                <dd className="font-medium">{name || "—"}</dd>
                <dt className="text-muted-foreground">{t("onb.ready.curLevel")}</dt>
                <dd className="font-medium text-neon-cyan">{currentLevel}</dd>
                <dt className="text-muted-foreground">{t("onb.ready.goal")}</dt>
                <dd className="font-medium text-neon-violet">{targetLevel}</dd>
                <dt className="text-muted-foreground">Hiragana</dt>
                <dd className="font-medium">
                  {knowsHiragana ? t("onb.ready.known") : t("onb.ready.fromZero")}
                </dd>
                <dt className="text-muted-foreground">Katakana</dt>
                <dd className="font-medium">
                  {knowsKatakana ? t("onb.ready.known") : t("onb.ready.fromZero")}
                </dd>
                <dt className="text-muted-foreground">{t("onb.ready.dailyGoal")}</dt>
                <dd className="font-medium">{minutes} min</dd>
                <dt className="text-muted-foreground">{t("onb.ready.reminder")}</dt>
                <dd className="font-medium">
                  {reminder ? reminder : t("onb.ready.noReminder")}
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

