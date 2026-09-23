import { supabase } from '@/lib/supabase';
import type { Exercise } from '@/types/database';

export const exerciseService = {
  async getExercisesForStory(storyId: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('story_id', storyId)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  /** Normalizes and compares an answer. Case/whitespace/punctuation-insensitive. */
  checkAnswer(exercise: Exercise, userAnswer: string): boolean {
    const normalize = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/[.,!?¿¡]/g, '')
        .replace(/\s+/g, ' ');
    return normalize(userAnswer) === normalize(exercise.answer);
  },
};
