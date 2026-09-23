import { useQuery } from '@tanstack/react-query';
import { scenarioApi } from '../services/scenarioApi';
import type { PaginatedScenarios } from '../types/scenario.types';

/**
 * API-04 search. Deliberately NOT cached offline (FR-01 §37 wants a
 * distinct empty-results state, not stale search results) and only runs
 * once the query is non-trivial to avoid firing a request per keystroke
 * on an empty box.
 */
export function useScenarioSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['scenarios', 'search', trimmed],
    enabled: trimmed.length > 0,
    queryFn: (): Promise<PaginatedScenarios> => scenarioApi.search(trimmed),
    staleTime: 30 * 1000,
  });
}
