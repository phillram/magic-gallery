'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, FilterOptions, Set } from '@/lib/types';
import { searchCards, fetchSets, SORT_OPTIONS, DEFAULT_SORT, SortKey } from '@/lib/api';
import { countActiveFilters } from '@/lib/analytics';
import { filtersFromParams, paramsFromFilters } from '@/lib/filter-params';
import { cn } from '@/lib/utils';
import FilterSidebar from '@/components/FilterSidebar';
import ActiveFilters from '@/components/ActiveFilters';
import CardGrid from '@/components/CardGrid';
import Header from '@/components/Header';
import RandomCardButton from '@/components/RandomCardButton';

// Wait for a pause in the typing before searching, so a card name goes out as one
// query instead of one query per letter.
const SEARCH_DEBOUNCE_MS = 500;

function CardBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [cards, setCards] = useState<Card[]>([]);
  const [sets, setSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [showFilters, setShowFilters] = useState(false);

  // Each change of the filters or the sort starts a new generation of results. Requests
  // can overlap now that the controls stay live, and the slower of two would otherwise
  // land last and show cards for a query nobody is looking at.
  const searchGeneration = useRef(0);

  // Filters are held here and mirrored into the query string, rather than read back
  // out of it. Writing the URL is asynchronous, so deriving the filters from it made
  // two quick clicks race: the second read the state from before the first landed.
  const paramString = searchParams.toString();
  const [filters, setLocalFilters] = useState<FilterOptions>(() =>
    filtersFromParams(new URLSearchParams(paramString))
  );

  // Discrete changes push, so back steps through them. Typing replaces, because one
  // history entry per keystroke would make back useless.
  const setFilters = (next: FilterOptions, options?: { replace?: boolean }) => {
    setLocalFilters(next);
    const query = paramsFromFilters(next).toString();
    const href = query ? `${pathname}?${query}` : pathname;

    if (options?.replace) {
      router.replace(href, { scroll: false });
    } else {
      router.push(href, { scroll: false });
    }
  };

  // Only back and forward should pull state out of the URL. Watching the query string
  // instead would also catch our own writes, which land one keystroke behind and would
  // undo what was just typed. pushState and replaceState do not raise popstate, so
  // this fires for real navigation and nothing else.
  useEffect(() => {
    const onPopState = () => {
      setLocalFilters(filtersFromParams(new URLSearchParams(window.location.search)));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // The results are out of date from the first keystroke until the answer comes back,
  // so the grid shows one state for the wait and the request together.
  const isBusy = isSearchPending || isLoading;

  const activeFilterCount = countActiveFilters(filters);

  const setNames = useMemo(
    () => Object.fromEntries(sets.map((set) => [set.code, set.name])),
    [sets]
  );

  // Load sets on mount
  useEffect(() => {
    const loadSets = async () => {
      const data = await fetchSets();
      setSets(data);
    };
    loadSets();
  }, []);

  // Load initial cards
  useEffect(() => {
    // Announce the wait before the debounce rather than after it, so the results read
    // as "more are coming" instead of briefly claiming there are none. The filters stay
    // usable through it: a control that locks under the hand costs more than a stray
    // request, and a superseded request is dropped below.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the wait has to be announced before the debounce, not after
    setIsSearchPending(true);

    searchGeneration.current += 1;
    const generation = searchGeneration.current;

    const loadCards = async () => {
      setIsLoading(true);
      try {
        const { cards: newCards, total, hasMore: moreAvailable } = await searchCards(filters, 1, sort);
        if (generation !== searchGeneration.current) {
          return;
        }
        setCards(newCards);
        setTotalCards(total);
        setCurrentPage(1);
        setHasMore(moreAvailable);
      } finally {
        if (generation === searchGeneration.current) {
          setIsLoading(false);
          setIsSearchPending(false);
        }
      }
    };

    const timer = setTimeout(loadCards, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filters, sort]);

  const handleLoadMore = async () => {
    const generation = searchGeneration.current;
    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const { cards: newCards, hasMore: moreAvailable } = await searchCards(filters, nextPage, sort);
      if (generation !== searchGeneration.current) {
        return;
      }
      setCards([...cards, ...newCards]);
      setCurrentPage(nextPage);
      setHasMore(moreAvailable);

    } finally {
      if (generation === searchGeneration.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Action Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Card Browser</h1>
          <div className="flex items-center gap-3">
            {/* Below the sidebar breakpoint the filters are collapsed, so the results
                are the first thing on the page instead of the last. */}
            <button
              type="button"
              onClick={() => setShowFilters((shown) => !shown)}
              aria-expanded={showFilters}
              aria-controls="filter-sidebar"
              className="lg:hidden px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-semibold transition-colors"
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
            <RandomCardButton />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div
            id="filter-sidebar"
            className={cn(
              'lg:col-span-1 lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)]',
              showFilters ? 'block' : 'hidden'
            )}
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              sets={sets}
            />
          </div>

          {/* Cards Grid */}
          <div className="lg:col-span-3">
            <ActiveFilters filters={filters} setNames={setNames} onFilterChange={setFilters} />
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-slate-400">
                {isBusy ? 'Loading...' : `${Math.min(cards.length, totalCards)} of ${totalCards} cards`}
              </p>
              <label className="flex items-center gap-2 text-sm text-slate-400">
                Sort by
                <select
                  value={sort}
                  onChange={(e) => {
                    const nextSort = e.target.value as SortKey;
                    setSort(nextSort);
                  }}
                  className="px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded-sm focus:border-blue-500 focus:outline-hidden"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <CardGrid
              cards={cards}
              isLoading={isBusy}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  // useSearchParams needs a boundary, or the whole route opts out of static rendering.
  return (
    <Suspense fallback={null}>
      <CardBrowser />
    </Suspense>
  );
}
