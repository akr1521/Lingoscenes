import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ScenarioCard } from '../ScenarioCard';
import type { ScenarioSummary } from '../../types/scenario.types';

const baseScenario: ScenarioSummary = {
  id: 'scn_001',
  title: 'Ordering Food',
  slug: 'ordering-food',
  description: 'Learn how to order food naturally in Hindi.',
  thumbnailUrl: null,
  level: 'BEGINNER',
  durationMinutes: 6,
  categories: [{ id: 'cat_travel', name: 'Travel', slug: 'travel' }],
  isPremium: false,
  isUnlocked: true,
};

describe('ScenarioCard', () => {
  it('shows "Start" for a scenario with no progress (Test 1: new user)', () => {
    render(<ScenarioCard scenario={baseScenario} onPress={jest.fn()} />);
    expect(screen.getByText('Start')).toBeTruthy();
  });

  it('shows "Continue" and the percentage for an in-progress scenario (Test 2: existing user)', () => {
    const scenario: ScenarioSummary = {
      ...baseScenario,
      progress: { status: 'IN_PROGRESS', completedInteractions: 4, totalInteractions: 8, percentage: 50 },
    };
    render(<ScenarioCard scenario={scenario} onPress={jest.fn()} />);
    expect(screen.getByText('Continue')).toBeTruthy();
    expect(screen.getByText(/50% · 4 \/ 8 interactions/)).toBeTruthy();
  });

  it('shows "✓ Completed" and "Practice Again" for a completed scenario (Test 3)', () => {
    const scenario: ScenarioSummary = {
      ...baseScenario,
      progress: { status: 'COMPLETED', completedInteractions: 8, totalInteractions: 8, percentage: 100 },
    };
    render(<ScenarioCard scenario={scenario} onPress={jest.fn()} />);
    expect(screen.getByText('✓ Completed')).toBeTruthy();
    expect(screen.getByText('Practice Again')).toBeTruthy();
  });

  it('shows the Premium badge and "View Scenario" for a locked premium scenario (Test 5: free user)', () => {
    const scenario: ScenarioSummary = { ...baseScenario, isPremium: true, isUnlocked: false };
    render(<ScenarioCard scenario={scenario} onPress={jest.fn()} />);
    expect(screen.getByText('🔒 Premium')).toBeTruthy();
    expect(screen.getByText('View Scenario')).toBeTruthy();
  });

  it('is tappable even when premium-locked (AC-13)', () => {
    const onPress = jest.fn();
    const scenario: ScenarioSummary = { ...baseScenario, isPremium: true, isUnlocked: false };
    render(<ScenarioCard scenario={scenario} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('scenario-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
