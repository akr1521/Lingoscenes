import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radius } from '@/theme';
import { LEARNING_LANGUAGES } from '@/constants/languages';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { FlagMark } from '@/components/FlagMark';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';

export default function LanguageSelectScreen() {
  const router = useRouter();
  const setOnboardingField = useAppStore((s) => s.setOnboardingField);
  const selected = useAppStore((s) => s.onboardingDraft.learningLanguage);
  const reset = useAuthStore((s) => s.reset);
  const [loading, setLoading] = useState(false);

  const handleSelect = (code: string) => {
    setOnboardingField('learningLanguage', code);
    router.push('/(onboarding)/level');
  };

  const handleLogout = async () => {
    setLoading(true);
    await authService.signOut();
    reset();
    setLoading(false);
    // route guard sends signed-out users to the public landing page
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <ProgressBar progress={20} />
      <View style={styles.header}>
        <Text style={styles.step}>Step 1 of 4</Text>
        <Text style={styles.title}>Start speaking a new language</Text>
        <Text style={styles.subtitle}>Pick a language. Every sentence is a scene.</Text>
      </View>

      <View style={styles.grid}>
        {LEARNING_LANGUAGES.map((item) => {
          const isSelected = selected === item.code;
          return (
            <Pressable
              key={item.code}
              onPress={() => handleSelect(item.code)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => [
                styles.card,
                isSelected && styles.cardSelected,
                pressed && { opacity: 0.85 },
              ]}
            >
              <FlagMark code={item.code} size={64} />
              <Text style={styles.optionLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button label="Sign out" variant="secondary" onPress={handleLogout} loading={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  header: { marginTop: spacing.lg, marginBottom: spacing.lg },
  step: { ...typography.caption, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...typography.h1, marginTop: spacing.sm },
  subtitle: { ...typography.bodyMuted, marginTop: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    width: '30%',
    minWidth: 96,
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryBg },
  flagCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: { fontSize: 32 },
  optionLabel: { ...typography.h3, textAlign: 'center' },
  footer: { marginTop: spacing.xl },
});
