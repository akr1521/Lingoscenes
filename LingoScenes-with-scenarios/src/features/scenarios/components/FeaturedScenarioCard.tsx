import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, shadow } from '@/theme';
import { DifficultyBadge } from './DifficultyBadge';
import { PremiumBadge } from './PremiumBadge';
import { getScenarioCardState } from '../utils/scenarioCardState';
import type { RecommendedScenario } from '../types/scenario.types';

const CARD_WIDTH = 240;

/** FR-01 §15 "Recommended for you" horizontal rail card. */
export function FeaturedScenarioCard({ scenario, onPress }: { scenario: RecommendedScenario; onPress: () => void }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const state = getScenarioCardState(scenario);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Recommended: ${scenario.title}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      testID="featured-scenario-card"
    >
      <View style={styles.thumbnailWrap}>
        {scenario.thumbnailUrl && !thumbnailFailed ? (
          <Image
            source={{ uri: scenario.thumbnailUrl }}
            style={styles.thumbnail}
            onError={() => setThumbnailFailed(true)}
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailFallback]}>
            <Text style={{ fontSize: 24 }}>🎬</Text>
          </View>
        )}
        {state === 'premium_locked' && (
          <View style={styles.lockBadge}>
            <Text>🔒</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.reason} numberOfLines={1}>
          {scenario.reason}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {scenario.title}
        </Text>
        <View style={styles.metaRow}>
          <DifficultyBadge level={scenario.level} />
          <Text style={styles.meta}>⏱ {scenario.durationMinutes} min</Text>
        </View>
        {state === 'premium_locked' && <PremiumBadge />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
    ...shadow.card,
  },
  thumbnailWrap: { position: 'relative' },
  thumbnail: { width: '100%', height: 110 },
  thumbnailFallback: { backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  lockBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.overlay,
    borderRadius: radius.full,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.sm, gap: 4 },
  reason: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  title: { ...typography.h3, fontSize: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  meta: { ...typography.caption },
});
