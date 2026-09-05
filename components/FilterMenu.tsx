'use client';

import { useEffect, useId, useRef, useState, type JSX, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FilterMenuProps {
  label: string;
  // How many choices the visitor has made in this menu. It sits on the closed button,
  // so a filter is never hidden behind a menu nobody thinks to open.
  count?: number;
  // What the button says instead of the count, when one word describes the choice
  // better than a number does.
  summary?: string;
  width?: string;
  children: ReactNode;
}

function ChevronIcon({ isOpen }: { isOpen: boolean }): JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export default function FilterMenu({
  label,
  count = 0,
  summary,
  width = 'w-72',
  children,
}: FilterMenuProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const isActive = count > 0 || Boolean(summary);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Escape closes the menu and hands focus back, so the keyboard is not left
    // standing inside a panel that is no longer on screen.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'border-gold-500/60 bg-gold-500/10 text-gold-200 hover:border-gold-400'
            : 'border-ink-700 bg-ink-900 text-ink-200 hover:border-ink-600 hover:text-ink-100'
        )}
      >
        {label}
        {summary ? (
          <span className="text-gold-300">{summary}</span>
        ) : (
          count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs font-semibold text-ink-950">
              {count}
            </span>
          )
        )}
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div
          id={panelId}
          className={cn(
            'absolute left-0 z-40 mt-2 max-w-[calc(100vw-2rem)] rounded-lg border border-ink-700 bg-ink-850 p-3 shadow-2xl shadow-black/60',
            width
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
