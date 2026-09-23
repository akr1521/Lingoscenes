import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scenarioApi } from '../services/scenarioApi';
import { localCache } from '@/lib/localCache';
import type { ScenarioDetail, StartScenarioResult } from '../types/scenario.types';

function cacheKeyFor(scenarioId: string) {
  return `scenario-detail:${scenarioId}`;
}

/** Scenario Detail screen data (API-05), with offline fallback (FR-01 §34). */
export function useScenario(scenarioId: string | undefined) {
  return useQuery({
    queryKey: ['scenarios', 'detail', scenarioId],
    enabled: !!scenarioId,
    queryFn: async (): Promise<ScenarioDetail> => {
      const id = scenarioId as string;
      try {
        const detail = await scenarioApi.getScenarioDetail(id);
        await localCache.set(cacheKeyFor(id), detail);
        return detail;
      } catch (err) {
        const cached = await localCache.get<ScenarioDetail>(cacheKeyFor(id));
        if (cached) return cached;
        throw err;
      }
    },
    staleTime: 60 * 1000,
  });
}

/** POST /scenarios/{id}/start (API-06) — the backend (not the client) decides access. */
export function useStartScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scenarioId: string): Promise<StartScenarioResult> => scenarioApi.startScenario(scenarioId),
    onSuccess: (_result, scenarioId) => {
      // Progress changed — invalidate any list/detail views showing it.
      queryClient.invalidateQueries({ queryKey: ['scenarios', 'detail', scenarioId] });
      queryClient.invalidateQueries({ queryKey: ['scenarios', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['scenarios', 'recommended'] });
    },
  });
}
