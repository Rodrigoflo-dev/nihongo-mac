import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { useTheme } from "@/providers/theme-provider";
import { UI_SCALE_OPTIONS, useUiScale } from "@/providers/ui-scale";
import { useLanguage, type LangMode } from "@/stores/language";
import { useT } from "@/lib/i18n";
import { useUpdateUserProfile, useUserProfile } from "@/hooks/use-user-profile";
import {
  getPreferredVoiceName,
  listVoicesByLang,
  setPreferredVoiceName,
  speakJapanese,
  speakText,
  ttsSupported,
  type VoiceKind,
} from "@/lib/tts";

export default function SettingsPage() {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const { scale, setScale } = useUiScale();
  const { data: profile } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  const [name, setName] = useState("");
  const [dailyGoal, setDailyGoal] = useState(20);
  const [reminderTime, setReminderTime] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setDailyGoal(profile.dailyMinutesGoal);
    setReminderTime(profile.reminderTime ?? "");
  }, [profile]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title={t("nav.settings")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="flex items-start justify-between gap-8">
        <PageHeader
          eyebrow={t("settings.eyebrow")}
          title={<span className="gradient-text">{t("settings.title")}</span>}
          description={t("settings.desc")}
        />
        <HoloKanji
          size={160}
          className="hidden lg:block"
          items={[
            { char: "設", meaning: "Ajustes" },
            { char: "目", meaning: "Objetivo" },
            { char: "色", meaning: "Tema" },
          ]}
        />
      </div>

      <HudPanel glow className="p-6">
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              {t("settings.profile.jp")}
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
              {t("settings.profile.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("settings.profile.desc")}
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("settings.profile.name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("settings.profile.namePh")}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="goal">{t("settings.profile.goal")}</Label>
                <Input
                  id="goal"
                  type="number"
                  min={5}
                  max={180}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("settings.profile.reminder")}</Label>
                <ReminderTimePicker
                  value={reminderTime}
                  onChange={setReminderTime}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              {updateProfile.isSuccess && !updateProfile.isPending ? (
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-success">
                  {t("settings.saved")}
                </span>
              ) : null}
              {updateProfile.isError ? (
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-destructive">
                  {t("settings.saveError")}
                </span>
              ) : null}
              <Button
                disabled={updateProfile.isPending}
                onClick={() =>
                  updateProfile.mutate({
                    name,
                    dailyMinutesGoal: dailyGoal,
                    reminderTime: reminderTime || null,
                  })
                }
              >
                {updateProfile.isPending ? t("settings.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      </HudPanel>

      <HudPanel className="p-6">
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              {t("settings.appearance.jp")}
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
              {t("settings.appearance.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("settings.appearance.desc")}
            </p>
          </div>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((th) => (
              <Button
                key={th}
                variant={theme === th ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(th)}
              >
                {t(`settings.theme.${th}`)}
              </Button>
            ))}
          </div>

          {/* Accessibility zoom — bigger fonts + boxes everywhere */}
          <div className="border-t border-border/50 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
                  {t("settings.size.jp")}
                </p>
                <h3 className="mt-1 font-display text-base font-bold tracking-tight">
                  {t("settings.size.title")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("settings.size.desc")}
                </p>
              </div>
              <span
                aria-hidden
                className="select-none font-display font-extrabold leading-none text-neon-cyan"
                style={{ fontSize: `${1.5 * scale}rem` }}
              >
                あA
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {UI_SCALE_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={scale === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScale(opt.value)}
                  title={opt.hint}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </HudPanel>

      <HudPanel className="p-6">
        <div className="space-y-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              {t("settings.language.jp")}
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
              {t("settings.language.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("settings.language.desc")}
            </p>
          </div>
          <LanguageSettings />
        </div>
      </HudPanel>

      <HudPanel className="p-6">
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              {t("settings.voice.jp")}
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
              {t("settings.voice.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("settings.voice.desc")}
            </p>
          </div>
          <VoiceSettings />
        </div>
      </HudPanel>
    </div>
  );
}

const LANG_OPTIONS: { value: LangMode }[] = [
  { value: "es" },
  { value: "en" },
  { value: "system" },
];

/** App language picker (Spanish / English / follow system). */
function LanguageSettings() {
  const t = useT();
  const mode = useLanguage((s) => s.mode);
  const lang = useLanguage((s) => s.lang);
  const setMode = useLanguage((s) => s.setMode);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {LANG_OPTIONS.map((o) => (
          <Button
            key={o.value}
            variant={mode === o.value ? "default" : "outline"}
            size="sm"
            onClick={() => setMode(o.value)}
          >
            {t(`lang.${o.value}`)}
          </Button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {t("settings.language.now")}{" "}
        <span className="font-semibold text-foreground">
          {t(lang === "es" ? "settings.language.pair.es" : "settings.language.pair.en")}
        </span>
        {mode === "system" ? ` ${t("settings.language.system")}` : ""}.
      </p>
    </div>
  );
}

const VOICE_ROWS: { kind: VoiceKind; labelKey: string; jp: string; sample: string }[] =
  [
    { kind: "ja", labelKey: "settings.voice.ja", jp: "日本語", sample: "こんにちは。日本語を勉強しましょう。" },
    { kind: "es", labelKey: "settings.voice.es", jp: "スペイン語", sample: "Hola, así se escucha la voz en español." },
    { kind: "en", labelKey: "settings.voice.en", jp: "英語", sample: "Hello, this is how the English voice sounds." },
  ];

/** Per-language voice picker + "Probar" preview. */
function VoiceSettings() {
  const t = useT();
  const [voices, setVoices] = useState<Record<
    VoiceKind,
    SpeechSynthesisVoice[]
  > | null>(null);
  const [selected, setSelected] = useState<Record<VoiceKind, string>>({
    ja: getPreferredVoiceName("ja") ?? "",
    es: getPreferredVoiceName("es") ?? "",
    en: getPreferredVoiceName("en") ?? "",
  });

  useEffect(() => {
    let ok = true;
    listVoicesByLang().then((v) => {
      if (ok) setVoices(v);
    });
    return () => {
      ok = false;
    };
  }, []);

  if (!ttsSupported()) {
    return (
      <p className="text-sm text-muted-foreground">
        Tu sistema no soporta síntesis de voz.
      </p>
    );
  }

  const change = (kind: VoiceKind, name: string) => {
    setSelected((s) => ({ ...s, [kind]: name }));
    setPreferredVoiceName(kind, name || null);
  };
  const test = (kind: VoiceKind, sample: string) => {
    if (kind === "ja") speakJapanese(sample).catch(() => {});
    else speakText(sample, kind).catch(() => {});
  };

  return (
    <div className="space-y-4">
      {VOICE_ROWS.map((row) => {
        const list = voices?.[row.kind] ?? [];
        return (
          <div
            key={row.kind}
            className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-4 first:border-t-0 first:pt-0"
          >
            <div className="w-24 shrink-0">
              <p className="font-display text-sm font-bold">{t(row.labelKey)}</p>
              <p className="font-jp text-[11px] text-muted-foreground">
                {row.jp}
              </p>
            </div>
            {list.length > 0 ? (
              <>
                <select
                  aria-label={t(row.labelKey)}
                  value={selected[row.kind]}
                  onChange={(e) => change(row.kind, e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-input bg-card/60 px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">{t("settings.voice.auto")}</option>
                  {list.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} · {v.lang}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => test(row.kind, row.sample)}
                >
                  <Volume2 className="size-3.5" /> {t("settings.test")}
                </Button>
              </>
            ) : (
              <p className="flex-1 text-xs text-muted-foreground">
                {t("settings.voice.none", { lang: t(row.labelKey).toLowerCase() })}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Robust time picker using two dropdowns. The native <input type="time"> is
 * unreliable inside Tauri's macOS WKWebView (the user couldn't edit it), so we
 * drive hour + minute via <select> and compose an "HH:MM" string. An "Apagado"
 * toggle clears the reminder (empty value).
 */
function ReminderTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const enabled = Boolean(value);
  const [hh = "08", mm = "00"] = (value || "08:00").split(":");

  const setPart = (nextHh: string, nextMm: string) =>
    onChange(`${nextHh}:${nextMm}`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(enabled ? "" : "08:00")}
        className={
          "rounded-lg border px-3 py-2 text-xs font-medium transition-colors " +
          (enabled
            ? "border-primary/50 bg-primary/15 text-primary"
            : "border-border bg-card/60 text-muted-foreground hover:bg-accent/30")
        }
      >
        {enabled ? "Activado" : "Apagado"}
      </button>
      <select
        aria-label="Hora"
        disabled={!enabled}
        value={hh}
        onChange={(e) => setPart(e.target.value, mm)}
        className="rounded-lg border border-input bg-card/60 px-3 py-2 text-sm tabular-nums outline-none focus:border-primary disabled:opacity-40"
      >
        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map(
          (h) => (
            <option key={h} value={h}>
              {h}
            </option>
          )
        )}
      </select>
      <span className="text-muted-foreground">:</span>
      <select
        aria-label="Minutos"
        disabled={!enabled}
        value={mm}
        onChange={(e) => setPart(hh, e.target.value)}
        className="rounded-lg border border-input bg-card/60 px-3 py-2 text-sm tabular-nums outline-none focus:border-primary disabled:opacity-40"
      >
        {["00", "15", "30", "45"].map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
