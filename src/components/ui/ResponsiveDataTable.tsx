"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface DataColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  className?: string;
  render: (row: T) => React.ReactNode;
}

export interface ResponsiveDataTableProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  getRowKey: (row: T) => string;
  renderMobileCard: (row: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  tableLabel: string;
  className?: string;
}

/**
 * Renders a semantic full-width glass table on tablet/desktop (`md+`)
 * and tactile stacked glass summary cards on mobile (`< md`) with zero horizontal overflow.
 */
export function ResponsiveDataTable<T>({
  data,
  columns,
  getRowKey,
  renderMobileCard,
  emptyState,
  tableLabel,
  className,
}: ResponsiveDataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop & Tablet Table */}
      <div className="hidden md:block bg-[#121715] border border-[#edf0ee]/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto console-scroll">
          <table aria-label={tableLabel} className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#edf0ee]/[0.08] bg-[#0c100e]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "px-5 py-3 text-xs font-medium text-[#727c75] whitespace-nowrap",
                      col.align === "right" && "text-right",
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0ee]/[0.06] text-xs tabular-nums">
              {data.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="hover:bg-[#19201d]/75 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-5 py-3.5 align-middle",
                        col.align === "right" && "text-right",
                        col.className
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Stacked Cards */}
      <div className="md:hidden space-y-3" role="list" aria-label={tableLabel}>
        {data.map((row) => (
          <div
            key={getRowKey(row)}
            role="listitem"
            className="bg-[#121715] border border-[#edf0ee]/[0.08] rounded-2xl p-4 space-y-3 tabular-nums"
          >
            {renderMobileCard(row)}
          </div>
        ))}
      </div>
    </div>
  );
}
