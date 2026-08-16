'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassSheet } from '@/components/ui/GlassSheet';
import { GlassButton } from '@/components/ui/GlassButton';
import {
  HEALTH_GOALS,
  PRODUCT_TYPES,
  DIET_PREFERENCES,
  BENEFITS,
} from '@/lib/productData';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    healthGoals: string[];
    productTypes: string[];
    dietPreferences: string[];
    priceRange: [number, number];
    availability: boolean;
    benefits: string[];
  };
  onFilterChange: (filters: FilterSidebarProps['filters']) => void;
  isMobile: boolean;
}

/* ------------------------------------------------------------------ */
/*  FilterGroup – collapsible section                                  */
/* ------------------------------------------------------------------ */

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between cursor-pointer py-3 border-b border-white/5"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-zinc-500 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="py-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CheckboxItem                                                       */
/* ------------------------------------------------------------------ */

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3 py-1.5 cursor-pointer group w-full text-left"
    >
      <span
        className={cn(
          'w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 shrink-0',
          checked
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-zinc-700 bg-transparent'
        )}
      >
        {checked && <div className="w-2 h-2 bg-white rounded-sm" />}
      </span>
      <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
        {label}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const DEFAULT_FILTERS: FilterSidebarProps['filters'] = {
  healthGoals: [],
  productTypes: [],
  dietPreferences: [],
  priceRange: [0, 1500],
  availability: false,
  benefits: [],
};

function hasActiveFilters(filters: FilterSidebarProps['filters']): boolean {
  return (
    filters.healthGoals.length > 0 ||
    filters.productTypes.length > 0 ||
    filters.dietPreferences.length > 0 ||
    filters.benefits.length > 0 ||
    filters.availability ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 1500
  );
}

function toggleArrayValue(arr: string[], value: string): string[] {
  return arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];
}

/* ------------------------------------------------------------------ */
/*  FilterContent – shared filter sections                             */
/* ------------------------------------------------------------------ */

function FilterContent({
  filters,
  onFilterChange,
}: {
  filters: FilterSidebarProps['filters'];
  onFilterChange: FilterSidebarProps['onFilterChange'];
}) {
  return (
    <>
      {/* Health Goals */}
      <FilterGroup title="Health Goals">
        {HEALTH_GOALS.map((goal) => (
          <CheckboxItem
            key={goal}
            label={goal}
            checked={filters.healthGoals.includes(goal)}
            onChange={() =>
              onFilterChange({
                ...filters,
                healthGoals: toggleArrayValue(filters.healthGoals, goal),
              })
            }
          />
        ))}
      </FilterGroup>

      {/* Product Type */}
      <FilterGroup title="Product Type">
        {PRODUCT_TYPES.map((type) => (
          <CheckboxItem
            key={type}
            label={type}
            checked={filters.productTypes.includes(type)}
            onChange={() =>
              onFilterChange({
                ...filters,
                productTypes: toggleArrayValue(filters.productTypes, type),
              })
            }
          />
        ))}
      </FilterGroup>

      {/* Price Range */}
      <FilterGroup title="Price Range">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Min: ₹{filters.priceRange[0]}</span>
            <span>Max: ₹{filters.priceRange[1]}</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-600">
                Minimum
              </label>
              <input
                type="range"
                min={0}
                max={1500}
                step={50}
                value={filters.priceRange[0]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onFilterChange({
                    ...filters,
                    priceRange: [
                      Math.min(val, filters.priceRange[1]),
                      filters.priceRange[1],
                    ],
                  });
                }}
                className="w-full appearance-none h-1 bg-zinc-800 rounded-full accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-600">
                Maximum
              </label>
              <input
                type="range"
                min={0}
                max={1500}
                step={50}
                value={filters.priceRange[1]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onFilterChange({
                    ...filters,
                    priceRange: [
                      filters.priceRange[0],
                      Math.max(val, filters.priceRange[0]),
                    ],
                  });
                }}
                className="w-full appearance-none h-1 bg-zinc-800 rounded-full accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </div>
      </FilterGroup>

      {/* Availability */}
      <FilterGroup title="Availability">
        <CheckboxItem
          label="In Stock Only"
          checked={filters.availability}
          onChange={() =>
            onFilterChange({
              ...filters,
              availability: !filters.availability,
            })
          }
        />
      </FilterGroup>

      {/* Benefits */}
      <FilterGroup title="Benefits">
        {BENEFITS.map((benefit) => (
          <CheckboxItem
            key={benefit}
            label={benefit}
            checked={filters.benefits.includes(benefit)}
            onChange={() =>
              onFilterChange({
                ...filters,
                benefits: toggleArrayValue(filters.benefits, benefit),
              })
            }
          />
        ))}
      </FilterGroup>

      {/* Diet Preference */}
      <FilterGroup title="Diet Preference">
        {DIET_PREFERENCES.map((pref) => (
          <CheckboxItem
            key={pref}
            label={pref}
            checked={filters.dietPreferences.includes(pref)}
            onChange={() =>
              onFilterChange({
                ...filters,
                dietPreferences: toggleArrayValue(
                  filters.dietPreferences,
                  pref
                ),
              })
            }
          />
        ))}
      </FilterGroup>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  FilterSidebar – main export                                        */
/* ------------------------------------------------------------------ */

export function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  isMobile,
}: FilterSidebarProps) {
  /* ---- Mobile: bottom sheet ---- */
  if (isMobile) {
    return (
      <GlassSheet open={isOpen} onClose={onClose} side="bottom" title="Filters">
        <div className="space-y-1">
          <FilterContent filters={filters} onFilterChange={onFilterChange} />
        </div>

        <div className="flex items-center gap-3 pt-6 mt-4 border-t border-white/5">
          <GlassButton
            variant="ghost"
            className="flex-1"
            onClick={() => onFilterChange({ ...DEFAULT_FILTERS })}
          >
            <RotateCcw size={14} className="mr-2" />
            Reset All
          </GlassButton>
          <GlassButton
            variant="primary"
            className="flex-1"
            onClick={onClose}
          >
            Apply Filters
          </GlassButton>
        </div>
      </GlassSheet>
    );
  }

  /* ---- Desktop: sticky sidebar ---- */
  return (
    <div className="w-[260px] shrink-0 space-y-1">
      <div className="sticky top-[140px] max-h-[calc(100vh-160px)] overflow-y-auto glass-scrollbar pr-4">
        {/* Reset button */}
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onFilterChange({ ...DEFAULT_FILTERS })}
            className="text-xs text-zinc-500 hover:text-emerald-400 flex items-center gap-1.5 mb-2 transition-colors"
          >
            <RotateCcw size={12} />
            Reset Filters
          </button>
        )}

        <FilterContent filters={filters} onFilterChange={onFilterChange} />
      </div>
    </div>
  );
}
