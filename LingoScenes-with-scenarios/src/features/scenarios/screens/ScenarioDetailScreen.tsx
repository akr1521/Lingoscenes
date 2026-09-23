import React, { useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@/theme';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { PremiumBadge } from '../components/PremiumBadge';
import { track } from '@/lib/analytics';
import { useScenario, useStartScenario } from '../hooks/useScenario';
import { ScenarioApiError } from '../types/scenario.types';

export function ScenarioDetailScreen({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();
  const { data: scenario, isLoading, error, refetch } = useScenario(scenarioId);
  const startMutation = useStartScenario();

  useEffect(() => {
    if (scenario) {
      track('scenario_detail_viewed', {
        scenarioId: scenario.id,
        category: scenario.categories[0]?.slug,
        level: scenario.level,
      });
    }
  }, [scenario]);

  if (isLoading) return <LoadingState label="Loading scenario…" />;

  if (error || !scenario) {
    return (
      <ErrorState message="Unable to load this scenario. Please check your internet connection." onRetry={refetch} />
    );
  }

  const isCompleted = scenario.progress?.status === 'COMPLETED';
  const isInProgress = scenario.progress?.status === 'IN_PROGRESS';
  const locked = scenario.access.isPremium && !scenario.access.isUnlocked;

  const ctaLabel = locked ? 'Unlock with Premium' : isInProgress ? 'Continue' : isCompleted ? 'Practice Again' : 'Start';

  const handlePress = () => {
    track('scenario_start_clicked', {
      scenarioId: scenario.id,
      category: scenario.categories[0]?.slug,
      level: scenario.level,
    });

    if (locked) {
      // FR-01 is scoped up to Scenario Detail + Start; a full subscription
      // purchase flow (IAP/Stripe) is intentionally out of scope here
      // (see README "Known simplifications"). This is the seam where that
      // flow would be triggered.
      Alert.alert('Premium scenario', 'Upgrading to Premium unlocks this scenario. Subscription flow coming soon.');
      return;
    }

    startMutation.mutate(scenario.id, {
      onSuccess: () => {
        router.push(`/scenario-player/${scenario.id}`);
      },
      onError: (err) => {
        const message = err instanceof ScenarioApiError ? err.message : 'Something went wrong starting this scenario.';
        Alert.alert('Unable to start scenario', message);
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.thumbnailWrap}>
        {scenario.thumbnailUrl ? (
          <Image source={{ uri: scenario.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailFallback]}>
            <Text style={{ fontSize: 36 }}>🎬</Text>
          </View>
        )}
        {locked && (
          <View style={styles.lockBadge}>
            <Text style={{ fontSize: 18 }}>🔒</Text>
          </View>
        )}
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title}>{scenario.title}</Text>
        {locked && <PremiumBadge />}
      </View>

      <View style={styles.metaRow}>
        <DifficultyBadge level={scenario.level} />
        <Text style={styles.meta}>⏱ {scenario.durationMinutes} min</Text>
        {scenario.categories.map((c) => (
          <Text key={c.id} style={styles.meta}>
            {c.name}
          </Text>
        ))}
      </View>

      <Text style={styles.description}>{scenario.description}</Text>

      {isCompleted && (
        <View style={styles.progressBanner}>
          <Text style={styles.progressBannerText}>✓ Completed</Text>
        </View>
      )}
      {isInProgress && scenario.progress && (
        <View style={styles.progressBanner}>
          <Text style={styles.progressBannerText}>{Math.round(scenario.progress.percentage)}% complete</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>What you'll learn</Text>
      <View style={styles.objectivesList}>
        {scenario.objectives.map((objective, i) => (
          <View key={i} style={styles.objectiveRow}>
            <Text style={styles.objectiveBullet}>•</Text>
            <Text style={styles.objectiveText}>{objective}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRow}>
        <Stat label="Interactions" value={scenario.stats.interactionCount} />
        <Stat label="Phrases" value={scenario.stats.phraseCount} />
        <Stat label="Cultural notes" value={scenario.stats.culturalNoteCount} />
      </View>

      <Button
        label={ctaLabel}
        onPress={handlePress}
        loading={startMutation.isPending}
        variant={locked ? 'secondary' : 'primary'}
        style={styles.cta}
        testID="scenario-detail-cta"
      />
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  thumbnailWrap: { position: 'relative', borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  thumbnail: { width: '100%', height: 200 },
  thumbnailFallback: { backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  lockBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: radius.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.h1, fontSize: 24, flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  meta: { ...typography.caption },
  description: { ...typography.body, marginTop: spacing.md },
  progressBanner: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  progressBannerText: { ...typography.bodyMuted, fontWeight: '700', color: colors.primary },
  sectionTitle: { ...typography.h2, fontSize: 18, marginTop: spacing.lg, marginBottom: spacing.sm },
  objectivesList: { gap: spacing.xs },
  objectiveRow: { flexDirection: 'row', gap: spacing.sm },
  objectiveBullet: { color: colors.primary, fontWeight: '700' },
  objectiveText: { ...typography.body, flexShrink: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, gap: spacing.sm },
  stat: { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  statValue: { ...typography.h2, fontSize: 20 },
  statLabel: { ...typography.caption },
  cta: { marginTop: spacing.xl },
});
