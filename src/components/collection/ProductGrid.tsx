"use client";

import React from "react";
import { motion } from "motion/react";
import type { Product } from "@/lib/productData";

interface ProductGridProps {
  products: Product[];
  viewMode: "grid" | "list";
  onQuickView: (product: Product) => void;
}

// Lazy import to avoid circular deps — ProductCard is imported dynamically
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, viewMode, onQuickView }: ProductGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05, delayChildren: 0.1 },
        },
      }}
      className={
        viewMode === "grid"
          ? "grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          : "flex flex-col gap-4"
      }
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.97 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
        >
          <ProductCard product={product} onQuickView={onQuickView} />
        </motion.div>
      ))}
    </motion.div>
  );
}
