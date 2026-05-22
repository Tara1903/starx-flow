import React from 'react';

interface ProgressBarProps {
  progressPercent: number;
}

export function ProgressBar({ progressPercent }: ProgressBarProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 tracking-wider uppercase">
        <span>Setup Progress</span>
        <span>{progressPercent}% Complete</span>
      </div>
      <div className="setup-progress-track">
        <div
          className="setup-progress-fill"
          style={{
            width: `${progressPercent}%`,
            '--progress-width': `${progressPercent}%`,
          } as React.CSSProperties}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
