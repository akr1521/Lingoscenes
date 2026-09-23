import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { spacing, typography } from '@/theme';
import { CategoryChip } from './CategoryChip';
import type { ScenarioCategoryWithCount, ScenarioLevel } from '../types/scenario.types';

const LEVELS: { value: ScenarioLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'ELEMENTARY', label: 'Elementary' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'UPPER_INTERMEDIATE', label: 'Upper Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export function ScenarioFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedLevel,
  onSelectLevel,
}: {
  categories: ScenarioCategoryWithCount[];
  selectedCategory?: string;
  onSelectCategory: (slug: string | undefined) => void;
  selectedLevel?: ScenarioLevel;
  onSelectLevel: (level: ScenarioLevel | undefined) => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <CategoryChip label="All" selected={!selectedCategory} onPress={() => onSelectCategory(undefined)} />
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.name}
            icon={c.icon}
            count={c.scenarioCount}
            selected={selectedCategory === c.slug}
            onPress={() => onSelectCategory(selectedCategory === c.slug ? undefined : c.slug)}
          />
        ))}
      </ScrollView>

      <Text style={styles.sectionLabel}>Difficulty</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <CategoryChip label="All" selected={!selectedLevel} onPress={() => onSelectLevel(undefined)} />
        {LEVELS.map((l) => (
          <CategoryChip
            key={l.value}
            label={l.label}
            selected={selectedLevel === l.value}
            onPress={() => onSelectLevel(selectedLevel === l.value ? undefined : l.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs, marginBottom: spacing.sm },
  sectionLabel: { ...typography.caption, marginBottom: 4, marginTop: spacing.sm },
  row: { paddingRight: spacing.md },
});
