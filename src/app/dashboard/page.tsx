"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { DashboardLayout } from "../../screens/dashboard/DashboardLayout";

/**
 * Dashboard Page
 * Protected route: ensures unauthenticated visitors are redirected to authentication flow.
 */
export default function Dashboard() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const openLogin = useUIStore((s) => s.openLogin);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/");
      openLogin();
    }
  }, [isLoading, isLoggedIn, router, openLogin]);

  if (!isLoading && !isLoggedIn) {
    return null;
  }

  return <DashboardLayout />;
}
