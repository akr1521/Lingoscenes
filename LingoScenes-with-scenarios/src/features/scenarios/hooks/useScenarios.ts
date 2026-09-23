import { useInfiniteQuery } from '@tanstack/react-query';
import { scenarioApi } from '../services/scenarioApi';
import { localCache } from '@/lib/localCache';
import type { PaginatedScenarios, ScenarioFilterState } from '../types/scenario.types';

const PAGE_SIZE = 20; // FR-01 §32: page=1, pageSize=20
const CACHE_KEY_PREFIX = 'scenario-list';

function cacheKeyFor(filters: ScenarioFilterState) {
  return `${CACHE_KEY_PREFIX}:${filters.category ?? 'all'}:${filters.level ?? 'all'}`;
}

/**
 * Backs the Scenario Browser's main list. Uses `useInfiniteQuery` so the
 * screen's FlatList (FR-01 §32) can request the next page via
 * `onEndReached` rather than ever fetching the whole catalogue.
 */
export function useScenarios(filters: ScenarioFilterState) {
  const cacheKey = cacheKeyFor(filters);

  return useInfiniteQuery({
    queryKey: ['scenarios', 'list', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<PaginatedScenarios> => {
      try {
        const result = await scenarioApi.browseScenarios({
          category: filters.category,
          level: filters.level,
          page: pageParam,
          pageSize: PAGE_SIZE,
        });
        if (pageParam === 1) await localCache.set(cacheKey, result);
        return result;
      } catch (err) {
        if (pageParam === 1) {
          const cached = await localCache.get<PaginatedScenarios>(cacheKey);
          if (cached) return cached;
        }
        throw err;
      }
    },
    getNextPageParam: (lastPage) => (lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined),
    staleTime: 60 * 1000,
  });
}
