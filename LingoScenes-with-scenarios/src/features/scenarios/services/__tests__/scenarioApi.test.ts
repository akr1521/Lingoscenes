import { scenarioApi } from '../scenarioApi';
import { ScenarioApiError } from '../../types/scenario.types';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: jest.fn() },
}));

const mockedRpc = supabase.rpc as jest.Mock;

describe('scenarioApi', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  it('getCategories calls the get_scenario_categories RPC and returns items (API-01)', async () => {
    mockedRpc.mockResolvedValueOnce({
      data: { items: [{ id: 'cat_travel', name: 'Travel', slug: 'travel', scenarioCount: 15 }] },
      error: null,
    });

    const result = await scenarioApi.getCategories();

    expect(mockedRpc).toHaveBeenCalledWith('get_scenario_categories');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].slug).toBe('travel');
  });

  it('browseScenarios forwards filters and pagination params (API-02)', async () => {
    mockedRpc.mockResolvedValueOnce({
      data: { items: [], pagination: { page: 1, pageSize: 20, totalItems: 0, hasNextPage: false } },
      error: null,
    });

    await scenarioApi.browseScenarios({ category: 'travel', level: 'BEGINNER', page: 1, pageSize: 20 });

    expect(mockedRpc).toHaveBeenCalledWith('browse_scenarios', {
      p_category: 'travel',
      p_level: 'BEGINNER',
      p_max_duration: null,
      p_is_premium: null,
      p_page: 1,
      p_page_size: 20,
    });
  });

  it('search passes the query through to search_scenarios (API-04)', async () => {
    mockedRpc.mockResolvedValueOnce({
      data: { items: [], pagination: { page: 1, pageSize: 20, totalItems: 3, hasNextPage: false } },
      error: null,
    });

    await scenarioApi.search('parents');

    expect(mockedRpc).toHaveBeenCalledWith('search_scenarios', { p_query: 'parents', p_page: 1, p_page_size: 20 });
  });

  it('startScenario surfaces a ScenarioApiError when the backend returns an error payload (e.g. locked premium scenario)', async () => {
    mockedRpc.mockResolvedValue({
      data: { error: { code: 'NOT_AUTHORIZED', message: 'Premium subscription required' } },
      error: null,
    });

    await expect(scenarioApi.startScenario('scn_003')).rejects.toThrow(ScenarioApiError);
    await expect(scenarioApi.startScenario('scn_003')).rejects.toMatchObject({ code: 'NOT_AUTHORIZED' });
  });

  it('wraps a Supabase transport error as a ScenarioApiError instead of throwing a raw PostgrestError', async () => {
    mockedRpc.mockResolvedValueOnce({ data: null, error: { message: 'network error' } });

    await expect(scenarioApi.getScenarioDetail('scn_001')).rejects.toThrow(ScenarioApiError);
  });
});
