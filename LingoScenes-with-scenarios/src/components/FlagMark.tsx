import React from 'react';
import { View, StyleSheet } from 'react-native';

const FLAG_STRIPES: Record<string, string[]> = {
  de: ['#000000', '#DD0000', '#FFCE00'],
  es: ['#AA151B', '#F1BF00', '#AA151B'],
  fr: ['#002395', '#FFFFFF', '#ED2939'],
  it: ['#009246', '#FFFFFF', '#CE2B37'],
  ja: ['#FFFFFF', '#BC002D', '#FFFFFF'],
};

export function FlagMark({ code, size = 88 }: { code: string; size?: number }) {
  const stripes = FLAG_STRIPES[code] ?? ['#00B4C8', '#FFFFFF', '#0B2C4A'];
  const vertical = code === 'fr' || code === 'it';

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.inner, { flexDirection: vertical ? 'row' : 'column' }]}>
        {code === 'ja' ? (
          <View style={[styles.jaBase, { backgroundColor: '#FFFFFF' }]}>
            <View style={[styles.jaDot, { width: size * 0.38, height: size * 0.38, borderRadius: size * 0.19 }]} />
          </View>
        ) : (
          stripes.map((color, i) => (
            <View key={i} style={[styles.stripe, { backgroundColor: color, flex: code === 'es' && i === 1 ? 2 : 1 }]} />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  inner: { flex: 1, width: '100%', height: '100%' },
  stripe: { flex: 1 },
  jaBase: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  jaDot: { backgroundColor: '#BC002D' },
});
