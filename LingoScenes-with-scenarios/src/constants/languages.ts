export interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

export const LEARNING_LANGUAGES: LanguageOption[] = [
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
];

export const LEVELS: { code: 'beginner' | 'intermediate' | 'advanced'; label: string; blurb: string }[] = [
  { code: 'beginner', label: 'Beginner', blurb: "I'm just starting out" },
  { code: 'intermediate', label: 'Intermediate', blurb: 'I know the basics' },
  { code: 'advanced', label: 'Advanced', blurb: 'I can hold conversations' },
];

export const DAILY_GOAL_OPTIONS = [
  { minutes: 5, label: 'Casual', blurb: '5 min / day' },
  { minutes: 10, label: 'Regular', blurb: '10 min / day' },
  { minutes: 20, label: 'Serious', blurb: '20 min / day' },
  { minutes: 30, label: 'Intense', blurb: '30 min / day' },
];
