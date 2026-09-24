import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { colors, radius, spacing, typography } from '@/theme';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { AlphabetExplorer } from '@/components/AlphabetExplorer';
import { SurvivalPhraseList } from '@/components/SurvivalPhraseList';
import { foundationsService } from '@/services/foundationsService';

/**
 * Onboarding "Foundations" step: a quick, skippable introduction to the target
 * language's core alphabet/pronunciation and a handful of essential survival
 * phrases, shown right after language selection and before level placement.
 */
export default function OnboardingFoundationsScreen() {
  const router = useRouter();
  const language = useAppStore((s) => s.onboardingDraft.learningLanguage) ?? 'de';
  const session = useAuthStore((s) => s.session);
  const reset = useAuthStore((s) => s.reset);
  const [section, setSection] = useState<'alphabet' | 'phrases'>('alphabet');
  const [logoutLoading, setLogoutLoading] = useState(false);

  const goToLevel = () => router.push('/(onboarding)/level');

  const handleLogout = async () => {
    setLogoutLoading(true);
    await authService.signOut();
    reset();
    setLogoutLoading(false);
    // route guard sends signed-out users to the public landing page
  };

  const handleContinue = async () => {
    if (section === 'alphabet') {
      if (session?.user?.id) {
        foundationsService.completeAlphabet(session.user.id, language).catch(() => {});
      }
      setSection('phrases');
      return;
    }
    if (session?.user?.id) {
      foundationsService.completePhrases(session.user.id, language).catch(() => {});
    }
    goToLevel();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar progress={40} />
        <View style={styles.header}>
          <Text style={styles.step}>Step 2 of 4</Text>
          <Text style={styles.title}>Foundations first</Text>
          <Text style={styles.subtitle}>
            {section === 'alphabet'
              ? 'A quick look at the sounds and letters you\'ll see everywhere.'
              : 'A handful of phrases that get you through your first conversation.'}
          </Text>
        </View>

        <View style={styles.tabRow}>
          <Text style={[styles.tab, section === 'alphabet' && styles.tabActive]}>1. Alphabet & pronunciation</Text>
          <Text style={[styles.tab, section === 'phrases' && styles.tabActive]}>2. Survival phrases</Text>
        </View>

        {section === 'alphabet' ? (
          <AlphabetExplorer language={language} />
        ) : (
          <SurvivalPhraseList language={language} />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={section === 'alphabet' ? 'Continue to phrases' : 'Continue'}
          onPress={handleContinue}
        />
        <Button label="Skip for now" onPress={goToLevel} variant="ghost" />
        <Button label="Sign out" variant="secondary" onPress={handleLogout} loading={logoutLoading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xl, gap: spacing.md },
  header: { marginTop: spacing.lg },
  step: { ...typography.caption, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...typography.h1, marginTop: spacing.sm },
  subtitle: { ...typography.bodyMuted, marginTop: spacing.xs },
  tabRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  tab: {
    ...typography.caption,
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    color: colors.textMuted,
    fontWeight: '700',
  },
  tabActive: { backgroundColor: colors.primaryBg, color: colors.primary },
  footer: { padding: spacing.lg, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
});
