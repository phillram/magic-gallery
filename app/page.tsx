'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, FilterOptions, Set } from '@/lib/types';
import { searchCards, fetchSets, SortKey } from '@/lib/api';
import { appendNewCards } from '@/lib/cards';
import { countActiveFilters } from '@/lib/analytics';
import {
  EMPTY_FILTERS,
  filtersFromParams,
  paramsFromFilters,
  sortFromParams,
} from '@/lib/filter-params';
import ActiveFilters from '@/components/ActiveFilters';
import CardGrid from '@/components/CardGrid';
import FilterBar from '@/components/FilterBar';

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
  const [hasFailed, setHasFailed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  // Bumped by the "Try again" button. It is a dependency of the search, so changing it
  // is what runs the same query a second time.
  const [retryCount, setRetryCount] = useState(0);

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
  const [sort, setLocalSort] = useState<SortKey>(() =>
    sortFromParams(new URLSearchParams(paramString))
  );

  const writeUrl = (nextFilters: FilterOptions, nextSort: SortKey, replace?: boolean) => {
    const query = paramsFromFilters(nextFilters, nextSort).toString();
    const href = query ? `${pathname}?${query}` : pathname;

    if (replace) {
      router.replace(href, { scroll: false });
    } else {
      router.push(href, { scroll: false });
    }
  };

  // Discrete changes push, so back steps through them. Typing replaces, because one
  // history entry per keystroke would make back useless.
  const setFilters = (next: FilterOptions, options?: { replace?: boolean }) => {
    setLocalFilters(next);
    writeUrl(next, sort, options?.replace);
  };

  const setSort = (next: SortKey) => {
    setLocalSort(next);
    writeUrl(filters, next);
  };

  // Only back and forward should pull state out of the URL. Watching the query string
  // instead would also catch our own writes, which land one keystroke behind and would
  // undo what was just typed. pushState and replaceState do not raise popstate, so
  // this fires for real navigation and nothing else.
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setLocalFilters(filtersFromParams(params));
      setLocalSort(sortFromParams(params));
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

  // What the card pages need to offer a way back to this exact set of results.
  const browseQuery = useMemo(
    () => paramsFromFilters(filters, sort).toString() || undefined,
    [filters, sort]
  );

  useEffect(() => {
    const loadSets = async () => {
      const data = await fetchSets();
      setSets(data);
    };
    loadSets();
  }, []);

  // What the search box held when the last query went out. Only the box changes on
  // every keystroke, so only the box needs the pause. A color, a rarity or a sort is
  // one deliberate click, and half a second of nothing after it reads as a dead
  // control.
  const lastSearch = useRef(filters.search);

  useEffect(() => {
    const isTyping = filters.search !== lastSearch.current;
    lastSearch.current = filters.search;

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
        const result = await searchCards(filters, 1, sort);
        if (generation !== searchGeneration.current) {
          return;
        }
        setCards(result.cards);
        setTotalCards(result.total);
        setCurrentPage(1);
        setHasMore(result.hasMore);
        setHasFailed(result.failed);
      } finally {
        if (generation === searchGeneration.current) {
          setIsLoading(false);
          setIsSearchPending(false);
        }
      }
    };

    const timer = setTimeout(loadCards, isTyping ? SEARCH_DEBOUNCE_MS : 0);

    return () => clearTimeout(timer);
  }, [filters, sort, retryCount]);

  const handleLoadMore = async () => {
    const generation = searchGeneration.current;
    setIsLoading(true);
    // The button doubles as the retry, so clear the last failure while this one is in
    // flight rather than leaving both the notice and the spinner on screen.
    setHasFailed(false);
    try {
      const nextPage = currentPage + 1;
      const result = await searchCards(filters, nextPage, sort);
      if (generation !== searchGeneration.current) {
        return;
      }

      // A refused page leaves the list exactly where it was. Counting it as read would
      // skip those cards for good, and its empty hasMore would take away the button
      // that asks for them again.
      if (result.failed) {
        setHasFailed(true);
        return;
      }

      setCards((current) => appendNewCards(current, result.cards));
      setCurrentPage(nextPage);
      setHasMore(result.hasMore);
      setHasFailed(false);
    } finally {
      if (generation === searchGeneration.current) {
        setIsLoading(false);
      }
    }
  };

  const shownCount = Math.min(cards.length, totalCards);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-100 sm:text-4xl">Card browser</h1>
        <p className="mt-1 text-ink-400">
          Every paper Magic card, from Alpha to the newest set.
        </p>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        sets={sets}
        sort={sort}
        onSortChange={setSort}
      />

      {activeFilterCount > 0 && (
        <ActiveFilters filters={filters} setNames={setNames} onFilterChange={setFilters} />
      )}

      {/* The count is the answer to what the filters just did, so a screen reader
          hears it change rather than having to go looking for it. A refused search has
          no count to give, and saying "no cards" there would blame the filters for it. */}
      <p aria-live="polite" className="text-sm text-ink-400">
        {isBusy
          ? 'Searching…'
          : hasFailed && cards.length === 0
            ? 'Could not reach Scryfall'
            : totalCards === 0
              ? 'No cards'
              : `Showing ${shownCount.toLocaleString('en-US')} of ${totalCards.toLocaleString('en-US')} cards`}
      </p>

      <CardGrid
        cards={cards}
        isLoading={isBusy}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        failed={hasFailed}
        onRetry={() => setRetryCount((count) => count + 1)}
        onClearFilters={() => setFilters(EMPTY_FILTERS)}
        hasFilters={activeFilterCount > 0}
        from={browseQuery}
      />
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
