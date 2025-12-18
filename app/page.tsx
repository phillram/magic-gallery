'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, FilterOptions, Set } from '@/lib/types';
import { searchCards, fetchSets } from '@/lib/api';
import FilterSidebar from '@/components/FilterSidebar';
import CardGrid from '@/components/CardGrid';
import Header from '@/components/Header';
import RandomCardButton from '@/components/RandomCardButton';

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [sets, setSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sets: [],
    colors: [],
    types: [],
    rarities: [],
    minMana: null,
    maxMana: null,
    exactMana: null,
  });

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
    const loadCards = async () => {
      setIsLoading(true);
      try {
        const { cards: newCards, total } = await searchCards(filters, 1);
        setCards(newCards);
        setTotalCards(total);
        setCurrentPage(1);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadCards();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const { cards: newCards } = await searchCards(filters, nextPage);
      setCards([...cards, ...newCards]);
      setCurrentPage(nextPage);
    } finally {
      setIsLoading(false);
    }
  };

  const cardsPerPage = 28;
  const hasMore = cards.length < totalCards && cards.length % cardsPerPage === 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Card Browser</h1>
          <RandomCardButton />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              onFilterChange={setFilters}
              sets={sets}
              isLoading={isLoading}
            />
          </div>

          {/* Cards Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-slate-400">
                {isLoading ? 'Loading...' : `${Math.min(cards.length, totalCards)} of ${totalCards} cards`}
              </p>
            </div>
            <CardGrid
              cards={cards}
              isLoading={isLoading}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
