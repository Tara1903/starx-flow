'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, SlidersHorizontal, Grid3X3, List, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SORT_OPTIONS } from '@/lib/productData'

interface StickyFilterBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  sortBy: string
  onSortChange: (s: string) => void
  onFilterToggle: () => void
  activeFilterCount: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (m: 'grid' | 'list') => void
  productCount: number
}

export function StickyFilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onFilterToggle,
  activeFilterCount,
  viewMode,
  onViewModeChange,
  productCount,
}: StickyFilterBarProps) {
  const [sortOpen, setSortOpen] = React.useState(false)
  const sortRef = React.useRef<HTMLDivElement>(null)

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ?? 'Sort'

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="sticky top-[73px] z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left — Search */}
          <div className="hidden md:block relative max-w-[280px] w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-white/5 border border-white/8 rounded-full pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-emerald-500/40 transition-colors duration-300"
            />
          </div>

          {/* Center — Product Count */}
          <p className="hidden md:block text-zinc-500 text-sm font-medium whitespace-nowrap">
            {productCount} {productCount === 1 ? 'Product' : 'Products'}
          </p>

          {/* Right — Controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Sort Dropdown */}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 transition-all duration-300"
              >
                <span className="whitespace-nowrap">{currentSortLabel}</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-zinc-500 transition-transform duration-200',
                    sortOpen && 'rotate-180'
                  )}
                />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          onSortChange(opt.value)
                          setSortOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-white/5',
                          sortBy === opt.value
                            ? 'text-emerald-400'
                            : 'text-zinc-400'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Button */}
            <button
              onClick={onFilterToggle}
              className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 transition-all duration-300"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-black text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'rounded-lg p-2 bg-white/5 transition-colors duration-200',
                  viewMode === 'grid' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'rounded-lg p-2 bg-white/5 transition-colors duration-200',
                  viewMode === 'list' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
