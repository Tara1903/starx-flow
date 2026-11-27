/**
 * Switchboard Slate Design Tokens for Admin & Client Consoles
 *
 * Keeps chrome neutral with 1px hairlines (#edf0ee at 8% opacity),
 * tabular numeric alignment, sentence-case hierarchy, and a single
 * signal emerald (#34d399 / #10b981) reserved for live states.
 *
 * Note: All background hex tokens avoid audit-banned legacy literals.
 */

export const CONSOLE_CANVAS = "bg-[#080a09] text-[#edf0ee]";

export const CONSOLE_RAIL =
  "bg-[#0c100e] border border-[#edf0ee]/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.45)]";

export const CONSOLE_TOPBAR =
  "sticky top-0 z-30 bg-[#080a09]/92 backdrop-blur-md border-b border-[#edf0ee]/[0.08]";

export const CONSOLE_PANEL =
  "rounded-2xl bg-[#121715] border border-[#edf0ee]/[0.08] p-5";

export const CONSOLE_PANEL_LG =
  "rounded-2xl bg-[#121715] border border-[#edf0ee]/[0.08] p-6";

export const CONSOLE_PANEL_FLUSH =
  "rounded-2xl bg-[#121715] border border-[#edf0ee]/[0.08] overflow-hidden";

export const CONSOLE_RAISED =
  "rounded-xl bg-[#19201d] border border-[#edf0ee]/[0.08]";

export const CONSOLE_SUBCARD =
  "rounded-xl bg-[#0d1210] border border-[#edf0ee]/[0.06]";

export const CONSOLE_ROW =
  "transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#19201d]/75";

export const CONSOLE_DIVIDER = "border-[#edf0ee]/[0.08]";

export const CONSOLE_INPUT =
  "rounded-lg bg-[#0d1210] border border-[#edf0ee]/10 focus:border-[#34d399]/50 text-[#edf0ee] placeholder:text-[#727c75] outline-none transition-colors duration-150";

export const CONSOLE_BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#edf0ee] hover:bg-white text-[#080a09] font-medium text-xs px-3.5 py-2 transition-colors duration-150 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98]";

export const CONSOLE_BTN_SECONDARY =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#19201d] hover:bg-[#222b27] border border-[#edf0ee]/10 text-[#edf0ee] font-medium text-xs px-3.5 py-2 transition-colors duration-150 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98]";

export const CONSOLE_BTN_GHOST =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-[#a1aaa4] hover:text-[#edf0ee] hover:bg-[#19201d] border border-transparent font-medium text-xs px-2.5 py-1.5 transition-colors duration-150 cursor-pointer";

export const CONSOLE_BTN_DANGER =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#e5484d]/10 hover:bg-[#e5484d]/18 border border-[#e5484d]/25 text-[#f28b8e] font-medium text-xs px-3.5 py-2 transition-colors duration-150 cursor-pointer";

export const CONSOLE_BADGE_LIVE =
  "inline-flex items-center gap-1.5 rounded-md bg-[#4cc38a]/12 border border-[#4cc38a]/25 px-2 py-0.5 text-[11px] font-medium text-[#4cc38a] tabular-nums";

export const CONSOLE_BADGE_WARN =
  "inline-flex items-center gap-1.5 rounded-md bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[11px] font-medium text-amber-300 tabular-nums";

export const CONSOLE_BADGE_INFO =
  "inline-flex items-center gap-1.5 rounded-md bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 text-[11px] font-medium text-sky-300 tabular-nums";

export const CONSOLE_BADGE_DANGER =
  "inline-flex items-center gap-1.5 rounded-md bg-[#e5484d]/12 border border-[#e5484d]/25 px-2 py-0.5 text-[11px] font-medium text-[#f28b8e] tabular-nums";

export const CONSOLE_BADGE_MUTED =
  "inline-flex items-center gap-1.5 rounded-md bg-[#19201d] border border-[#edf0ee]/10 px-2 py-0.5 text-[11px] font-medium text-[#a1aaa4] tabular-nums";

export const CONSOLE_HEADING =
  "text-lg sm:text-xl font-semibold text-[#edf0ee] tracking-[-0.015em]";

export const CONSOLE_SECTION_TITLE =
  "text-sm font-medium text-[#edf0ee]";

export const CONSOLE_META = "text-xs text-[#a1aaa4]";

export const CONSOLE_MUTED = "text-xs text-[#727c75]";
