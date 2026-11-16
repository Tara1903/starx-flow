"use client";

import React, { useEffect, useState } from "react";
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login?returnUrl=/dashboard");
      } else {
        setReady(true);
      }
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !ready) {
    return (
      <div className="min-h-screen bg-[#020a07] text-[#f0f5ef] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-4" />
        <p className="text-xs font-mono tracking-widest uppercase text-emerald-400">Loading StarX Flow Dashboard...</p>
      </div>
    );
  }

  return <DashboardLayout />;
}
