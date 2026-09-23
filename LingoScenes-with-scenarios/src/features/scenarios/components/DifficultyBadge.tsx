import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import type { ScenarioLevel } from '../types/scenario.types';

const LEVEL_LABEL: Record<ScenarioLevel, string> = {
  BEGINNER: 'Beginner',
  ELEMENTARY: 'Elementary',
  INTERMEDIATE: 'Intermediate',
  UPPER_INTERMEDIATE: 'Upper Intermediate',
  ADVANCED: 'Advanced',
};

const LEVEL_COLOR: Record<ScenarioLevel, string> = {
  BEGINNER: colors.success,
  ELEMENTARY: colors.primary,
  INTERMEDIATE: colors.secondary,
  UPPER_INTERMEDIATE: colors.secondary,
  ADVANCED: colors.danger,
};

export function DifficultyBadge({ level }: { level: ScenarioLevel }) {
  const color = LEVEL_COLOR[level];
  return (
    <View style={[styles.pill, { backgroundColor: color + '30' }]}>
      <Text style={[styles.text, { color }]}>{LEVEL_LABEL[level]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  text: { fontSize: 12, fontWeight: '700' },
});
