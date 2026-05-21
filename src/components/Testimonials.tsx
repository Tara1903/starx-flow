import React from "react";
import { motion } from "motion/react";
import { Star, MessageSquare, Quote } from "lucide-react";

export function Testimonials() {
  const reviews = [
    {
      name: "Dr. Marcus Vance",
      role: "Founder, Apex Chiropractic",
      content:
        "Patient bookings increased by 24% since deploying StarX Flow's WhatsApp receptionist. It answers clinic FAQs and processes dental/chiropractic appointments seamlessly.",
      stat: "+24% bookings",
      img: "https://i.pravatar.cc/150?img=11",
      margin: "mt-0"
    },
    {
      name: "Sarah Jennings",
      role: "Owner, Aura Salon & Spa",
      content:
        "No-shows dropped to near zero because clients receive instant WhatsApp confirmations, calendar reminders, and quick 1-click reschedule options.",
      stat: "-98% no-shows",
      img: "https://i.pravatar.cc/150?img=44",
      margin: "lg:mt-12"
    },
    {
      name: "David Chen",
      role: "Founder, Ironwood Fitness",
      content:
        "Automating lead follow-ups helped us convert 68% of guest pass signups into recurring gym members. The AI receptionist captures every prospect instantly.",
      stat: "68% conversion",
      img: "https://i.pravatar.cc/150?img=33",
      margin: "lg:mt-24"
    }
  ];

  return (
    <section className="py-24 lg:py-32 px-6 relative z-10 bg-black/40 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-4">
            <MessageSquare size={10} className="text-emerald-400" />
            Merchant Reviews
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-white leading-tight">
            Loved by local <br />
            <span className="text-gradient-silver">service leaders.</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-medium">
            Hear from the medical practitioners, studio owners, and beauty artists who put their front desks on autopilot.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
              className={`glass-card p-8 rounded-3xl flex flex-col justify-between ${r.margin} relative`}
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-white/5" />
              <div>
                <div className="flex gap-1 mb-8 relative z-10">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                  ))}
                </div>
                <p className="text-lg text-zinc-300 font-medium leading-relaxed mb-8 relative z-10">
                  "{r.content}"
                </p>
              </div>
              
              <div className="flex items-center gap-4 border-t border-white/5 pt-6 mt-auto relative z-10">
                <img src={r.img} alt={r.name} className="w-12 h-12 rounded-full border border-white/10" />
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{r.name}</p>
                  <p className="text-zinc-500 text-xs font-semibold">{r.role}</p>
                </div>
              </div>
              
              <div className="absolute -top-4 left-6 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold premium-glow border border-emerald-500/30 backdrop-blur-md">
                {r.stat}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
