import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { SEO } from "../components/SEO";
import { Hero } from "../components/Hero";
import { SocialProof } from "../components/SocialProof";
import { Problem } from "../components/Problem";

import { HowItWorks } from "../components/HowItWorks";
import { Benefits } from "../components/Benefits";
import { Testimonials } from "../components/Testimonials";
import { CTA } from "../components/CTA";

export function Home() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    // If user is logged in, immediately redirect to dashboard
    if (isLoggedIn && !isLoading) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, isLoading, navigate]);

  return (
    <div className="bg-black min-h-screen flex flex-col gap-24 lg:gap-32 pb-32">
      <SEO 
        title="StarX Flow | AI Operating System for Local Businesses" 
        description="Automate bookings, capture leads, and reply to every customer 24/7 on WhatsApp. The premium AI receptionist for local service businesses." 
      />
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="glass-panel rounded-[3rem] overflow-hidden [&_section]:!bg-transparent">
          <SocialProof />
          <Problem />
        </div>
      </div>


      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="glass-hero rounded-[3rem] overflow-hidden [&_section]:!bg-transparent border-t-0">
          <HowItWorks />
          <Benefits />
        </div>
      </div>

      <Testimonials />
      <CTA />
    </div>
  );
}
