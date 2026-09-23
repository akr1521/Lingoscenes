import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/theme';

/** FR-01 §10 State 4 — "🔒 Premium" badge shown on locked scenario cards. */
export function PremiumBadge() {
  return (
    <View style={styles.pill} accessibilityLabel="Premium scenario">
      <Text style={styles.text}>🔒 Premium</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  text: { fontSize: 12, fontWeight: '700', color: colors.secondary },
});
