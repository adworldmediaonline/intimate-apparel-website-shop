'use client';

import { useCallback, useMemo } from 'react';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import {
  DEFAULT_FILTERS,
  SHOP_SORT_FIELDS,
  SHOP_SORT_ORDERS,
  type ShopFiltersState,
} from '../shop-types';

type QuerySetterValue = string | null;

const toQueryValue = (value: string | undefined) => {
  if (value === undefined || value.trim() === '') {
    return null;
  }

  return value;
};

export const useShopQueryState = () => {
  const [filters, setQueryState] = useQueryStates(
    {
      search: parseAsString.withDefault(DEFAULT_FILTERS.search),
      category: parseAsString.withDefault(DEFAULT_FILTERS.category),
      subcategory: parseAsString.withDefault(DEFAULT_FILTERS.subcategory),
      sortBy: parseAsStringEnum([
        'skuArrangementOrderNo',
        'createdAt',
        'price',
        'title',
      ] as const).withDefault(DEFAULT_FILTERS.sortBy as 'skuArrangementOrderNo'),
      sortOrder: parseAsStringEnum(['asc', 'desc'] as const).withDefault(
        DEFAULT_FILTERS.sortOrder
      ),
    },
    {
      history: 'replace',
    }
  );

  const setSearch = useCallback(
    async (value: string) => {
      await setQueryState({ search: toQueryValue(value) });
    },
    [setQueryState]
  );

  const setSort = useCallback(
    async (sortBy: string, sortOrder: ShopFiltersState['sortOrder']) => {
      await setQueryState({
        sortBy: toQueryValue(sortBy) as any,
        sortOrder: toQueryValue(sortOrder) as any,
      });
    },
    [setQueryState]
  );

  const toggleCategory = useCallback(
    async (category: string) => {
      const active = filters.category.split(',').filter(Boolean);
      const nextCategory = active.includes(category)
        ? active.filter(value => value !== category).join(',')
        : [...active, category].join(',');

      await setQueryState({
        category: toQueryValue(nextCategory),
        subcategory: null,
      });
    },
    [filters.category, setQueryState]
  );

  const toggleSubcategory = useCallback(
    async (subcategory: string) => {
      const active = filters.subcategory.split(',').filter(Boolean);
      const nextSubcategory = active.includes(subcategory)
        ? active.filter(value => value !== subcategory).join(',')
        : [...active, subcategory].join(',');

      await setQueryState({ subcategory: toQueryValue(nextSubcategory) });
    },
    [filters.subcategory, setQueryState]
  );

  const resetFilters = useCallback(async () => {
    await setQueryState({
      search: null,
      category: null,
      subcategory: null,
      sortBy: null,
      sortOrder: null,
    });
  }, [setQueryState]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== DEFAULT_FILTERS.search ||
      filters.category !== DEFAULT_FILTERS.category ||
      filters.subcategory !== DEFAULT_FILTERS.subcategory ||
      filters.sortBy !== DEFAULT_FILTERS.sortBy ||
      filters.sortOrder !== DEFAULT_FILTERS.sortOrder
    );
  }, [filters]);

  const sortKey = useMemo(
    () => `${filters.sortBy}-${filters.sortOrder}`,
    [filters.sortBy, filters.sortOrder]
  );

  return {
    filters,
    setSearch,
    setSort,
    toggleCategory,
    toggleSubcategory,
    resetFilters,
    hasActiveFilters,
    sortKey,
  } as const;
};
