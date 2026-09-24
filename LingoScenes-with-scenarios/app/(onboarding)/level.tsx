import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '@/theme';
import { LEVELS } from '@/constants/languages';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';

export default function LevelSelectScreen() {
  const router = useRouter();
  const setOnboardingField = useAppStore((s) => s.setOnboardingField);
  const selected = useAppStore((s) => s.onboardingDraft.level);
  const reset = useAuthStore((s) => s.reset);
  const [loading, setLoading] = useState(false);

  const handleSelect = (code: typeof LEVELS[number]['code']) => {
    setOnboardingField('level', code);
    router.push('/(onboarding)/goals');
  };

  const handleLogout = async () => {
    setLoading(true);
    await authService.signOut();
    reset();
    setLoading(false);
    // route guard sends signed-out users to the public landing page
  };

  return (
    <View style={styles.container}>
      <ProgressBar progress={60} />
      <View style={styles.header}>
        <Text style={styles.step}>Step 3 of 4</Text>
        <Text style={styles.title}>What's your level?</Text>
        <Text style={styles.subtitle}>We'll tailor story difficulty to match.</Text>
      </View>

      <View style={styles.list}>
        {LEVELS.map((item) => (
          <Pressable
            key={item.code}
            onPress={() => handleSelect(item.code)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            style={({ pressed }) => [
              styles.option,
              selected === item.code && styles.optionSelected,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{item.label}</Text>
              <Text style={styles.optionBlurb}>{item.blurb}</Text>
            </View>
            {selected === item.code ? (
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            )}
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Button label="Sign out" variant="secondary" onPress={handleLogout} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, paddingTop: spacing.xxl },
  header: { marginTop: spacing.lg, marginBottom: spacing.sm },
  step: { ...typography.caption, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...typography.h1, marginTop: spacing.sm },
  subtitle: { ...typography.bodyMuted, marginTop: spacing.xs },
  list: { gap: spacing.sm, marginTop: spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryBg },
  optionContent: { flex: 1, gap: 4 },
  optionLabel: { ...typography.h3 },
  optionBlurb: { ...typography.bodyMuted, fontSize: 14 },
  footer: { marginTop: spacing.xl },
});
