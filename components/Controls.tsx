'use client';

import type { JSX, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// The browser's own checkbox is drawn by the operating system and ignores the color
// scheme of the page, so it arrives as a small pale square in a dark app. This draws
// the box, and keeps the real input under it for the keyboard and for screen readers.
export function CheckboxRow({
  label,
  checked,
  onChange,
  className,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: () => void;
  className?: string;
}): JSX.Element {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-ink-200 transition-colors hover:bg-ink-750',
        className
      )}
    >
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-ink-500 bg-ink-900 transition-colors checked:border-gold-400 checked:bg-gold-400"
        />
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="pointer-events-none absolute h-3 w-3 text-ink-950 opacity-0 peer-checked:opacity-100"
        >
          <path
            d="M3.5 8.5l3 3 6-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label}
    </label>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

// Two or three states that are always worth seeing at once. A visitor should not have
// to open a menu to learn which of them is on.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  disabled,
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex rounded-md border border-ink-700 bg-ink-900 p-0.5',
        disabled && 'opacity-60',
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-[0.3rem] px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed',
            value === option.value
              ? 'bg-gold-400 text-ink-950'
              : 'text-ink-300 hover:bg-ink-800 hover:text-ink-100'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
