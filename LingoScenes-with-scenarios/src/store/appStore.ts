import { create } from 'zustand';

interface OnboardingDraft {
  learningLanguage?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  dailyGoalMinutes?: number;
}

interface AppState {
  onboardingDraft: OnboardingDraft;
  setOnboardingField: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void;
  clearOnboardingDraft: () => void;

  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;

  translationsVisible: boolean;
  toggleTranslations: () => void;

  currentlyPlayingId: string | null; // ensures only one audio instance plays app-wide
  setCurrentlyPlayingId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  onboardingDraft: {},
  setOnboardingField: (key, value) =>
    set((state) => ({ onboardingDraft: { ...state.onboardingDraft, [key]: value } })),
  clearOnboardingDraft: () => set({ onboardingDraft: {} }),

  playbackSpeed: 1.0,
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  translationsVisible: true,
  toggleTranslations: () => set((state) => ({ translationsVisible: !state.translationsVisible })),

  currentlyPlayingId: null,
  setCurrentlyPlayingId: (id) => set({ currentlyPlayingId: id }),
}));
