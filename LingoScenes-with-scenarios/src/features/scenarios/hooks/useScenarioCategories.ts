import { useQuery } from '@tanstack/react-query';
import { scenarioApi } from '../services/scenarioApi';
import { localCache } from '@/lib/localCache';
import type { ScenarioCategoryWithCount } from '../types/scenario.types';

const CACHE_KEY = 'scenario-categories';

/**
 * Categories are backend-driven (FR-01 §14) — never hard-code category
 * names here. If the network fails and we have a cached response, fall
 * back to it (FR-01 §34/§36) instead of surfacing a blank/error state.
 */
export function useScenarioCategories() {
  return useQuery({
    queryKey: ['scenarios', 'categories'],
    queryFn: async (): Promise<ScenarioCategoryWithCount[]> => {
      try {
        const { items } = await scenarioApi.getCategories();
        await localCache.set(CACHE_KEY, items);
        return items;
      } catch (err) {
        const cached = await localCache.get<ScenarioCategoryWithCount[]>(CACHE_KEY);
        if (cached) return cached;
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // categories change rarely
  });
}
