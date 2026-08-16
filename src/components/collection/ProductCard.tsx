'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '@/lib/productData'

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product
  onQuickView: (product: Product) => void
}) {
  const [isWished, setIsWished] = useState(false)
  const filledStars = Math.round(product.rating)

  const badgeStyles: Record<string, string> = {
    Bestseller: 'bg-amber-500/20 border border-amber-500/30 text-amber-400',
    New: 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400',
    Limited: 'bg-rose-500/20 border border-rose-500/30 text-rose-400',
  }

  return (
    <motion.div
      className={cn(
        'group relative rounded-2xl overflow-hidden transition-all duration-500 flex flex-col',
        'bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl',
        'hover:border-emerald-500/20 hover:shadow-[0_8px_40px_-12px_rgba(16,185,129,0.15)]'
      )}
    >
      {/* IMAGE AREA */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {/* BADGE */}
        {product.badge && (
          <span
            className={cn(
              'absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md',
              badgeStyles[product.badge] ?? badgeStyles.New
            )}
          >
            {product.badge}
          </span>
        )}

        {/* WISHLIST BUTTON */}
        <button
          onClick={() => setIsWished((prev) => !prev)}
          className={cn(
            'absolute top-3 right-3 z-10',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
            'w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10',
            'flex items-center justify-center hover:bg-white/20'
          )}
        >
          <Heart
            size={14}
            className={cn(
              'text-white transition-colors duration-300',
              isWished && 'fill-rose-500 text-rose-500'
            )}
          />
        </button>

        {/* QUICK VIEW BUTTON */}
        <button
          onClick={() => onQuickView(product)}
          className={cn(
            'absolute bottom-4 left-1/2 -translate-x-1/2 z-10',
            'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300',
            'flex items-center gap-2 px-4 py-2 rounded-full',
            'bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-medium',
            'hover:bg-white/20'
          )}
        >
          <Eye size={14} />
          Quick View
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Benefit */}
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-1">
          {product.benefit}
        </p>

        {/* Ingredient Pills */}
        <div className="flex flex-wrap gap-1.5">
          {product.ingredients.slice(0, 3).map((ingredient) => (
            <span
              key={ingredient}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/[0.08] text-zinc-500 font-medium"
            >
              {ingredient}
            </span>
          ))}
        </div>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={cn(
                  i < filledStars
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-zinc-700'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            {product.rating}
          </span>
          <span className="text-xs text-zinc-500">({product.reviewCount})</span>
        </div>

        {/* Price Row */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-lg font-bold text-white">
            ₹{product.price}
          </span>
          <span className="text-sm text-zinc-500 line-through">
            ₹{product.originalPrice}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
            Save {product.discount}%
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          className={cn(
            'mt-3 w-full flex items-center justify-center gap-2',
            'bg-white/5 hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/30',
            'text-zinc-300 hover:text-emerald-400',
            'rounded-xl py-2.5 text-sm font-medium',
            'transition-all duration-300'
          )}
        >
          <ShoppingBag size={15} />
          Add to Cart
        </button>
      </div>
    </motion.div>
  )
}
