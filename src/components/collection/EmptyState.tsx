"use client";

import React from "react";
import { motion } from "motion/react";
import { SearchX, RotateCcw } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { CATEGORIES } from "@/lib/productData";

interface EmptyStateProps {
  onResetFilters: () => void;
  onCategoryChange: (cat: string) => void;
}

export function EmptyState({ onResetFilters, onCategoryChange }: EmptyStateProps) {
  const suggestedCategories = CATEGORIES.filter((c) => c !== "All").slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      {/* Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <SearchX className="w-10 h-10 text-zinc-600" />
        </div>
        <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-2xl" />
      </div>

      {/* Message */}
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        No products found
      </h3>
      <p className="text-sm text-zinc-500 font-medium max-w-md mb-8 leading-relaxed">
        We couldn&apos;t find any products matching your current filters. Try adjusting
        your search or explore a different category.
      </p>

      {/* Suggested Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {suggestedCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 border border-white/8 text-zinc-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400 transition-all duration-300"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reset Button */}
      <GlassButton
        variant="secondary"
        onClick={onResetFilters}
        className="gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Reset All Filters
      </GlassButton>
    </motion.div>
  );
}
