"use client";
import React from "react";
import {
  Settings,
  MessageCircle,
  Phone,
  Star,
  Instagram,
  Globe,
} from "lucide-react";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_LIVE,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";
import { type Workflow } from "../../store/authStore";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp: <MessageCircle className="w-4 h-4" strokeWidth={1.65} />,
  SMS: <Phone className="w-4 h-4" strokeWidth={1.65} />,
  Reviews: <Star className="w-4 h-4" strokeWidth={1.65} />,
  Instagram: <Instagram className="w-4 h-4" strokeWidth={1.65} />,
  Web: <Globe className="w-4 h-4" strokeWidth={1.65} />,
};

interface ToggleSwitchProps {
  active: boolean;
  onToggle: () => void;
}

function ToggleSwitch({ active, onToggle }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      aria-label={active ? "Deactivate workflow" : "Activate workflow"}
      className={cn(
        "w-10 h-5 rounded-full border p-0.5 transition-colors duration-150 flex items-center flex-shrink-0 cursor-pointer",
        active
          ? "bg-[#34d399]/25 border-[#34d399]/50"
          : "bg-[#19201d] border-[#edf0ee]/12"
      )}
    >
      <span
        className={cn(
          "w-3.5 h-3.5 rounded-full transition-transform duration-150",
          active ? "translate-x-5 bg-[#34d399]" : "translate-x-0 bg-[#727c75]"
        )}
      />
    </button>
  );
}

interface WorkflowCardProps {
  workflow: Workflow;
  onToggle: () => void;
  onConfigure: () => void;
}

export function WorkflowCard({ workflow, onToggle, onConfigure }: WorkflowCardProps) {
  const isAdvanced =
    workflow.config && Array.isArray(workflow.config.steps) && workflow.config.steps.length > 0;

  return (
    <div
      className={cn(
        CONSOLE_PANEL,
        "transition-colors duration-150 select-none tabular-nums",
        !workflow.isActive && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] flex-shrink-0">
            {CHANNEL_ICON[workflow.channel] || <Globe className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-[#edf0ee] truncate">
                {workflow.name}
              </h3>
              <span className={isAdvanced ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
                {isAdvanced ? "Advanced" : "Basic"}
              </span>
            </div>
            <p className="text-xs text-[#727c75] mt-0.5">
              {workflow.channel} · {workflow.aiTone} tone
            </p>
          </div>
        </div>

        <ToggleSwitch active={workflow.isActive} onToggle={onToggle} />
      </div>

      <p className="text-xs text-[#a1aaa4] leading-relaxed mb-4 line-clamp-2 min-h-[2.25rem]">
        {workflow.description}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={cn(CONSOLE_SUBCARD, "p-2.5")}>
          <p className="text-sm font-semibold text-[#edf0ee] leading-none">
            {workflow.executionsCount.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#727c75] mt-1">Runs</p>
        </div>
        <div className={cn(CONSOLE_SUBCARD, "p-2.5")}>
          <p className="text-sm font-semibold text-[#4cc38a] leading-none">
            {workflow.successRate}%
          </p>
          <p className="text-[11px] text-[#727c75] mt-1">Success</p>
        </div>
        <div className={cn(CONSOLE_SUBCARD, "p-2.5")}>
          <p className="text-sm font-semibold text-[#edf0ee] leading-none">
            {workflow.savedHours}h
          </p>
          <p className="text-[11px] text-[#727c75] mt-1">Saved</p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button type="button" onClick={onConfigure} className={CONSOLE_BTN_SECONDARY}>
          <Settings className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />
          <span>Configure</span>
        </button>
      </div>
    </div>
  );
}
