"use client";

import React from "react";
import Link from "next/link";
import { Dumbbell, Stethoscope, Scissors, Sparkles, GraduationCap, ArrowRight } from "lucide-react";
import { SpatialScrollScene } from "./SpatialScrollScene";
import { SpatialSectionHeader } from "./SpatialSectionHeader";
import { SpatialGlassCard } from "./SpatialGlassCard";

export function SpatialIndustriesScene() {
  const industries = [
    {
      title: "Dental & Medical Clinics",
      icon: <Stethoscope className="w-5 h-5 text-emerald-400" />,
      href: "/industries/dental-clinics",
      badge: "Healthcare",
      desc: "Patient appointment booking, automated digital intake waivers, and physician calendar concurrency locks.",
    },
    {
      title: "Gyms & Fitness Studios",
      icon: <Dumbbell className="w-5 h-5 text-emerald-400" />,
      href: "/industries/gyms-fitness",
      badge: "Fitness",
      desc: "Trial class signups, member recurring bookings, trainer rosters, and automated workout reminders.",
    },
    {
      title: "Salons & Aesthetics",
      icon: <Scissors className="w-5 h-5 text-emerald-400" />,
      href: "/industries/beauty-salons",
      badge: "Beauty",
      desc: "Stylist availability coordination, service menu inquiries, deposit reminders, and Google review boosters.",
    },
    {
      title: "Spas & Wellness Sanctuaries",
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      href: "/industries/wellness-therapy",
      badge: "Wellness",
      desc: "Therapist room allocations, massage packages, 24h pre-arrival health waivers, and zero no-shows.",
    },
    {
      title: "Education & Private Tutors",
      icon: <GraduationCap className="w-5 h-5 text-emerald-400" />,
      href: "/industries/education",
      badge: "Education",
      desc: "Recurring lesson slots, student calendar sync, parent confirmation updates, and reschedule management.",
    },
  ];

  return (
    <SpatialScrollScene
      id="industries"
      sceneNumber="07"
      ambientBeam="center"
      className="border-t border-white/5"
    >
      <SpatialSectionHeader
        badge="SCENE 07 // VERIFIED INDUSTRY WORKFLOWS"
        badgeIcon={<Sparkles size={13} className="text-emerald-400" />}
        titlePrefix="Specialized intelligence for"
        titleHighlight="high-touch services."
        titleSuffix=""
        subtitle="Custom-tailored booking workflows trained on the exact operational nuances of your industry vertical."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {industries.map((ind) => (
          <Link key={ind.href} href={ind.href} className="group">
            <SpatialGlassCard
              variant="secondary"
              hoverTilt={true}
              glow={true}
              className="p-7 rounded-3xl border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    {ind.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.05] text-zinc-300 border border-white/10">
                    {ind.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight mb-2 group-hover:text-emerald-300 transition-colors">
                  {ind.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                  {ind.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>View Specialized Workflows</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </SpatialGlassCard>
          </Link>
        ))}
      </div>
    </SpatialScrollScene>
  );
}
