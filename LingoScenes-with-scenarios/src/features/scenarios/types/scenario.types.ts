// Lightweight scenario summary model used by the Scenario Browser.
// Mirrors FR-01 §17 exactly. The browser must never fetch or store full
// lesson content here (see §18) — only metadata + thumbnail + progress +
// access information.

export type ScenarioLevel =
  | 'BEGINNER'
  | 'ELEMENTARY'
  | 'INTERMEDIATE'
  | 'UPPER_INTERMEDIATE'
  | 'ADVANCED';

export type ScenarioProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ScenarioCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface ScenarioCategoryWithCount extends ScenarioCategory {
  scenarioCount: number;
}

export interface ScenarioProgress {
  status: ScenarioProgressStatus;
  completedInteractions: number;
  totalInteractions: number;
  percentage: number;
  lastInteractionId?: string;
}

export interface ScenarioSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  level: ScenarioLevel;
  durationMinutes: number;
  categories: ScenarioCategory[];
  isPremium: boolean;
  isUnlocked: boolean;
  progress?: ScenarioProgress;
}

/** API-03 items extend ScenarioSummary with a human-readable `reason`. */
export interface RecommendedScenario extends ScenarioSummary {
  reason: string;
}

export interface ScenarioAccess {
  isPremium: boolean;
  isUnlocked: boolean;
}

export interface ScenarioStats {
  interactionCount: number;
  phraseCount: number;
  culturalNoteCount: number;
}

/** Full detail payload for the Scenario Detail screen (API-05). */
export interface ScenarioDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: ScenarioLevel;
  durationMinutes: number;
  thumbnailUrl: string | null;
  categories: ScenarioCategory[];
  objectives: string[];
  stats: ScenarioStats;
  access: ScenarioAccess;
  progress?: {
    status: ScenarioProgressStatus;
    percentage: number;
    lastInteractionId?: string;
  };
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
}

export interface PaginatedScenarios {
  items: ScenarioSummary[];
  pagination: Pagination;
}

export interface StartScenarioResult {
  scenarioId: string;
  status: ScenarioProgressStatus;
  startedAt: string;
  resumeInteractionId?: string;
}

export type ScenarioDifficultyFilter = ScenarioLevel;

export interface ScenarioFilterState {
  category?: string; // category slug
  level?: ScenarioLevel;
}

/** Consistent API error shape (FR-01 §44). */
export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
  };
}

export class ScenarioApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ScenarioApiError';
  }
}
