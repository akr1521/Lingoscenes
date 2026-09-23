import { useQuery } from '@tanstack/react-query';
import { scenarioApi } from '../services/scenarioApi';
import { localCache } from '@/lib/localCache';
import { useAuthStore } from '@/store/authStore';
import type { RecommendedScenario } from '../types/scenario.types';

const CACHE_KEY = 'scenario-recommended';

/** Powers the "Recommended for you" section (FR-01 §15). */
export function useRecommendedScenarios(limit = 10) {
  const session = useAuthStore((s) => s.session);

  return useQuery({
    queryKey: ['scenarios', 'recommended', limit],
    enabled: !!session, // recommendations require the authenticated user (FR-01 §43)
    queryFn: async (): Promise<RecommendedScenario[]> => {
      try {
        const { items } = await scenarioApi.getRecommended(limit);
        await localCache.set(CACHE_KEY, items);
        return items;
      } catch (err) {
        const cached = await localCache.get<RecommendedScenario[]>(CACHE_KEY);
        if (cached) return cached;
        throw err;
      }
    },
    staleTime: 60 * 1000,
  });
}
