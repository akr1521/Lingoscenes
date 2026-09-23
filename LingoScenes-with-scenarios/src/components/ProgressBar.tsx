import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors } from '@/theme';

export function ProgressBar({ progress, height = 8, color = colors.primary }: { progress: number; height?: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, progress));
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${clamped}%`, { duration: 400 }),
  }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color, borderRadius: height / 2 }, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
