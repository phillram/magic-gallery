'use client';

import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            ✨ Magic Card Browser
          </button>
          <div className="text-slate-400 text-sm">
            Search, filter, and discover Magic: The Gathering cards
          </div>
        </div>
      </div>
    </header>
  );
}
