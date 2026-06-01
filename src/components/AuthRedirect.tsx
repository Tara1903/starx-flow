'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export function AuthRedirect({ to }: { to: string }) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.push(to);
    }
  }, [isLoggedIn, isLoading, router, to]);

  return null;
}
