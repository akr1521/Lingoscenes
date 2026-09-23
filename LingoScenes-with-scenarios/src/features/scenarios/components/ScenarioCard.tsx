import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { DifficultyBadge } from './DifficultyBadge';
import { PremiumBadge } from './PremiumBadge';
import { ScenarioProgress } from './ScenarioProgress';
import { Button } from '@/components/Button';
import { getScenarioCardState, getScenarioCardCta } from '../utils/scenarioCardState';
import type { ScenarioSummary } from '../types/scenario.types';

/**
 * FR-01 §9/§10 Scenario Card. Always tappable — including premium-locked
 * scenarios (AC-13: "Free users can view premium scenario details without
 * bypassing access controls"). The lock only affects the CTA label, never
 * whether the card opens Scenario Detail.
 */
export function ScenarioCard({ scenario, onPress }: { scenario: ScenarioSummary; onPress: () => void }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const state = getScenarioCardState(scenario);
  const cta = getScenarioCardCta(state);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${scenario.title}, ${scenario.level.toLowerCase()}, ${scenario.durationMinutes} minutes${
        state === 'premium_locked' ? ', premium' : ''
      }`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      testID="scenario-card"
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
            <Text style={{ fontSize: 28 }}>🎬</Text>
          </View>
        )}
        {state === 'premium_locked' && (
          <View style={styles.lockBadge}>
            <Text>🔒</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <Text style={styles.title} numberOfLines={1}>
            {scenario.title}
          </Text>
          <DifficultyBadge level={scenario.level} />
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {scenario.description}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>⏱ {scenario.durationMinutes} min</Text>
          {scenario.categories[0] && <Text style={styles.meta}>{scenario.categories[0].name}</Text>}
          {state === 'premium_locked' && <PremiumBadge />}
        </View>

        {scenario.progress && <ScenarioProgress progress={scenario.progress} />}

        <Button
          label={cta}
          onPress={onPress}
          variant={state === 'completed' ? 'secondary' : 'primary'}
          style={styles.cta}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  thumbnailWrap: { position: 'relative' },
  thumbnail: { width: '100%', height: 130 },
  thumbnailFallback: { backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  lockBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: radius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.md, gap: spacing.xs },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.h3, flexShrink: 1 },
  description: { ...typography.bodyMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { ...typography.caption },
  cta: { marginTop: spacing.sm, minHeight: 44 },
});
