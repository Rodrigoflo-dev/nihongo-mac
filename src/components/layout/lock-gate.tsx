import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MeshBackground } from "@/components/visual/mesh-background";
import { LoadingScreen } from "@/components/visual/loading-screen";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { api } from "@/lib/api";
import { useSession } from "@/stores/session";

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
  const unlocked = useSession((s) => s.unlocked);
  const setUnlocked = useSession((s) => s.unlock);

  if (isLoading || !status) {
    return <LoadingScreen label="にほんご" />;
  }

  if (unlocked) return <>{children}</>;

  if (!status.hasCredential) {
    return (
      <CreateCredential
        onDone={async () => {
          await refetch();
          setUnlocked();
        }}
      />
    );
  }

  return (
    <UnlockScreen
      username={status.username ?? ""}
      onDone={() => setUnlocked()}
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
    <div className="relative h-screen w-screen overflow-y-auto bg-background text-foreground">
      <MeshBackground />
      {/* radial hero glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_50%_-10%,color-mix(in_oklch,var(--color-primary)_18%,transparent)_0%,transparent_60%)]"
      />
      <div className="absolute left-20 right-0 top-0 z-20 h-7" data-tauri-drag-region />

      {/* Brand */}
      <div className="absolute left-8 top-8 z-20 hidden md:block">
        <p className="font-jp text-display-lg-mobile text-xl font-extrabold tracking-tighter text-primary">
          にほんご
        </p>
        <p className="-mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">
          Nihongo · Aether
        </p>
      </div>

      <div className="relative z-10 mx-auto grid min-h-full max-w-6xl items-center gap-stack-lg px-6 py-20 lg:grid-cols-2 lg:gap-12">
        {/* Left: copy + form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="order-2 mx-auto w-full max-w-md lg:order-1"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-md">
            <span className="size-1.5 animate-pulse rounded-full bg-neon-cyan" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon-cyan">
              {eyebrow}
            </span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-prose text-base text-muted-foreground">
            {subtitle}
          </p>

          <div className="mt-7 rounded-3xl glass-strong border border-white/10 p-6">
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary primary-glow">
              {icon}
            </div>
            {children}
          </div>
        </motion.div>

        {/* Right: 3D holo kanji */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="order-1 flex items-center justify-center lg:order-2"
        >
          <HoloKanji size={360} className="max-w-full" />
        </motion.div>
      </div>

      {/* footer status line */}
      <div className="pointer-events-none absolute bottom-5 left-0 z-10 hidden w-full justify-between px-8 md:flex">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          © Nihongo · 夢を追え
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          System Status: <span className="text-neon-cyan">Online</span>
        </p>
      </div>
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
