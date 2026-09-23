// Hand-written types mirroring supabase/migrations/0001_init.sql.
// If you use the Supabase CLI, you can regenerate these with:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts

export type ExerciseType =
  | 'multiple_choice'
  | 'translation'
  | 'listening'
  | 'vocabulary'
  | 'fill_blank'
  | 'word_order'
  | 'pronunciation';

export type VocabStatus = 'new' | 'learning' | 'reviewing' | 'learned';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  native_language: string | null;
  learning_language: string | null;
  level: Difficulty | null;
  daily_goal_minutes: number;
  streak_count: number;
  last_activity_date: string | null;
  onboarding_completed: boolean;
  /** Backing field for scenario premium-entitlement checks — see supabase/migrations/0002_scenarios.sql */
  is_premium_subscriber: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  language: string;
  description: string | null;
  level: Difficulty;
  created_at: string;
}

export interface Story {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  topic: string | null;
  thumbnail_url: string | null;
  duration_minutes: number;
  order_index: number;
  created_at: string;
}

export interface StoryScene {
  id: string;
  story_id: string;
  order_index: number;
  character: string;
  dialogue: string;
  translation: string;
  audio_url: string | null;
  video_url: string | null;
  created_at: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  pronunciation: string | null;
  part_of_speech: string | null;
  example_sentence: string | null;
  audio_url: string | null;
  language: string;
  created_at: string;
}

export interface VocabularyLesson {
  id: string;
  language: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
  created_at: string;
}

export interface VocabularyLessonWord {
  lesson_id: string;
  vocabulary_id: string;
  order_index: number;
}

export interface UserVocabularyLessonProgress {
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

export interface UserVocabulary {
  id: string;
  user_id: string;
  vocabulary_id: string;
  status: VocabStatus;
  review_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  story_id: string;
  scene_id: string | null;
  type: ExerciseType;
  question: string;
  answer: string;
  options: string[] | null;
  explanation: string | null;
  order_index: number;
  audio_url: string | null;
}

export interface UserProgress {
  id: string;
  user_id: string;
  story_id: string;
  scene_id: string | null;
  completion_percentage: number;
  completed: boolean;
  last_position: number;
  updated_at: string;
}

export interface ExerciseAttempt {
  id: string;
  user_id: string;
  exercise_id: string;
  answer: string;
  correct: boolean;
  created_at: string;
}

export interface LearningSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
}

export interface AlphabetCharacter {
  id: string;
  language: string;
  character: string;
  romanization: string | null;
  pronunciation_guide: string;
  example_word: string | null;
  example_translation: string | null;
  audio_url: string | null;
  order_index: number;
  created_at: string;
}

export type SurvivalPhraseCategory = 'greetings' | 'essentials' | 'emergency' | 'dining' | 'directions';

export interface SurvivalPhrase {
  id: string;
  language: string;
  category: SurvivalPhraseCategory;
  phrase: string;
  translation: string;
  pronunciation: string | null;
  audio_url: string | null;
  order_index: number;
  created_at: string;
}

export interface UserFoundationsProgress {
  user_id: string;
  language: string;
  alphabet_completed_at: string | null;
  phrases_completed_at: string | null;
}

