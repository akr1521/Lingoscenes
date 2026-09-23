import { getScenarioCardState, getScenarioCardCta } from '../scenarioCardState';

describe('getScenarioCardState', () => {
  it('returns not_started when there is no progress and the scenario is free', () => {
    expect(getScenarioCardState({ isPremium: false, isUnlocked: true })).toBe('not_started');
  });

  it('returns in_progress when progress status is IN_PROGRESS', () => {
    expect(
      getScenarioCardState({
        isPremium: false,
        isUnlocked: true,
        progress: { status: 'IN_PROGRESS', completedInteractions: 4, totalInteractions: 8, percentage: 50 },
      })
    ).toBe('in_progress');
  });

  it('returns completed when progress status is COMPLETED', () => {
    expect(
      getScenarioCardState({
        isPremium: false,
        isUnlocked: true,
        progress: { status: 'COMPLETED', completedInteractions: 8, totalInteractions: 8, percentage: 100 },
      })
    ).toBe('completed');
  });

  it('returns premium_locked when the scenario is premium and not unlocked', () => {
    expect(getScenarioCardState({ isPremium: true, isUnlocked: false })).toBe('premium_locked');
  });

  it('premium_locked wins even if there is prior progress (Test 5 in the doc: free user, premium scenario)', () => {
    expect(
      getScenarioCardState({
        isPremium: true,
        isUnlocked: false,
        progress: { status: 'IN_PROGRESS', completedInteractions: 2, totalInteractions: 8, percentage: 25 },
      })
    ).toBe('premium_locked');
  });

  it('an unlocked premium scenario behaves like a free scenario (Test 4: premium user, active entitlement)', () => {
    expect(getScenarioCardState({ isPremium: true, isUnlocked: true })).toBe('not_started');
  });
});

describe('getScenarioCardCta', () => {
  it.each([
    ['not_started', 'Start'],
    ['in_progress', 'Continue'],
    ['completed', 'Practice Again'],
    ['premium_locked', 'View Scenario'],
  ] as const)('%s -> %s', (state, expected) => {
    expect(getScenarioCardCta(state)).toBe(expected);
  });
});
