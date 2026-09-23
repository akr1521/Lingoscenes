import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { ProgressBar } from '@/components/ProgressBar';
import type { ScenarioProgress as ScenarioProgressModel } from '../types/scenario.types';

/**
 * Renders FR-01 §10 State 2 ("██████░░░░ 60% · 5 / 8 interactions") and
 * State 3 ("✓ Completed").
 */
export function ScenarioProgress({ progress }: { progress: ScenarioProgressModel }) {
  if (progress.status === 'COMPLETED') {
    return (
      <View style={styles.completedRow}>
        <Text style={styles.completedText}>✓ Completed</Text>
      </View>
    );
  }

  if (progress.status === 'IN_PROGRESS') {
    return (
      <View style={styles.container}>
        <ProgressBar progress={progress.percentage} height={6} />
        <Text style={styles.caption}>
          {Math.round(progress.percentage)}% · {progress.completedInteractions} / {progress.totalInteractions} interactions
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  caption: { ...typography.caption },
  completedRow: { flexDirection: 'row', alignItems: 'center' },
  completedText: { color: colors.success, fontWeight: '700', fontSize: 13 },
});
