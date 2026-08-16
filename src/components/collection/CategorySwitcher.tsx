'use client'

import { motion } from 'motion/react'
import { CATEGORIES } from '@/lib/productData'
import { cn } from '@/lib/utils'

interface CategorySwitcherProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
}

export function CategorySwitcher({ activeCategory, onCategoryChange }: CategorySwitcherProps) {
  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category
          return (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(category)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap shrink-0',
                isActive
                  ? 'text-emerald-400'
                  : 'bg-white/5 border border-white/8 text-zinc-400 hover:bg-white/10 hover:text-zinc-300'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-category-pill"
                  className="absolute inset-0 rounded-full bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
