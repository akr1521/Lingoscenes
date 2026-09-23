import { supabase } from '@/lib/supabase';
import type {
  UserVocabulary,
  Vocabulary,
  VocabularyLesson,
  VocabStatus,
} from '@/types/database';

export interface SavedWord extends UserVocabulary {
  vocabulary: Vocabulary;
}

export interface VocabularyLessonSummary extends VocabularyLesson {
  word_count: number;
  completed: boolean;
}

export interface VocabularyLessonDetail extends VocabularyLessonSummary {
  words: Vocabulary[];
}

interface VocabularyLessonWordRow {
  order_index: number;
  vocabulary: Vocabulary | null;
}

// Simple SM-2-inspired interval schedule (in days) keyed by review count.
// Not a full SM-2 implementation (no ease-factor persistence) but gives
// genuine spaced-repetition behavior: intervals grow with each correct review.
const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];

function nextIntervalDays(reviewCount: number): number {
  return REVIEW_INTERVALS_DAYS[Math.min(reviewCount, REVIEW_INTERVALS_DAYS.length - 1)];
}

export const vocabularyService = {
  async saveWord(userId: string, vocabularyId: string): Promise<void> {
    const { error } = await supabase.from('user_vocabulary').upsert(
      {
        user_id: userId,
        vocabulary_id: vocabularyId,
        status: 'new',
        review_count: 0,
        next_review_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,vocabulary_id' }
    );
    if (error) throw error;
  },

  async removeWord(userId: string, vocabularyId: string): Promise<void> {
    const { error } = await supabase
      .from('user_vocabulary')
      .delete()
      .eq('user_id', userId)
      .eq('vocabulary_id', vocabularyId);
    if (error) throw error;
  },

  async getSavedWords(userId: string): Promise<SavedWord[]> {
    const { data, error } = await supabase
      .from('user_vocabulary')
      .select('*, vocabulary(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as SavedWord[];
  },

  async getLessons(userId: string, language: string): Promise<VocabularyLessonSummary[]> {
    const [lessonsResult, progressResult] = await Promise.all([
      supabase
        .from('vocabulary_lessons')
        .select('*, vocabulary_lesson_words(count)')
        .eq('language', language)
        .order('order_index'),
      supabase
        .from('user_vocabulary_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId),
    ]);
    if (lessonsResult.error) throw lessonsResult.error;
    if (progressResult.error) throw progressResult.error;

    const completedIds = new Set((progressResult.data ?? []).map((progress) => progress.lesson_id));
    return (lessonsResult.data ?? []).map((lesson) => ({
      ...lesson,
      word_count: lesson.vocabulary_lesson_words?.[0]?.count ?? 0,
      completed: completedIds.has(lesson.id),
    })) as VocabularyLessonSummary[];
  },

  async getLesson(userId: string, lessonId: string): Promise<VocabularyLessonDetail | null> {
    const [lessonResult, progressResult] = await Promise.all([
      supabase
        .from('vocabulary_lessons')
        .select('*, vocabulary_lesson_words(order_index, vocabulary(*))')
        .eq('id', lessonId)
        .maybeSingle(),
      supabase
        .from('user_vocabulary_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle(),
    ]);
    if (lessonResult.error) throw lessonResult.error;
    if (progressResult.error) throw progressResult.error;
    if (!lessonResult.data) return null;

    const lesson = lessonResult.data as VocabularyLesson & { vocabulary_lesson_words?: VocabularyLessonWordRow[] };
    const words = (lesson.vocabulary_lesson_words ?? [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((entry) => entry.vocabulary)
      .filter((word): word is Vocabulary => !!word);

    return {
      ...lesson,
      word_count: words.length,
      words,
      completed: !!progressResult.data,
    } as VocabularyLessonDetail;
  },

  async completeLesson(userId: string, lessonId: string): Promise<void> {
    const { error } = await supabase.from('user_vocabulary_lesson_progress').upsert(
      { user_id: userId, lesson_id: lessonId, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id' }
    );
    if (error) throw error;
  },

  async getDueForReview(userId: string): Promise<SavedWord[]> {
    const { data, error } = await supabase
      .from('user_vocabulary')
      .select('*, vocabulary(*)')
      .eq('user_id', userId)
      .lte('next_review_at', new Date().toISOString())
      .neq('status', 'learned')
      .order('next_review_at', { ascending: true })
      .limit(20);
    if (error) throw error;
    return (data ?? []) as unknown as SavedWord[];
  },

  /** Call after a review/quiz interaction with a saved word. */
  async recordReview(userVocabRow: UserVocabulary, wasCorrect: boolean): Promise<void> {
    const reviewCount = wasCorrect ? userVocabRow.review_count + 1 : Math.max(0, userVocabRow.review_count - 1);
    const status: VocabStatus = reviewCount >= REVIEW_INTERVALS_DAYS.length ? 'learned' : reviewCount > 0 ? 'reviewing' : 'learning';
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextIntervalDays(reviewCount));

    const { error } = await supabase
      .from('user_vocabulary')
      .update({
        review_count: reviewCount,
        status,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: nextReview.toISOString(),
      })
      .eq('id', userVocabRow.id);
    if (error) throw error;
  },

  async markLearned(userVocabRow: UserVocabulary): Promise<void> {
    const { error } = await supabase
      .from('user_vocabulary')
      .update({ status: 'learned' })
      .eq('id', userVocabRow.id);
    if (error) throw error;
  },

  async lookupVocabularyForWord(word: string, language: string): Promise<Vocabulary | null> {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .ilike('word', word)
      .eq('language', language)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn('[vocabularyService.lookupVocabularyForWord]', error.message);
      return null;
    }
    return data;
  },
};
