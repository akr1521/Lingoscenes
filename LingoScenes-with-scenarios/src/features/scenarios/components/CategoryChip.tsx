import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/theme';

const ICONS: Record<string, string> = {
  heart: '❤️',
  plane: '✈️',
  home: '🏠',
  briefcase: '💼',
  sun: '☀️',
  globe: '🌏',
};

export function CategoryChip({
  label,
  icon,
  selected,
  onPress,
  count,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label} category${count !== undefined ? `, ${count} scenarios` : ''}`}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && { opacity: 0.85 }]}
    >
      {icon && ICONS[icon] && <Text style={styles.icon}>{ICONS[icon]}</Text>}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  icon: { fontSize: 14 },
  label: { color: colors.textPrimary, fontWeight: '600', fontSize: 13 },
  labelSelected: { color: colors.bg },
});
