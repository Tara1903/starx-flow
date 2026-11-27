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
    <div className="min-h-screen bg-[#080a09] text-[#edf0ee] flex flex-col items-center justify-center font-sans">
      <div className="w-8 h-8 rounded-full border-2 border-[#edf0ee]/20 border-t-[#34d399] animate-spin mb-3" />
      <p className="text-xs font-medium text-[#a1aaa4]">
        Opening workspace settings
      </p>
    </div>
  );
}
