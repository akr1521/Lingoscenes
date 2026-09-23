import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, radius, shadow, spacing, typography } from '@/theme';
import { foundationsService } from '@/services/foundationsService';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import type { SurvivalPhrase } from '@/types/database';

const CATEGORY_LABEL: Record<string, string> = {
  greetings: 'Greetings',
  essentials: 'Essentials',
  emergency: 'Emergency',
  dining: 'Dining',
  directions: 'Directions',
};

/** List of essential survival phrases grouped by category, with audio playback. */
export function SurvivalPhraseList({ language }: { language: string }) {
  const query = useQuery({
    queryKey: ['survival-phrases', language],
    queryFn: () => foundationsService.getSurvivalPhrases(language),
  });
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set((query.data ?? []).map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [query.data]);

  const phrases = (query.data ?? []).filter((p) => category === 'all' || p.category === category);

  if (query.isLoading) return <LoadingState label="Loading phrases…" />;
  if (query.isError) return <ErrorState message="Couldn't load survival phrases." onRetry={query.refetch} />;
  if (!query.data?.length) {
    return <Text style={styles.empty}>Survival phrases for this language are coming soon.</Text>;
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <Pressable onPress={() => setCategory(item)} style={[styles.filterChip, category === item && styles.filterChipActive]}>
            <Text style={[styles.filterLabel, category === item && styles.filterLabelActive]}>
              {item === 'all' ? 'All' : CATEGORY_LABEL[item] ?? item}
            </Text>
          </Pressable>
        )}
      />
      <View style={{ gap: spacing.sm }}>
        {phrases.map((phrase) => (
          <PhraseRow key={phrase.id} phrase={phrase} />
        ))}
      </View>
    </View>
  );
}

function PhraseRow({ phrase }: { phrase: SurvivalPhrase }) {
  const audio = useAudioPlayer(phrase.audio_url, { id: `phrase-${phrase.id}` });
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.phrase}>{phrase.phrase}</Text>
        <Text style={styles.translation}>{phrase.translation}</Text>
        {phrase.pronunciation && <Text style={styles.pronunciation}>/{phrase.pronunciation}/</Text>}
      </View>
      {phrase.audio_url && (
        <Pressable onPress={audio.isPlaying ? audio.pause : audio.replay} style={styles.iconButton} accessibilityLabel="Play pronunciation">
          <Text style={{ fontSize: 18 }}>{audio.isPlaying ? '⏸' : '🔊'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  empty: { ...typography.bodyMuted, textAlign: 'center', padding: spacing.xl },
  filterRow: { gap: spacing.sm, paddingBottom: spacing.xs },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { ...typography.caption },
  filterLabelActive: { color: colors.bg, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadow.sm,
  },
  phrase: { ...typography.h3 },
  translation: { ...typography.bodyMuted },
  pronunciation: { ...typography.caption, fontStyle: 'italic', marginTop: 2 },
  iconButton: { padding: spacing.sm },
});
