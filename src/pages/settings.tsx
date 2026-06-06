import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { useTheme } from "@/providers/theme-provider";
import { useUpdateUserProfile, useUserProfile } from "@/hooks/use-user-profile";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
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
      <PageHeader
        eyebrow="設定 — Ajustes"
        title="Ajustes"
        description="Personaliza tu experiencia y tus objetivos diarios."
      />

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Cómo te llamamos y tus objetivos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="reminder">Hora de recordatorio</Label>
              <Input
                id="reminder"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Tema visual de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
