import { FilterOptions } from './types';

export function countActiveFilters(filters: FilterOptions): number {
  return (
    (filters.search ? 1 : 0) +
    filters.sets.length +
    filters.colors.length +
    filters.types.length +
    filters.rarities.length +
    (filters.exactMana !== null ? 1 : 0) +
    (filters.minMana !== null ? 1 : 0) +
    (filters.maxMana !== null ? 1 : 0)
  );
}
