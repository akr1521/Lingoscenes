import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useScenario } from '@/features/scenarios/hooks/useScenario';
import { useAuthStore } from '@/store/authStore';

/**
 * FR-01 §38: "FR-01 only needs to implement navigation up to Scenario
 * Detail and Start." The actual scene-by-scene Scenario Player (dialogue,
 * audio, exercises) is a separate future feature with its own tables and
 * requirements doc — this screen is a real, working landing spot after
 * Start/Continue is pressed (so the flow never dead-ends), rather than a
 * fully-built player.
 */
export default function ScenarioPlayerRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: scenario, isLoading, error, refetch } = useScenario(id);
  const isPremium = useAuthStore((s) => s.profile?.is_premium_subscriber);

  if (isLoading) return <LoadingState label="Preparing your scenario…" />;
  if (error || !scenario) {
    return <ErrorState message="Unable to load this scenario." onRetry={refetch} />;
  }

  const locked = scenario.access.isPremium && !scenario.access.isUnlocked && !isPremium;
  if (locked) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Premium scenario</Text>
        <Text style={styles.subtitle}>
          This scene is for Premium members. Upgrade to unlock it, or pick a free scenario from Learn.
        </Text>
        <Button label="Back to Learn" onPress={() => router.replace('/(tabs)/learn')} style={styles.button} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎬</Text>
      <Text style={styles.title}>{scenario.title}</Text>
      <Text style={styles.subtitle}>
        {scenario.progress?.status === 'IN_PROGRESS'
          ? `Resuming where you left off (${Math.round(scenario.progress.percentage)}% complete).`
          : "You're all set to begin this scenario."}
      </Text>

      <View style={styles.objectivesBox}>
        <Text style={styles.objectivesTitle}>You'll practice:</Text>
        {scenario.objectives.map((objective, i) => (
          <Text key={i} style={styles.objective}>
            • {objective}
          </Text>
        ))}
      </View>

      <Text style={styles.note}>
        The full scene-by-scene player (audio, dialogue, exercises) is coming in the next release.
      </Text>

      <Button label="Back to Learn" onPress={() => router.replace('/(tabs)/learn')} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emoji: { fontSize: 48 },
  title: { ...typography.h1, textAlign: 'center' },
  subtitle: { ...typography.bodyMuted, textAlign: 'center' },
  objectivesBox: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.md, gap: 4 },
  objectivesTitle: { ...typography.h3, marginBottom: spacing.xs },
  objective: { ...typography.body },
  note: { ...typography.caption, textAlign: 'center', marginTop: spacing.md },
  button: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
