import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme';

const { width, height } = Dimensions.get('window');

function makeStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    key: i,
    left: (i * 97 + 13) % width,
    top: (i * 53 + 21) % Math.max(height * 0.72, 400),
    size: i % 7 === 0 ? 3 : 2,
    opacity: i % 3 === 0 ? 0.95 : 0.45,
  }));
}

/** Dark navy night-sky backdrop used on Seedlang-style auth screens. */
export function NightSky({ children }: { children: React.ReactNode }) {
  const stars = useMemo(() => makeStars(42), []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.navy, '#0C2448', colors.navy]} style={StyleSheet.absoluteFill} />
      {stars.map((star) => (
        <View
          key={star.key}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
      <View style={styles.skyline} pointerEvents="none">
        {[40, 72, 56, 110, 64, 88, 48, 96, 58, 74, 52].map((h, i) => (
          <View key={i} style={[styles.building, { height: h, width: i === 3 ? 18 : 22 + (i % 3) * 4 }]} />
        ))}
        <View style={styles.tower}>
          <View style={styles.towerShaft} />
          <View style={styles.towerGlobe} />
          <View style={styles.towerTip} />
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  star: {
    position: 'absolute',
    backgroundColor: '#FDE68A',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  skyline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  building: {
    backgroundColor: colors.navyMid,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  tower: {
    position: 'absolute',
    bottom: 0,
    left: '42%',
    alignItems: 'center',
  },
  towerShaft: {
    width: 8,
    height: 88,
    backgroundColor: colors.secondaryLight,
  },
  towerGlobe: {
    position: 'absolute',
    bottom: 54,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2A5A82',
  },
  towerTip: {
    position: 'absolute',
    bottom: 76,
    width: 3,
    height: 28,
    backgroundColor: colors.secondaryLight,
  },
});
