import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MeshBackground } from "@/components/visual/mesh-background";
import { api } from "@/lib/api";

/**
 * Gates the whole app behind a local username + PIN.
 *
 * - First run (no credential yet) → "create" screen (username + PIN + confirm).
 * - Returning user → "unlock" screen (enter PIN).
 *
 * The unlocked state is session-only (kept in React state), so it resets every
 * time the app launches. Fully offline — see src-tauri/src/commands/auth.rs.
 */
export function LockGate({ children }: { children: React.ReactNode }) {
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ["auth-status"],
    queryFn: () => api.authStatus(),
    staleTime: Infinity,
  });
  const [unlocked, setUnlocked] = useState(false);

  if (isLoading || !status) {
    return (
      <div className="grid h-screen place-items-center bg-background text-muted-foreground">
        <p className="text-sm">読み込み中…</p>
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  if (!status.hasCredential) {
    return (
      <CreateCredential
        onDone={async () => {
          await refetch();
          setUnlocked(true);
        }}
      />
    );
  }

  return (
    <UnlockScreen
      username={status.username ?? ""}
      onDone={() => setUnlocked(true)}
    />
  );
}

function AuthShell({
  eyebrow,
  icon,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid h-screen w-screen place-items-center bg-background text-foreground">
      <MeshBackground />
      <div className="absolute left-20 right-0 top-0 z-10 h-7" data-tauri-drag-region />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-sm px-8"
      >
        <div className="rounded-3xl glass-strong p-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
          <p className="mt-5 font-jp text-[11px] tracking-[0.3em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

function CreateCredential({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError(null);
    if (!username.trim()) return setError("Escribe un nombre de usuario.");
    if (pin.length < 4) return setError("El PIN debe tener al menos 4 dígitos.");
    if (pin !== confirm) return setError("Los PIN no coinciden.");
    setSaving(true);
    try {
      await api.setCredentials(username.trim(), pin);
      onDone();
    } catch (e) {
      setError(String(e));
      setSaving(false);
    }
  };

  return (
    <AuthShell
      eyebrow="ようこそ"
      icon={<ShieldCheck className="size-6" />}
      title="Crea tu acceso"
      subtitle="Protege tu progreso con un usuario y un PIN local. Se guarda solo en este dispositivo."
    >
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Rodrigo"
            className="h-11"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pin">PIN (mín. 4 dígitos)</Label>
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            className="h-11"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="confirm">Confirma el PIN</Label>
          <Input
            id="confirm"
            type="password"
            inputMode="numeric"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="••••"
            className="h-11"
          />
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button size="lg" className="mt-1 w-full" disabled={saving} onClick={submit}>
          {saving ? "Creando…" : "Crear y entrar"}
        </Button>
      </div>
    </AuthShell>
  );
}

function UnlockScreen({
  username,
  onDone,
}: {
  username: string;
  onDone: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    setError(null);
    setChecking(true);
    try {
      const ok = await api.verifyPin(pin);
      if (ok) {
        onDone();
      } else {
        setError("PIN incorrecto.");
        setPin("");
        setChecking(false);
      }
    } catch (e) {
      setError(String(e));
      setChecking(false);
    }
  };

  return (
    <AuthShell
      eyebrow="おかえり"
      icon={<Lock className="size-6" />}
      title={username ? `Hola, ${username}` : "Bienvenido de vuelta"}
      subtitle="Introduce tu PIN para continuar."
    >
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="pin">PIN</Label>
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && pin) submit();
            }}
            placeholder="••••"
            className="h-11"
          />
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button
          size="lg"
          className="mt-1 w-full"
          disabled={checking || !pin}
          onClick={submit}
        >
          {checking ? "Comprobando…" : "Entrar"}
        </Button>
      </div>
    </AuthShell>
  );
}
