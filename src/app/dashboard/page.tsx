"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { DashboardLayout } from "../../screens/dashboard/DashboardLayout";

/**
 * Dashboard Page
 * Renders the full StarX Flow Autonomous Business Operating System.
 * Enforces authentication: unauthenticated visits are redirected to login.
 */
export default function Dashboard() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const onboardingComplete = useAuthStore((s) => s.user?.onboardingComplete);

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) router.replace("/login?returnUrl=/dashboard");
    else if (onboardingComplete === false) router.replace("/setup/welcome");
  }, [isLoading, isLoggedIn, onboardingComplete, router]);

  if (isLoading || !isLoggedIn || onboardingComplete === false) {
    return (
      <div className="min-h-screen bg-[#020a07] text-[#f0f5ef] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-4" />
        <p className="text-xs font-mono tracking-widest uppercase text-emerald-400">Loading StarX Flow Dashboard...</p>
      </div>
    );
  }

  return <DashboardLayout />;
}
