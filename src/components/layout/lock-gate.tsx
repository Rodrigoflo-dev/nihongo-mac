import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MeshBackground } from "@/components/visual/mesh-background";
import { AetherParticles } from "@/components/visual/aether-particles";
import { LoadingScreen } from "@/components/visual/loading-screen";
import { HoloKanji } from "@/components/visual/holo-kanji";
import { TitleBarDrag } from "@/components/layout/titlebar-drag";
import { useT } from "@/lib/i18n";
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
// Cyberpunk styling for the login form controls (neon focus + gradient CTA),
// applied only to these instances so the shared UI components stay untouched.
const CYBER_INPUT =
  "h-12 border-neon-cyan/25 bg-background/60 text-base transition-colors focus-visible:border-neon-cyan/60 focus-visible:ring-neon-cyan/40";
const CYBER_BUTTON =
  "mt-1 w-full border border-neon-cyan/40 bg-gradient-to-r from-neon-violet via-primary to-neon-cyan font-semibold tracking-wide text-primary-foreground shadow-[0_0_30px_-6px_color-mix(in_oklch,var(--color-primary)_85%,transparent)] transition-all hover:brightness-110 hover:shadow-[0_0_42px_-4px_color-mix(in_oklch,var(--color-neon-cyan)_65%,transparent)]";
const CYBER_LABEL =
  "font-mono text-[11px] uppercase tracking-[0.2em] text-neon-cyan/80";

export function LockGate({ children }: { children: React.ReactNode }) {
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ["auth-status"],
    queryFn: () => api.authStatus(),
    staleTime: Infinity,
  });
  const unlocked = useSession((s) => s.unlocked);
  const setUnlocked = useSession((s) => s.unlock);

  if (isLoading || !status) {
    return <LoadingScreen label="道" />;
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
  const t = useT();
  return (
    <div className="relative h-screen w-screen overflow-y-auto bg-background text-foreground">
      <MeshBackground />
      <AetherParticles />
      {/* radial hero glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_50%_-10%,color-mix(in_oklch,var(--color-primary)_18%,transparent)_0%,transparent_60%)]"
      />
      <TitleBarDrag className="absolute left-20 right-0 top-0 z-20 h-9" />

      {/* Brand */}
      <div className="absolute left-8 top-8 z-20 hidden md:block">
        <p className="font-jp text-display-lg-mobile text-xl font-extrabold tracking-tighter text-primary">
          みち
        </p>
        <p className="-mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">
          Michi · {t("brand.tagline")}
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

          <div className="relative mt-7 overflow-hidden rounded-3xl glass-strong border border-neon-cyan/20 p-6 shadow-[0_0_50px_-16px_color-mix(in_oklch,var(--color-primary)_60%,transparent)]">
            {/* HUD scanline + neon corner brackets — matches the app aesthetic */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <div className="animate-scanline absolute left-0 h-10 w-full bg-gradient-to-b from-transparent via-neon-cyan/[0.06] to-transparent" />
            </div>
            <span className="hud-corner left-3 top-3 border-l-2 border-t-2 border-neon-cyan/50" />
            <span className="hud-corner right-3 top-3 border-r-2 border-t-2 border-neon-cyan/50" />
            <span className="hud-corner bottom-3 left-3 border-b-2 border-l-2 border-neon-cyan/50" />
            <span className="hud-corner bottom-3 right-3 border-b-2 border-r-2 border-neon-cyan/50" />
            <div className="relative">
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-neon-cyan/40 bg-primary/15 text-primary primary-glow">
                {icon}
              </div>
              {children}
            </div>
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
          © Michi · 夢を追え
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {t("login.systemStatus")} <span className="text-neon-cyan">{t("login.online")}</span>
        </p>
      </div>
    </div>
  );
}

function CreateCredential({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError(null);
    if (!username.trim()) return setError(t("login.err.username"));
    if (pin.length < 4) return setError(t("login.err.pinShort"));
    if (pin !== confirm) return setError(t("login.err.pinMatch"));
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
      title={t("login.create.title")}
      subtitle={t("login.create.subtitle")}
    >
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="username" className={CYBER_LABEL}>
            {t("login.username")}
          </Label>
          <Input
            id="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("login.usernamePh")}
            className={CYBER_INPUT}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pin" className={CYBER_LABEL}>
            {t("login.pinMin")}
          </Label>
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            className={CYBER_INPUT}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="confirm" className={CYBER_LABEL}>
            {t("login.confirmPin")}
          </Label>
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
            className={CYBER_INPUT}
          />
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button size="lg" className={CYBER_BUTTON} disabled={saving} onClick={submit}>
          {saving ? t("login.creating") : t("login.createEnter")}
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
  const t = useT();
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
        setError(t("login.err.pinWrong"));
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
      title={username ? t("login.hi", { name: username }) : t("login.welcomeBack")}
      subtitle={t("login.enterPin")}
    >
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="pin" className={CYBER_LABEL}>
            PIN
          </Label>
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
            className={`${CYBER_INPUT} tracking-[0.4em]`}
          />
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button
          size="lg"
          className={CYBER_BUTTON}
          disabled={checking || !pin}
          onClick={submit}
        >
          {checking ? t("login.checking") : t("login.enter")}
        </Button>
      </div>
    </AuthShell>
  );
}
