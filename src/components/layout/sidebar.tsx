import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Gamepad2,
  Gift,
  GraduationCap,
  Headphones,
  Home,
  LogOut,
  type LucideIcon,
  Mic,
  PenTool,
  RotateCcw,
  ScrollText,
  Settings as SettingsIcon,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSession } from "@/stores/session";
import { SidebarPlayer } from "./sidebar-player";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  jp?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Inicio", icon: Home, jp: "ホーム" },
  { to: "/learn", label: "Curso", icon: GraduationCap, jp: "授業" },
  { to: "/repaso", label: "Repaso", icon: RotateCcw, jp: "復習" },
  { to: "/kanji", label: "Kanji", icon: PenTool, jp: "漢字" },
  { to: "/grammar", label: "Gramática", icon: BookOpen, jp: "文法" },
  { to: "/reading", label: "Lectura", icon: ScrollText, jp: "読解" },
  { to: "/listening", label: "Listening", icon: Headphones, jp: "聴解" },
  { to: "/speaking", label: "Speaking", icon: Mic, jp: "会話" },
];

const SECONDARY_NAV: NavItem[] = [
  { to: "/play", label: "Jugar", icon: Gamepad2, jp: "遊ぶ" },
  { to: "/rewards", label: "Tienda", icon: Gift, jp: "店" },
  { to: "/stats", label: "Progreso", icon: TrendingUp, jp: "進捗" },
  { to: "/settings", label: "Ajustes", icon: SettingsIcon },
];

const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;

function NavItemLink({ to, label, icon: Icon, jp }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 overflow-hidden rounded-lg px-2.5 py-2.5 text-sm transition-colors duration-200",
          isActive
            ? "text-sidebar-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active panel — slides between items */}
          {isActive ? (
            <motion.span
              layoutId="nav-active-bg"
              aria-hidden
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-sidebar-primary/20 via-neon-violet/10 to-transparent ring-1 ring-inset ring-neon-cyan/25"
              transition={SPRING}
            >
              <span className="absolute inset-0 overflow-hidden rounded-lg">
                <span className="animate-scanline absolute left-0 h-6 w-full bg-gradient-to-b from-transparent via-neon-cyan/10 to-transparent" />
              </span>
            </motion.span>
          ) : null}

          {/* Hover sheen sweep */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
          />

          {/* Active left rail — glowing, slides between items */}
          {isActive ? (
            <motion.span
              layoutId="nav-active-rail"
              aria-hidden
              className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-neon-violet to-neon-cyan shadow-[0_0_12px_color-mix(in_oklch,var(--color-neon-cyan)_85%,transparent)]"
              transition={SPRING}
            />
          ) : null}

          {/* Icon in a HUD bracket frame */}
          <span
            className={cn(
              "relative grid size-7 shrink-0 place-items-center rounded-md border transition-all duration-200",
              isActive
                ? "border-neon-cyan/40 bg-background/40 text-sidebar-primary shadow-[0_0_16px_-4px_color-mix(in_oklch,var(--color-neon-cyan)_80%,transparent)]"
                : "border-transparent text-sidebar-foreground/55 group-hover:border-border/70 group-hover:bg-background/20"
            )}
          >
            <Icon className="size-4 transition-transform duration-200 group-hover:scale-110" />
          </span>

          <span className="relative flex-1 truncate font-medium tracking-tight">
            {label}
          </span>

          {jp ? (
            <span
              className={cn(
                "relative rounded px-1 font-mono text-[10px] tracking-wider transition-all duration-200",
                isActive
                  ? "text-neon-cyan opacity-100"
                  : "text-sidebar-foreground/35 opacity-0 group-hover:opacity-100"
              )}
            >
              {jp}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const lock = useSession((s) => s.lock);
  return (
    <motion.aside
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.21, 1.02, 0.73, 1] }}
      className="relative z-10 flex h-full w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r border-sidebar-border/60 bg-sidebar/40 px-3 pt-12 pb-4 backdrop-blur-xl"
    >
      {/* Ambient cyberpunk grid + glow inside the rail */}
      <div
        aria-hidden
        className="holo-grid pointer-events-none absolute inset-0 opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-24 size-40 rounded-full bg-neon-violet/15 blur-3xl"
      />
      {/* Glowing right edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-neon-cyan/30 to-transparent"
      />

      {/* Brand */}
      <div className="relative shrink-0 px-3" data-tauri-no-drag>
        <p className="font-jp text-xs tracking-[0.4em] text-sidebar-foreground/45">
          にほんご
        </p>
        <h1 className="font-display text-lg font-extrabold tracking-tighter gradient-text">
          Nihongo
        </h1>
        <p className="-mt-0.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-neon-cyan/70">
          <span className="inline-block size-1 animate-pulse rounded-full bg-neon-cyan" />
          Aether System
        </p>
      </div>

      {/* Primary nav */}
      <nav className="relative flex shrink-0 flex-col gap-1 px-1" data-tauri-no-drag>
        <p className="mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.3em] text-sidebar-foreground/30">
          Aprender
        </p>
        {PRIMARY_NAV.map((item) => (
          <NavItemLink key={item.to} {...item} />
        ))}
      </nav>

      {/* Spacer — collapses to 0 when content overflows so the list scrolls */}
      <div className="min-h-2 flex-1" />

      {/* Player badge */}
      <div className="relative shrink-0">
        <SidebarPlayer />
      </div>

      {/* Secondary nav */}
      <nav className="relative flex shrink-0 flex-col gap-1 px-1" data-tauri-no-drag>
        <p className="mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.3em] text-sidebar-foreground/30">
          Sistema
        </p>
        {SECONDARY_NAV.map((item) => (
          <NavItemLink key={item.to} {...item} />
        ))}
        <button
          onClick={lock}
          data-tauri-no-drag
          className={cn(
            "group relative flex items-center gap-3 overflow-hidden rounded-lg px-2.5 py-2.5 text-sm transition-colors duration-200",
            "text-sidebar-foreground/60 hover:text-sidebar-foreground"
          )}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full"
          />
          <span className="relative grid size-7 shrink-0 place-items-center rounded-md border border-transparent text-sidebar-foreground/55 transition-all duration-200 group-hover:border-destructive/40 group-hover:bg-destructive/10 group-hover:text-destructive">
            <LogOut className="size-4" />
          </span>
          <span className="relative flex-1 truncate text-left font-medium">
            Cerrar sesión
          </span>
        </button>
      </nav>
    </motion.aside>
  );
}
