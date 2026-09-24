import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '@/theme';
import { DAILY_GOAL_OPTIONS } from '@/constants/languages';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';

export default function GoalsScreen() {
  const { onboardingDraft, setOnboardingField, clearOnboardingDraft } = useAppStore();
  const { session, setProfile, reset } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = onboardingDraft.dailyGoalMinutes;

  const finishOnboarding = async () => {
    if (!session?.user || !selected || !onboardingDraft.learningLanguage || !onboardingDraft.level) return;
    setLoading(true);
    setError(null);

    const { error } = await authService.updateProfile(session.user.id, {
      learning_language: onboardingDraft.learningLanguage,
      level: onboardingDraft.level,
      daily_goal_minutes: selected,
      onboarding_completed: true,
    });

    setLoading(false);
    if (error) {
      setError(error);
      return;
    }

    const profile = await authService.getProfile(session.user.id);
    setProfile(profile);
    clearOnboardingDraft();
    // Root layout's route guard will redirect to (tabs)/home once profile updates.
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    await authService.signOut();
    reset();
    setLogoutLoading(false);
    // route guard sends signed-out users to the public landing page
  };

  return (
    <View style={styles.container}>
      <ProgressBar progress={100} />
      <Text style={styles.step}>Step 4 of 4</Text>
      <Text style={styles.title}>Set a daily goal</Text>
      <Text style={styles.subtitle}>Consistency beats intensity — pick a pace you'll keep.</Text>

      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        {DAILY_GOAL_OPTIONS.map((option) => (
          <Pressable
            key={option.minutes}
            onPress={() => setOnboardingField('dailyGoalMinutes', option.minutes)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            style={[styles.option, selected === option.minutes && styles.optionSelected]}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionBlurb}>{option.blurb}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        label="Start learning"
        onPress={finishOnboarding}
        loading={loading}
        disabled={!selected}
        style={{ marginTop: spacing.xl }}
      />

      <Button
        label="Sign out"
        variant="secondary"
        onPress={handleLogout}
        loading={logoutLoading}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, paddingTop: spacing.xxl },
  step: { ...typography.caption, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.lg },
  title: { ...typography.h1, marginTop: spacing.sm },
  subtitle: { ...typography.bodyMuted, marginTop: spacing.xs },
  option: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  optionSelected: { borderColor: colors.primary },
  optionLabel: { ...typography.h3 },
  optionBlurb: { ...typography.bodyMuted },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.md },
});
