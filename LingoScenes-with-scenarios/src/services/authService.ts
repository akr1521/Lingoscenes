import { supabase } from '@/lib/supabase';
import { isValidEmail } from '@/lib/email';
import type { Profile } from '@/types/database';

export interface AuthResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

function mapAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (message.includes('User already registered')) return 'An account with this email already exists.';
  if (message.includes('Email not confirmed')) return 'Please confirm your email before logging in.';
  if (message.toLowerCase().includes('password should be at least')) {
    return 'Password must be at least 8 characters.';
  }
  if (message.toLowerCase().includes('network')) return 'Network error — check your connection and try again.';
  return message || 'Something went wrong. Please try again.';
}

export const authService = {
  async signUp(
    email: string,
    password: string,
    extras?: { displayName?: string; learningLanguage?: string }
  ): Promise<AuthResult> {
    if (!isValidEmail(email)) return { error: 'Enter a valid email address.' };
    if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: extras?.displayName ?? '',
          learning_language: extras?.learningLanguage ?? '',
        },
      },
    });
    if (error) return { error: mapAuthError(error) };

    if (data.user) {
      await this.ensureProfile(data.user.id, email);
    }

    return { error: null, needsEmailConfirmation: !data.session };
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isValidEmail(email)) return { error: 'Enter a valid email address.' };
    if (!password) return { error: 'Please enter your password.' };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: mapAuthError(error) };
    if (data.user) {
      await this.ensureProfile(data.user.id, email);
    }
    return { error: null };
  },

  async signOut(): Promise<AuthResult> {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: mapAuthError(error) };
    return { error: null };
  },

  async resetPassword(email: string): Promise<AuthResult> {
    if (!isValidEmail(email)) return { error: 'Enter a valid email address.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'lingoscenes://reset-password',
    });
    if (error) return { error: mapAuthError(error) };
    return { error: null };
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.warn('[authService.getProfile]', error.message);
      return null;
    }
    return data as Profile;
  },

  async ensureProfile(userId: string, email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, email }, { onConflict: 'id', ignoreDuplicates: true })
      .select('*')
      .single();
    if (error) {
      return this.getProfile(userId);
    }
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<AuthResult> {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) return { error: mapAuthError(error) };
    return { error: null };
  },
};
