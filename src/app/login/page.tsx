"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SignupModal } from '@/components/SignupModal';

function LoginContent() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const mode = (searchParams.get('mode') as 'login' | 'signup') || 'login';

  return (
    <SignupModal
      isStandalone={true}
      defaultMode={mode}
      returnUrl={returnUrl}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020a07] text-[#f0f5ef] flex items-center justify-center font-sans">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
