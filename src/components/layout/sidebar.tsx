import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Feather,
  Gamepad2,
  Gift,
  GraduationCap,
  Headphones,
  Home,
  type LucideIcon,
  Mic,
  PenTool,
  ScrollText,
  Settings as SettingsIcon,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
  { to: "/kanji", label: "Kanji", icon: PenTool, jp: "漢字" },
  { to: "/grammar", label: "Gramática", icon: BookOpen, jp: "文法" },
  { to: "/journal", label: "Diario", icon: Feather, jp: "日記" },
  { to: "/reading", label: "Lectura", icon: ScrollText, jp: "読解" },
  { to: "/listening", label: "Listening", icon: Headphones, jp: "聴解" },
  { to: "/speaking", label: "Speaking", icon: Mic, jp: "会話" },
];

const SECONDARY_NAV: NavItem[] = [
  { to: "/play", label: "Jugar", icon: Gamepad2, jp: "遊ぶ" },
  { to: "/rewards", label: "Recompensas", icon: Gift, jp: "ご褒美" },
  { to: "/stats", label: "Progreso", icon: TrendingUp, jp: "進捗" },
  { to: "/settings", label: "Ajustes", icon: SettingsIcon },
];

function NavItemLink({ to, label, icon: Icon, jp }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
          "text-sidebar-foreground/75 hover:text-sidebar-foreground",
          isActive
            ? "bg-gradient-to-r from-sidebar-primary/15 to-sidebar-primary/5 text-sidebar-foreground"
            : "hover:bg-sidebar-accent/60"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <motion.span
              layoutId="nav-active-indicator"
              className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-neon-violet to-neon-cyan"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          ) : null}
          <Icon
            className={cn(
              "size-4 shrink-0 transition-colors",
              isActive ? "text-sidebar-primary" : "text-sidebar-foreground/55"
            )}
          />
          <span className="flex-1 truncate font-medium">{label}</span>
          {jp ? (
            <span
              className={cn(
                "font-jp text-[10px] tracking-wider transition-all",
                isActive
                  ? "text-sidebar-primary opacity-100"
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
  return (
    <motion.aside
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.21, 1.02, 0.73, 1] }}
      className="relative z-10 flex h-full w-64 flex-col gap-5 border-r border-sidebar-border/60 bg-sidebar/40 px-3 pt-12 pb-4 backdrop-blur-xl"
      data-tauri-drag-region
    >
      {/* Brand */}
      <div className="px-3" data-tauri-no-drag>
        <p className="font-jp text-xs tracking-[0.4em] text-sidebar-foreground/45">
          にほんご
        </p>
        <h1 className="text-lg font-semibold tracking-tight gradient-text">
          Nihongo
        </h1>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1 px-1" data-tauri-no-drag>
        {PRIMARY_NAV.map((item) => (
          <NavItemLink key={item.to} {...item} />
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Player badge */}
      <SidebarPlayer />

      {/* Secondary nav */}
      <nav className="flex flex-col gap-1 px-1" data-tauri-no-drag>
        {SECONDARY_NAV.map((item) => (
          <NavItemLink key={item.to} {...item} />
        ))}
      </nav>
    </motion.aside>
  );
}
