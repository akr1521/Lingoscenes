import { supabase } from '@/lib/supabase';
import type { Story, StoryScene, Course, Difficulty } from '@/types/database';

export interface StoryWithProgress extends Story {
  completion_percentage: number;
  completed: boolean;
}

export const storyService = {
  async getCourses(learningLanguage: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('language', learningLanguage)
      .order('level', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  /**
   * Fetches stories for a language, left-joined with the current user's progress
   * so the Stories tab can show completion %/locked state in one round trip.
   */
  async getStoriesForUser(userId: string, learningLanguage: string, difficulty?: Difficulty): Promise<StoryWithProgress[]> {
    let query = supabase
      .from('stories')
      .select('*, courses!inner(language)')
      .eq('courses.language', learningLanguage)
      .order('order_index', { ascending: true });

    if (difficulty) query = query.eq('difficulty', difficulty);

    const { data: stories, error } = await query;
    if (error) throw error;
    if (!stories || stories.length === 0) return [];

    const storyIds = stories.map((s) => s.id);
    const { data: progressRows, error: progressError } = await supabase
      .from('user_progress')
      .select('story_id, completion_percentage, completed')
      .eq('user_id', userId)
      .in('story_id', storyIds);

    if (progressError) throw progressError;

    const progressByStory = new Map(progressRows?.map((p) => [p.story_id, p]));

    return stories.map((story) => {
      const progress = progressByStory.get(story.id);
      return {
        ...(story as unknown as Story),
        completion_percentage: progress?.completion_percentage ?? 0,
        completed: progress?.completed ?? false,
      };
    });
  },

  async getStoryById(storyId: string): Promise<Story | null> {
    const { data, error } = await supabase.from('stories').select('*').eq('id', storyId).single();
    if (error) {
      console.warn('[storyService.getStoryById]', error.message);
      return null;
    }
    return data;
  },

  async getScenesForStory(storyId: string): Promise<StoryScene[]> {
    const { data, error } = await supabase
      .from('story_scenes')
      .select('*')
      .eq('story_id', storyId)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getContinueLearning(userId: string): Promise<{ story: Story; progress: number } | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('story_id, completion_percentage, completed, updated_at, stories(*)')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.stories) return null;
    return { story: data.stories as unknown as Story, progress: data.completion_percentage };
  },
};
