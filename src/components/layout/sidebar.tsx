import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Gamepad2,
  Home,
  LayoutGrid,
  LineChart,
  type LucideIcon,
  MessagesSquare,
  PenTool,
  RotateCcw,
  Route,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PlayerAvatar } from "@/components/profile/player-avatar";
import { usePlayer } from "@/hooks/use-player";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useT, type TFn } from "@/lib/i18n";

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

// APRENDER — todo lo que es estudiar. «Práctica» agrupa Lectura, Listening y
// Speaking en un solo hub (/practica) para que el sidebar respire.
const PRIMARY_NAV: NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/learn", labelKey: "nav.course", icon: Route },
  { to: "/repaso", labelKey: "nav.review", icon: RotateCcw },
  { to: "/kanji", labelKey: "nav.kanji", icon: PenTool },
  { to: "/grammar", labelKey: "nav.grammar", icon: LayoutGrid },
  { to: "/practica", labelKey: "nav.practice", icon: MessagesSquare },
];

// TU ESPACIO — lo que rodea al aprendizaje. La Tienda y el Perfil quedan
// separados a propósito: el Perfil vive en la tarjeta de abajo.
const SECONDARY_NAV: NavItem[] = [
  { to: "/play", labelKey: "nav.play", icon: Gamepad2 },
  { to: "/rewards", labelKey: "nav.store", icon: ShoppingBag },
  { to: "/stats", labelKey: "nav.progress", icon: LineChart },
  { to: "/settings", labelKey: "nav.settings", icon: SlidersHorizontal },
];

const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-sidebar-foreground/35">
      {children}
    </p>
  );
}

function NavItemLink({ to, labelKey, icon: Icon, t }: NavItem & { t: TFn }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      data-tauri-no-drag
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
          isActive
            ? "text-primary-foreground"
            : "text-sidebar-foreground/65 hover:text-sidebar-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active pill — solid, slides between items */}
          {isActive ? (
            <motion.span
              layoutId="nav-active-pill"
              aria-hidden
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-violet to-primary shadow-[0_10px_30px_-10px_color-mix(in_oklch,var(--color-primary)_80%,transparent)]"
              transition={SPRING}
            />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0 rounded-xl bg-transparent transition-colors duration-200 group-hover:bg-sidebar-foreground/[0.05]"
            />
          )}

          <Icon className="relative size-[18px] shrink-0" />
          <span className="relative flex-1 truncate">{t(labelKey)}</span>
        </>
      )}
    </NavLink>
  );
}

/** Brand — 道 Michi · el camino. Tapping it goes home. */
function Brand({ t }: { t: TFn }) {
  return (
    <Link
      to="/"
      data-tauri-no-drag
      className="relative flex shrink-0 items-center gap-3 px-2"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-neon-violet via-primary to-neon-cyan text-primary-foreground shadow-[0_10px_28px_-8px_color-mix(in_oklch,var(--color-primary)_75%,transparent)]">
        <span className="font-jp text-[22px] font-bold leading-none">道</span>
      </span>
      <div className="leading-tight">
        <h1 className="font-display text-lg font-extrabold tracking-tight gradient-text">
          Michi
        </h1>
        <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-sidebar-foreground/45">
          <span className="inline-block size-1 animate-pulse rounded-full bg-neon-cyan" />
          {t("brand.tagline")}
        </p>
      </div>
    </Link>
  );
}

/** Profile card at the very bottom → opens /profile (separado de la Tienda). */
function SidebarProfile() {
  const { data: player } = usePlayer();
  const { data: profile } = useUserProfile();

  if (!player) {
    return <div className="h-[68px]" data-tauri-no-drag />;
  }

  return (
    <Link
      to="/profile"
      data-tauri-no-drag
      className="group relative flex items-center gap-3 rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/30 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-sidebar-accent/50"
    >
      <PlayerAvatar level={player.level} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-sidebar-foreground">
          {profile?.name ?? player.title}
        </p>
        <p className="truncate text-[11px] text-sidebar-foreground/55">
          Nivel {player.level} ·{" "}
          <span className="tabular-nums">{player.currentLevelXp} XP</span>
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-sidebar-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-sidebar-foreground/70" />
    </Link>
  );
}

export function Sidebar() {
  const t = useT();
  return (
    <motion.aside
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.21, 1.02, 0.73, 1] }}
      className="relative z-10 flex h-full w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-sidebar-border/60 bg-sidebar/40 px-3 pt-12 pb-4 backdrop-blur-xl"
    >
      {/* Ambient glow inside the rail */}
      <div
        aria-hidden
        className="holo-grid pointer-events-none absolute inset-0 opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-20 size-40 rounded-full bg-neon-violet/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-neon-cyan/25 to-transparent"
      />

      <Brand t={t} />

      {/* Aprender */}
      <nav className="relative flex shrink-0 flex-col gap-1 px-1" data-tauri-no-drag>
        <SectionLabel>{t("nav.section.learn")}</SectionLabel>
        {PRIMARY_NAV.map((item) => (
          <NavItemLink key={item.to} {...item} t={t} />
        ))}
      </nav>

      {/* Tu espacio */}
      <nav className="relative flex shrink-0 flex-col gap-1 px-1" data-tauri-no-drag>
        <SectionLabel>{t("nav.section.space")}</SectionLabel>
        {SECONDARY_NAV.map((item) => (
          <NavItemLink key={item.to} {...item} t={t} />
        ))}
      </nav>

      {/* Spacer — collapses to 0 when the list overflows so it can scroll */}
      <div className="min-h-4 flex-1" />

      {/* Perfil */}
      <div className="relative shrink-0 px-1">
        <SidebarProfile />
      </div>
    </motion.aside>
  );
}
