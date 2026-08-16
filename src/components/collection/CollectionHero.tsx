'use client'

import { motion } from 'motion/react'

export function CollectionHero({ activeCategory }: { activeCategory: string }) {
  const heading =
    activeCategory === 'All'
      ? 'Discover Our Collection'
      : `${activeCategory.toUpperCase()} COLLECTION`

  return (
    <section className="relative w-full overflow-hidden pt-32 pb-16">
      {/* ── Atmospheric glow orbs ── */}
      <div
        className="atmo-glow-emerald pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-30 blur-[140px]"
        aria-hidden
      />
      <div
        className="atmo-glow-soft pointer-events-none absolute -bottom-24 right-1/4 h-[320px] w-[320px] rounded-full opacity-20 blur-[120px]"
        aria-hidden
      />

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Eyebrow */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-emerald-400">
            Ayurdhara Collection
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold leading-[1.05] tracking-tighter text-white sm:text-6xl lg:text-7xl">
          {heading}
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
          Natural formulations crafted to strengthen daily wellness.
        </p>
      </motion.div>
    </section>
  )
}
