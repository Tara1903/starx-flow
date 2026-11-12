import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { CursorPlaygroundClient } from './CursorPlaygroundClient';

export const metadata: Metadata = {
  title: 'Custom Cursor 2.0 Playground | StarX Flow QA',
  description:
    'Internal QA and interaction verification lab for StarX Flow Custom Cursor 2.0.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

interface CursorPlaygroundPageProps {
  searchParams: Promise<{ qa?: string }>;
}

export default async function CursorPlaygroundPage({
  searchParams,
}: CursorPlaygroundPageProps) {
  const params = await searchParams;
  const isDev = process.env.NODE_ENV !== 'production';
  const isAuthorizedQa = params?.qa === 'verify';

  if (!isDev && !isAuthorizedQa) {
    return (
      <div className="min-h-screen bg-[#020504] text-zinc-100 flex items-center justify-center px-6 py-24">
        <div
          data-testid="pg-production-restricted"
          className="max-w-md w-full rounded-2xl border border-emerald-500/25 bg-[#060f0b] p-8 text-center space-y-4"
        >
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/12 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white">
            Internal QA Playground Restricted
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The Custom Cursor 2.0 tuning sandbox is disabled on public production traffic.
            Authorized QA verification sessions require an explicit internal access parameter.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-500 text-[#02120c] text-sm font-bold hover:bg-white transition-colors"
            >
              Return to StarX Flow
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <CursorPlaygroundClient />;
}
