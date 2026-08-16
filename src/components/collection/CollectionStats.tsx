'use client'

import { motion } from 'motion/react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Shield, FlaskConical, MapPin, Leaf } from 'lucide-react'

const stats = [
  { icon: Leaf, value: '24', label: 'Products' },
  { icon: FlaskConical, value: '100%', label: 'Ayurvedic' },
  { icon: Shield, value: 'Lab', label: 'Tested' },
  { icon: MapPin, value: 'Made in', label: 'India' },
] as const

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as any },
  },
}

export function CollectionStats() {
  return (
    <motion.div
      className="mx-auto max-w-5xl px-6 py-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <motion.div key={label} variants={itemVariants}>
            <GlassPanel tier="mist" className="rounded-2xl p-6 text-center">
              <Icon className="mx-auto mb-3 h-6 w-6 text-emerald-400" />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="mt-1 text-sm text-zinc-500">{label}</p>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
