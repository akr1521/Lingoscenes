import type { ScenarioSummary } from '../types/scenario.types';

export type ScenarioCardState = 'not_started' | 'in_progress' | 'completed' | 'premium_locked';

/**
 * Maps a ScenarioSummary to the exact 4 card states from FR-01 §10.
 * Premium-locked always wins visually (the lock badge + "View Scenario"
 * CTA) even if the scenario also happens to have prior progress — a
 * scenario can't be un-locked by local progress, only by `isUnlocked`
 * coming from the backend (FR-01 §42).
 */
export function getScenarioCardState(scenario: Pick<ScenarioSummary, 'isPremium' | 'isUnlocked' | 'progress'>): ScenarioCardState {
  if (scenario.isPremium && !scenario.isUnlocked) return 'premium_locked';
  if (scenario.progress?.status === 'COMPLETED') return 'completed';
  if (scenario.progress?.status === 'IN_PROGRESS') return 'in_progress';
  return 'not_started';
}

export function getScenarioCardCta(state: ScenarioCardState): string {
  switch (state) {
    case 'not_started':
      return 'Start';
    case 'in_progress':
      return 'Continue';
    case 'completed':
      return 'Practice Again';
    case 'premium_locked':
      return 'View Scenario';
  }
}
