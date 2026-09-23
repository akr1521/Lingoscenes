import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, radius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { progressService } from '@/services/progressService';
import { Card } from '@/components/Card';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

const DAY_LABELS = ['6d', '5d', '4d', '3d', '2d', 'Yest', 'Today'];

export default function ProgressScreen() {
  const profile = useAuthStore((s) => s.profile);

  const { data: summary, isLoading, isError, refetch } = useQuery({
    queryKey: ['progress-full', profile?.id],
    queryFn: () => progressService.getSummary(profile!.id),
    enabled: !!profile?.id,
  });

  if (isLoading) return <LoadingState label="Crunching your stats…" />;
  if (isError || !summary) return <ErrorState message="Couldn't load progress." onRetry={refetch} />;

  const maxMinutes = Math.max(...summary.weeklyActivityMinutes, 1);
  const accuracy =
    summary.correctAnswers + summary.incorrectAnswers > 0
      ? Math.round((summary.correctAnswers / (summary.correctAnswers + summary.incorrectAnswers)) * 100)
      : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Progress</Text>

      <View style={styles.statsGrid}>
        <StatBox label="Current streak" value={`${summary.currentStreak} 🔥`} />
        <StatBox label="Stories completed" value={`${summary.storiesCompleted}`} />
        <StatBox label="Vocabulary learned" value={`${summary.vocabularyLearned}`} />
        <StatBox label="Accuracy" value={accuracy !== null ? `${accuracy}%` : '—'} />
        <StatBox label="Exercises done" value={`${summary.exercisesCompleted}`} />
        <StatBox label="Total learning time" value={`${summary.totalLearningMinutes} min`} />
      </View>

      <Card>
        <Text style={typography.h3}>Weekly activity</Text>
        <View style={styles.chart}>
          {summary.weeklyActivityMinutes.map((minutes, i) => (
            <View key={i} style={styles.chartColumn}>
              <View style={styles.chartBarTrack}>
                <View
                  style={[
                    styles.chartBar,
                    { height: `${Math.max((minutes / maxMinutes) * 100, minutes > 0 ? 8 : 2)}%` },
                  ]}
                />
              </View>
              <Text style={styles.chartLabel}>{DAY_LABELS[i]}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={typography.h3}>Answer breakdown</Text>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownCorrect}>✓ {summary.correctAnswers} correct</Text>
          <Text style={styles.breakdownIncorrect}>✕ {summary.incorrectAnswers} incorrect</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { ...typography.h1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statBox: { width: '31%', alignItems: 'center', paddingVertical: spacing.md },
  statValue: { ...typography.h3 },
  statLabel: { ...typography.caption, textAlign: 'center', marginTop: 2 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', height: 120, marginTop: spacing.md, alignItems: 'flex-end' },
  chartColumn: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  chartBarTrack: { width: 18, height: '85%', justifyContent: 'flex-end', backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, overflow: 'hidden' },
  chartBar: { width: '100%', backgroundColor: colors.primary, borderRadius: radius.sm },
  chartLabel: { ...typography.caption, marginTop: spacing.xs, fontSize: 10 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  breakdownCorrect: { color: colors.success, fontWeight: '700' },
  breakdownIncorrect: { color: colors.danger, fontWeight: '700' },
});
