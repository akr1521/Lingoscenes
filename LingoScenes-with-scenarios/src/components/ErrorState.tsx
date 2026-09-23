import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '@/theme';
import { Button } from './Button';

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && <Button label="Try again" onPress={onRetry} variant="secondary" style={{ marginTop: spacing.md }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emoji: { fontSize: 32 },
  message: { ...typography.bodyMuted, textAlign: 'center' },
});
