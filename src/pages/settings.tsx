import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { HudPanel } from "@/components/visual/hud-panel";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { useTheme } from "@/providers/theme-provider";
import { UI_SCALE_OPTIONS, useUiScale } from "@/providers/ui-scale";
import { useUpdateUserProfile, useUserProfile } from "@/hooks/use-user-profile";

export default function SettingsPage() {
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
        <PageHeader title="Ajustes" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="flex items-start justify-between gap-8">
        <PageHeader
          eyebrow="設定 — Ajustes"
          title={
            <>
              Tus <span className="gradient-text">Ajustes</span>
            </>
          }
          description="Personaliza tu experiencia y tus objetivos diarios."
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
              プロフィール
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
              Perfil
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cómo te llamamos y tus objetivos.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="goal">Minutos diarios objetivo</Label>
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
                <Label>Hora de recordatorio</Label>
                <ReminderTimePicker
                  value={reminderTime}
                  onChange={setReminderTime}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              {updateProfile.isSuccess && !updateProfile.isPending ? (
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-success">
                  ✓ Guardado
                </span>
              ) : null}
              {updateProfile.isError ? (
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-destructive">
                  Error al guardar
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
                {updateProfile.isPending ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </div>
      </HudPanel>

      <HudPanel className="p-6">
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
              外観
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
              Apariencia
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tema visual de la aplicación.
            </p>
          </div>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button
                key={t}
                variant={theme === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(t)}
              >
                {t === "light" ? "Claro" : t === "dark" ? "Oscuro" : "Sistema"}
              </Button>
            ))}
          </div>

          {/* Accessibility zoom — bigger fonts + boxes everywhere */}
          <div className="border-t border-border/50 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan">
                  文字サイズ
                </p>
                <h3 className="mt-1 font-display text-base font-bold tracking-tight">
                  Tamaño de letra y cuadros
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Agranda todo de golpe — útil para leer cómodo o pantallas
                  grandes. Se guarda en tu equipo.
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
