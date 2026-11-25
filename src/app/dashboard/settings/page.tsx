"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardSettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("section", "settings");
    router.replace(`/dashboard?${params.toString()}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#020a07] text-[#f0f5ef] flex flex-col items-center justify-center font-sans">
      <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-4" />
      <p className="text-xs font-mono tracking-widest uppercase text-emerald-400">
        Returning to Workspace Settings...
      </p>
    </div>
  );
}
