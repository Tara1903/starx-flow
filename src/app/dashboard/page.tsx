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
      <div className="min-h-screen bg-[#080a09] text-[#edf0ee] flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-[#edf0ee]/20 border-t-[#34d399] animate-spin mb-3" />
        <p className="text-xs font-medium text-[#a1aaa4]">Loading StarX Flow workspace</p>
      </div>
    );
  }

  return <DashboardLayout />;
}
