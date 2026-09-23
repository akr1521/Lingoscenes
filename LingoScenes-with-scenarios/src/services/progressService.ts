import { supabase } from '@/lib/supabase';
import type { UserProgress } from '@/types/database';

export interface ProgressSummary {
  storiesStarted: number;
  storiesCompleted: number;
  exercisesCompleted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  vocabularyLearned: number;
  currentStreak: number;
  totalLearningMinutes: number;
  weeklyActivityMinutes: number[]; // last 7 days, index 0 = 6 days ago .. index 6 = today
}

export const progressService = {
  async upsertSceneProgress(
    userId: string,
    storyId: string,
    sceneId: string,
    completionPercentage: number,
    lastPosition: number
  ): Promise<void> {
    const { error } = await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        story_id: storyId,
        scene_id: sceneId,
        completion_percentage: completionPercentage,
        completed: completionPercentage >= 100,
        last_position: lastPosition,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,story_id,scene_id' }
    );
    if (error) throw error;
  },

  async markStoryCompleted(userId: string, storyId: string): Promise<void> {
    const { error } = await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        story_id: storyId,
        scene_id: null,
        completion_percentage: 100,
        completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,story_id,scene_id' }
    );
    if (error) throw error;
    await progressService.bumpStreak(userId);
  },

  async recordExerciseAttempt(userId: string, exerciseId: string, answer: string, correct: boolean): Promise<void> {
    const { error } = await supabase
      .from('exercise_attempts')
      .insert({ user_id: userId, exercise_id: exerciseId, answer, correct });
    if (error) throw error;
  },

  async startSession(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert({ user_id: userId, started_at: new Date().toISOString() })
      .select('id')
      .single();
    if (error) {
      console.warn('[progressService.startSession]', error.message);
      return null;
    }
    return data.id;
  },

  async endSession(sessionId: string, durationSeconds: number): Promise<void> {
    const { error } = await supabase
      .from('learning_sessions')
      .update({ ended_at: new Date().toISOString(), duration_seconds: durationSeconds })
      .eq('id', sessionId);
    if (error) console.warn('[progressService.endSession]', error.message);
  },

  /** Increments the daily streak counter, resetting it if a day was missed. */
  async bumpStreak(userId: string): Promise<void> {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('streak_count, last_activity_date')
      .eq('id', userId)
      .single();
    if (fetchError || !profile) return;

    const today = new Date().toISOString().slice(0, 10);
    if (profile.last_activity_date === today) return; // already counted today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = profile.last_activity_date === yesterday.toISOString().slice(0, 10);

    const newStreak = wasYesterday ? profile.streak_count + 1 : 1;

    await supabase
      .from('profiles')
      .update({ streak_count: newStreak, last_activity_date: today })
      .eq('id', userId);
  },

  async getSummary(userId: string): Promise<ProgressSummary> {
    const [progressRes, attemptsRes, vocabRes, sessionsRes, profileRes] = await Promise.all([
      supabase.from('user_progress').select('completed').eq('user_id', userId),
      supabase.from('exercise_attempts').select('correct').eq('user_id', userId),
      supabase.from('user_vocabulary').select('status').eq('user_id', userId),
      supabase
        .from('learning_sessions')
        .select('duration_seconds, started_at')
        .eq('user_id', userId)
        .not('duration_seconds', 'is', null),
      supabase.from('profiles').select('streak_count').eq('id', userId).single(),
    ]);

    const progressRows = progressRes.data ?? [];
    const attempts = attemptsRes.data ?? [];
    const vocabRows = vocabRes.data ?? [];
    const sessions = sessionsRes.data ?? [];

    const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0);

    const weeklyMinutes = Array(7).fill(0);
    const now = new Date();
    for (const s of sessions) {
      const started = new Date(s.started_at);
      const dayDiff = Math.floor((now.getTime() - started.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        weeklyMinutes[6 - dayDiff] += (s.duration_seconds ?? 0) / 60;
      }
    }

    return {
      storiesStarted: progressRows.length,
      storiesCompleted: progressRows.filter((p) => p.completed).length,
      exercisesCompleted: attempts.length,
      correctAnswers: attempts.filter((a) => a.correct).length,
      incorrectAnswers: attempts.filter((a) => !a.correct).length,
      vocabularyLearned: vocabRows.filter((v) => v.status === 'learned').length,
      currentStreak: profileRes.data?.streak_count ?? 0,
      totalLearningMinutes: Math.round(totalSeconds / 60),
      weeklyActivityMinutes: weeklyMinutes.map((m) => Math.round(m)),
    };
  },

  async getStoryProgress(userId: string, storyId: string): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId);
    if (error) throw error;
    return data ?? [];
  },
};
