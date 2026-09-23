import { supabase } from '@/lib/supabase';
import type { AlphabetCharacter, SurvivalPhrase, UserFoundationsProgress } from '@/types/database';

export const foundationsService = {
  async getAlphabet(language: string): Promise<AlphabetCharacter[]> {
    const { data, error } = await supabase
      .from('alphabet_characters')
      .select('*')
      .eq('language', language)
      .order('order_index');
    if (error) throw error;
    return data ?? [];
  },

  async getSurvivalPhrases(language: string): Promise<SurvivalPhrase[]> {
    const { data, error } = await supabase
      .from('survival_phrases')
      .select('*')
      .eq('language', language)
      .order('order_index');
    if (error) throw error;
    return data ?? [];
  },

  async getProgress(userId: string, language: string): Promise<UserFoundationsProgress | null> {
    const { data, error } = await supabase
      .from('user_foundations_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('language', language)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async completeAlphabet(userId: string, language: string): Promise<void> {
    const { error } = await supabase.from('user_foundations_progress').upsert(
      { user_id: userId, language, alphabet_completed_at: new Date().toISOString() },
      { onConflict: 'user_id,language' }
    );
    if (error) throw error;
  },

  async completePhrases(userId: string, language: string): Promise<void> {
    const { error } = await supabase.from('user_foundations_progress').upsert(
      { user_id: userId, language, phrases_completed_at: new Date().toISOString() },
      { onConflict: 'user_id,language' }
    );
    if (error) throw error;
  },
};
