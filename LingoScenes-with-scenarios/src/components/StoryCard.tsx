import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { colors, radius, spacing, typography, shadow } from '@/theme';
import { ProgressBar } from './ProgressBar';
import type { StoryWithProgress } from '@/services/storyService';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: colors.success,
  intermediate: colors.warning,
  advanced: colors.danger,
};

export function StoryCard({
  story,
  locked,
  onPress,
}: {
  story: StoryWithProgress;
  locked?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityLabel={`${story.title}, ${story.difficulty}, ${locked ? 'locked' : `${story.completion_percentage}% complete`}`}
      style={({ pressed }) => [
        styles.card,
        pressed && !locked && styles.pressed,
        locked && styles.locked,
      ]}
    >
      <View style={styles.thumbnailWrap}>
        {story.thumbnail_url ? (
          <Image source={{ uri: story.thumbnail_url }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailFallback]}>
            <Text style={{ fontSize: 32 }}>📖</Text>
          </View>
        )}
        {locked && (
          <View style={styles.lockOverlay}>
            <View style={styles.lockBadge}>
              <Text style={{ fontSize: 14 }}>🔒</Text>
            </View>
          </View>
        )}
        {story.completed && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeText}>✓</Text>
          </View>
        )}
        <View style={[styles.difficultyPill, { backgroundColor: DIFFICULTY_COLOR[story.difficulty] }]}>
          <Text style={styles.difficultyText}>{story.difficulty}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {story.title}
        </Text>
        {story.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {story.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>⏱ {story.duration_minutes} min</Text>
          {!locked && <Text style={styles.meta}>{story.completion_percentage}% complete</Text>}
        </View>
        {!locked && <ProgressBar progress={story.completion_percentage} height={4} />}
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
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  locked: { opacity: 0.5 },
  thumbnailWrap: { position: 'relative' },
  thumbnail: { width: '100%', height: 140 },
  thumbnailFallback: {
    backgroundColor: colors.bgWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  difficultyPill: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  difficultyText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  body: { padding: spacing.md, gap: spacing.xs },
  title: { ...typography.h3 },
  description: { ...typography.bodyMuted, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  meta: { ...typography.caption },
});
