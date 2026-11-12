"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
import { GlassButton } from "./GlassButton";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl p-6 sm:p-8 bg-red-500/[0.06] border border-red-500/25 backdrop-blur-xl text-center flex flex-col items-center justify-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-3.5">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-sm text-red-200/80 max-w-md mt-1 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="mt-4 border-red-500/30 hover:border-red-400/50"
        >
          {retryLabel}
        </GlassButton>
      )}
    </div>
  );
}
