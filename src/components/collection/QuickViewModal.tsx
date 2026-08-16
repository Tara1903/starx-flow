"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, ShoppingBag, Heart, Shield, Truck } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import type { Product } from "@/lib/productData";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  // Close on Escape
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll
  React.useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-scrollbar bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-10"
          >
            {/* Top glass gradient edge */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative aspect-square md:aspect-auto md:min-h-[480px] bg-gradient-to-br from-zinc-900 to-black overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Badge */}
                {product.badge && (
                  <div
                    className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      product.badge === "Bestseller"
                        ? "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                        : product.badge === "New"
                        ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex flex-col gap-5">
                {/* Category */}
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/70">
                  {product.category}
                </span>

                {/* Name */}
                <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
                  {product.name}
                </h2>

                {/* Benefit */}
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {product.benefit}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.round(product.rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-zinc-700"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-zinc-400 font-medium">
                    {product.rating}
                  </span>
                  <span className="text-sm text-zinc-600">
                    ({product.reviewCount.toLocaleString()} reviews)
                  </span>
                </div>

                {/* Ingredients */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">
                    Key Ingredients
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/8 text-zinc-400 font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Diet Preference Tags */}
                <div className="flex flex-wrap gap-2">
                  {product.dietPreference.map((pref) => (
                    <span
                      key={pref}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/15 text-emerald-400/70 font-medium"
                    >
                      {pref}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                  <span className="text-3xl font-bold text-white">
                    ₹{product.price}
                  </span>
                  <span className="text-lg text-zinc-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                    Save {product.discount}%
                  </span>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      product.availability === "In Stock"
                        ? "bg-emerald-500"
                        : product.availability === "Low Stock"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span
                    className={
                      product.availability === "In Stock"
                        ? "text-emerald-400"
                        : product.availability === "Low Stock"
                        ? "text-amber-400"
                        : "text-red-400"
                    }
                  >
                    {product.availability}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <GlassButton
                    variant="primary"
                    size="lg"
                    className="flex-1 gap-2"
                  >
                    <ShoppingBag size={18} />
                    Add to Cart
                  </GlassButton>
                  <button className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-colors">
                    <Heart size={20} />
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-6 pt-2 text-[11px] text-zinc-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Shield size={13} className="text-emerald-500/60" />
                    100% Authentic
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} className="text-emerald-500/60" />
                    Free Shipping
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
