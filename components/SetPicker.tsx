'use client';

import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { cn } from '@/lib/utils';
import { SetIcon } from './CardMeta';

interface SetOption {
  code: string;
  name: string;
}

interface SetPickerProps {
  sets: SetOption[];
  selected: string[];
  onToggle: (code: string) => void;
}

// Sets share long prefixes with their token and promo siblings, so a plain substring
// match buries the one someone meant: "thb" would list Theros Beyond Death third,
// behind its own promos and tokens. Rank the closest kind of match first and keep the
// incoming release order within each tier. -1 means no match.
function matchRank(set: SetOption, needle: string): number {
  const name = set.name.toLowerCase();
  const code = set.code.toLowerCase();

  if (code === needle) return 0;
  if (name === needle) return 1;
  if (name.startsWith(needle)) return 2;
  if (code.startsWith(needle)) return 3;
  if (name.includes(needle) || code.includes(needle)) return 4;
  return -1;
}

// The list lives inside a menu that is already open, so it does not open or close
// itself. Everything here is about finding one set among a thousand.
export default function SetPicker({ sets, selected, onToggle }: SetPickerProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Match anywhere in the name or the code, so "ther" finds Aetherdrift as well as
  // Theros, and "thb" finds Theros Beyond Death by its code.
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return sets;
    }

    return sets
      .map((set) => ({ set, rank: matchRank(set, needle) }))
      .filter((entry) => entry.rank >= 0)
      .sort((a, b) => a.rank - b.rank)
      .map((entry) => entry.set);
  }, [sets, query]);

  useEffect(() => {
    listRef.current?.children[highlighted]?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (matches.length === 0) {
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setHighlighted((current) => (current + step + matches.length) % matches.length);
      return;
    }

    if (event.key === 'Enter' && matches[highlighted]) {
      event.preventDefault();
      onToggle(matches[highlighted].code);
      return;
    }

    // Backspace on an empty box drops the set added last, the way a tag field does.
    if (event.key === 'Backspace' && query === '' && selected.length > 0) {
      onToggle(selected[selected.length - 1]);
    }
  };

  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="set-picker-list"
          aria-autocomplete="list"
          aria-label="Search sets"
          placeholder="Type a set name or code"
          value={query}
          autoFocus
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlighted(0);
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-md border border-ink-700 bg-ink-900 py-2 pl-3 pr-9 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500"
        />

        {query !== '' && (
          <button
            type="button"
            aria-label="Clear the set search"
            onClick={() => {
              setQuery('');
              setHighlighted(0);
              inputRef.current?.focus();
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm px-2 text-base leading-none text-ink-500 transition-colors hover:text-gold-300"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {matches.length > 0 && (
        <p className="mt-2 text-xs text-ink-500">
          Showing {matches.length} of {sets.length} sets
        </p>
      )}

      <ul
        id="set-picker-list"
        ref={listRef}
        role="listbox"
        aria-label="Sets"
        aria-multiselectable="true"
        className="mt-2 max-h-64 overflow-y-auto rounded-md border border-ink-800"
      >
        {matches.length === 0 && (
          <li className="px-3 py-2 text-sm text-ink-400">No set matches “{query}”</li>
        )}

        {matches.map((set, index) => (
          <li
            key={set.code}
            role="option"
            aria-selected={selected.includes(set.code)}
            className="set-option"
          >
            <button
              type="button"
              onClick={() => {
                onToggle(set.code);
                // The search stays, so the next set in the same result list is one
                // click away. Focus goes back to the box, which keeps typing, the
                // arrow keys, and Backspace working after a click.
                inputRef.current?.focus();
              }}
              onMouseEnter={() => setHighlighted(index)}
              className={cn(
                'flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors',
                index === highlighted ? 'bg-ink-750' : 'hover:bg-ink-750',
                selected.includes(set.code) ? 'text-gold-200' : 'text-ink-200'
              )}
            >
              <span aria-hidden="true" className="w-3.5 shrink-0 text-gold-300">
                {selected.includes(set.code) ? '✓' : ''}
              </span>
              <SetIcon setCode={set.code} className="text-base" />
              <span className="truncate">{set.name}</span>
              <span className="ml-auto shrink-0 font-mono text-xs uppercase text-ink-500">
                {set.code}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
