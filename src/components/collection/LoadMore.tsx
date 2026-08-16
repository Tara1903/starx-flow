"use client";

import React from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";

interface LoadMoreProps {
  onLoadMore: () => void;
  remainingCount: number;
  isLoading?: boolean;
}

export function LoadMore({ onLoadMore, remainingCount, isLoading = false }: LoadMoreProps) {
  if (remainingCount <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col items-center gap-4 pt-12 pb-4"
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
        <div className="w-16 h-px bg-gradient-to-r from-transparent to-white/10" />
        <span>{remainingCount} more {remainingCount === 1 ? "product" : "products"}</span>
        <div className="w-16 h-px bg-gradient-to-l from-transparent to-white/10" />
      </div>

      <GlassButton
        variant="secondary"
        size="lg"
        onClick={onLoadMore}
        disabled={isLoading}
        className="min-w-[200px] gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </>
        ) : (
          "Load More"
        )}
      </GlassButton>
    </motion.div>
  );
}
