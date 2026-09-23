import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, radius, shadow, spacing, typography } from '@/theme';
import { foundationsService } from '@/services/foundationsService';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

/**
 * Swipe-through explorer for a language's core alphabet or pronunciation
 * guide (Latin-script languages get spelling/sound rules instead of a
 * separate script). Used in onboarding and the standalone Foundations hub.
 */
export function AlphabetExplorer({ language }: { language: string }) {
  const [index, setIndex] = useState(0);
  const query = useQuery({
    queryKey: ['alphabet', language],
    queryFn: () => foundationsService.getAlphabet(language),
  });
  const characters = query.data ?? [];
  const current = characters[index];
  const audio = useAudioPlayer(current?.audio_url, { id: `alphabet-${current?.id ?? index}` });

  if (query.isLoading) return <LoadingState label="Loading alphabet…" />;
  if (query.isError) return <ErrorState message="Couldn't load the alphabet guide." onRetry={query.refetch} />;
  if (!current) {
    return <Text style={styles.empty}>This language's alphabet guide is coming soon.</Text>;
  }

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(characters.length - 1, i + 1));

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.character}>{current.character}</Text>
        {current.romanization ? <Text style={styles.romanization}>{current.romanization}</Text> : null}
        <Text style={styles.guide}>{current.pronunciation_guide}</Text>
        {current.example_word && (
          <Text style={styles.example}>
            {current.example_word}
            {current.example_translation ? ` — ${current.example_translation}` : ''}
          </Text>
        )}
        {current.audio_url && (
          <Pressable onPress={audio.isPlaying ? audio.pause : audio.replay} style={styles.audioButton} accessibilityLabel="Play pronunciation">
            <Text style={{ fontSize: 18 }}>{audio.isPlaying ? '⏸' : '🔊'}</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.navRow}>
        <Pressable onPress={goPrev} disabled={index === 0} style={[styles.navButton, index === 0 && styles.navDisabled]}>
          <Text style={styles.navLabel}>‹ Prev</Text>
        </Pressable>
        <Text style={styles.count}>{index + 1} / {characters.length}</Text>
        <Pressable onPress={goNext} disabled={index === characters.length - 1} style={[styles.navButton, index === characters.length - 1 && styles.navDisabled]}>
          <Text style={styles.navLabel}>Next ›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  empty: { ...typography.bodyMuted, textAlign: 'center', padding: spacing.xl },
  card: {
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
    ...shadow.sm,
  },
  character: { fontSize: 48, fontWeight: '800', color: colors.secondary },
  romanization: { ...typography.bodyMuted, fontStyle: 'italic' },
  guide: { ...typography.body, textAlign: 'center' },
  example: { ...typography.bodyMuted, textAlign: 'center' },
  audioButton: { marginTop: spacing.xs, padding: spacing.sm },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  navDisabled: { opacity: 0.4 },
  navLabel: { ...typography.caption, fontWeight: '700', color: colors.primary },
  count: { ...typography.caption },
});
