import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { colors, radius, spacing } from '@/theme';

function ShimmerBlock({ style }: { style: object }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.ease }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.block, style, animatedStyle]} />;
}

/** A single skeleton card, matching the ASCII mock in FR-01 §35. */
export function ScenarioCardSkeleton() {
  return (
    <View style={styles.card} accessibilityLabel="Loading scenario" accessibilityRole="progressbar">
      <ShimmerBlock style={styles.thumbnail} />
      <View style={styles.body}>
        <ShimmerBlock style={styles.titleLine} />
        <ShimmerBlock style={styles.descLine} />
        <ShimmerBlock style={styles.metaLine} />
      </View>
    </View>
  );
}

/** A stack of skeleton cards for the initial Learn-screen load. */
export function ScenarioListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <ScenarioCardSkeleton key={i} />
      ))}
    </View>
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
  block: { backgroundColor: colors.surfaceAlt },
  thumbnail: { width: '100%', height: 130 },
  body: { padding: spacing.md, gap: spacing.sm },
  titleLine: { height: 18, width: '70%', borderRadius: radius.sm },
  descLine: { height: 14, width: '95%', borderRadius: radius.sm },
  metaLine: { height: 14, width: '40%', borderRadius: radius.sm },
});
