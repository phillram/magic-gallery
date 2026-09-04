'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SetOption {
  code: string;
  name: string;
}

interface SetPickerProps {
  sets: SetOption[];
  selected: string[];
  onToggle: (code: string) => void;
  disabled?: boolean;
}

// There are close to a thousand paper sets. Rendering every one on an empty query
// costs more than it helps, and a real query narrows well below this.
const MAX_VISIBLE = 100;

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

export default function SetPicker({ sets, selected, onToggle, disabled }: SetPickerProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Match anywhere in the name or the code, so "ther" finds Aetherdrift as well as
  // Theros, and "thb" finds Theros Beyond Death by its code.
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return sets.slice(0, MAX_VISIBLE);
    }

    return sets
      .map((set) => ({ set, rank: matchRank(set, needle) }))
      .filter((entry) => entry.rank >= 0)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, MAX_VISIBLE)
      .map((entry) => entry.set);
  }, [sets, query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen]);

  useEffect(() => {
    listRef.current?.children[highlighted]?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  const open = () => {
    setIsOpen(true);
    setHighlighted(0);
  };

  const select = (code: string) => {
    onToggle(code);
    setQuery('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        open();
        return;
      }
      if (matches.length === 0) {
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setHighlighted((current) => (current + step + matches.length) % matches.length);
      return;
    }

    if (event.key === 'Enter' && isOpen && matches[highlighted]) {
      event.preventDefault();
      select(matches[highlighted].code);
      return;
    }

    if (event.key === 'Backspace' && query === '' && selected.length > 0) {
      onToggle(selected[selected.length - 1]);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="set-picker-list"
          aria-autocomplete="list"
          aria-label="Search sets"
          placeholder={
            selected.length > 0
              ? `${selected.length} set${selected.length > 1 ? 's' : ''} selected`
              : 'All sets, type to search'
          }
          value={query}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setHighlighted(0);
          }}
          onFocus={open}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded',
            'focus:border-blue-500 focus:outline-none disabled:opacity-50',
            selected.length > 0 && !query && 'placeholder:text-slate-100'
          )}
        />
      </div>

      {isOpen && (
        <ul
          id="set-picker-list"
          ref={listRef}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded border border-slate-700 bg-slate-800 shadow-lg"
        >
          {matches.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-400">No sets match “{query}”</li>
          )}

          {matches.map((set, index) => (
            <li key={set.code} role="option" aria-selected={selected.includes(set.code)}>
              <button
                type="button"
                onClick={() => select(set.code)}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm',
                  index === highlighted ? 'bg-slate-700' : 'hover:bg-slate-700',
                  selected.includes(set.code) ? 'text-blue-300' : 'text-slate-100'
                )}
              >
                <span className="truncate">
                  <span aria-hidden="true" className="mr-1.5 inline-block w-3">
                    {selected.includes(set.code) ? '✓' : ''}
                  </span>
                  {set.name}
                </span>
                <span className="shrink-0 font-mono text-xs uppercase text-slate-400">{set.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
