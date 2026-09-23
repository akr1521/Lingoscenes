import { supabase } from '@/lib/supabase';
import type {
  ScenarioCategoryWithCount,
  ScenarioLevel,
  PaginatedScenarios,
  RecommendedScenario,
  ScenarioDetail,
  StartScenarioResult,
} from '../types/scenario.types';
import { ScenarioApiError } from '../types/scenario.types';

// This service is the single seam between the app and the backend for
// FR-01. It talks to Postgres RPC functions (supabase/migrations/0002_scenarios.sql)
// rather than a separate REST server, but every method mirrors an API-0X
// endpoint from the Tech Requirement doc 1:1 — same params, same response
// shape — so swapping to a real HTTP backend later only means changing the
// bodies of these functions, never any calling code (hooks/components).
//
// Architectural rule (FR-01 §18): none of these calls ever fetch full
// lesson content (video/audio/exercise/transcript) — only metadata,
// thumbnail, progress, and access information.

export interface BrowseScenariosParams {
  category?: string;
  level?: ScenarioLevel;
  duration?: number; // max duration in minutes
  isPremium?: boolean;
  page?: number;
  pageSize?: number;
}

function unwrapOrThrow<T>(data: unknown): T {
  const record = data as { error?: { code: string; message: string } };
  if (record && record.error) {
    throw new ScenarioApiError(record.error.code, record.error.message);
  }
  return data as T;
}

export const scenarioApi = {
  /** API-01 — GET /api/v1/scenario-categories */
  async getCategories(): Promise<{ items: ScenarioCategoryWithCount[] }> {
    const { data, error } = await supabase.rpc('get_scenario_categories');
    if (error) throw new ScenarioApiError('INTERNAL_ERROR', error.message);
    return unwrapOrThrow<{ items: ScenarioCategoryWithCount[] }>(data);
  },

  /** API-02 — GET /api/v1/scenarios?category=&level=&duration=&page=&pageSize= */
  async browseScenarios(params: BrowseScenariosParams = {}): Promise<PaginatedScenarios> {
    const { category, level, duration, isPremium, page = 1, pageSize = 20 } = params;
    const { data, error } = await supabase.rpc('browse_scenarios', {
      p_category: category ?? null,
      p_level: level ?? null,
      p_max_duration: duration ?? null,
      p_is_premium: isPremium ?? null,
      p_page: page,
      p_page_size: pageSize,
    });
    if (error) throw new ScenarioApiError('INTERNAL_ERROR', error.message);
    return unwrapOrThrow<PaginatedScenarios>(data);
  },

  /** API-03 — GET /api/v1/scenarios/recommended?limit= */
  async getRecommended(limit = 10): Promise<{ items: RecommendedScenario[] }> {
    const { data, error } = await supabase.rpc('get_recommended_scenarios', { p_limit: limit });
    if (error) throw new ScenarioApiError('INTERNAL_ERROR', error.message);
    return unwrapOrThrow<{ items: RecommendedScenario[] }>(data);
  },

  /** API-04 — GET /api/v1/scenarios/search?q= */
  async search(query: string, page = 1, pageSize = 20): Promise<PaginatedScenarios> {
    const { data, error } = await supabase.rpc('search_scenarios', {
      p_query: query,
      p_page: page,
      p_page_size: pageSize,
    });
    if (error) throw new ScenarioApiError('INTERNAL_ERROR', error.message);
    return unwrapOrThrow<PaginatedScenarios>(data);
  },

  /** API-05 — GET /api/v1/scenarios/{scenarioId} */
  async getScenarioDetail(scenarioId: string): Promise<ScenarioDetail> {
    const { data, error } = await supabase.rpc('get_scenario_detail', { p_scenario_id: scenarioId });
    if (error) throw new ScenarioApiError('INTERNAL_ERROR', error.message);
    return unwrapOrThrow<ScenarioDetail>(data);
  },

  /** API-06 — POST /api/v1/scenarios/{scenarioId}/start */
  async startScenario(scenarioId: string): Promise<StartScenarioResult> {
    const { data, error } = await supabase.rpc('start_scenario', { p_scenario_id: scenarioId });
    if (error) throw new ScenarioApiError('INTERNAL_ERROR', error.message);
    return unwrapOrThrow<StartScenarioResult>(data);
  },
};
