import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { vocabularyService, type SavedWord } from '@/services/vocabularyService';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { VocabularyLessonCard } from '@/components/VocabularyLessonCard';

const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  learning: 'Learning',
  reviewing: 'Reviewing',
  learned: 'Learned',
};

const STATUS_COLOR: Record<string, string> = {
  new: colors.textMuted,
  learning: colors.secondary,
  reviewing: colors.primary,
  learned: colors.success,
};

export default function VocabularyScreen() {
  const profile = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'new' | 'learning' | 'reviewing' | 'learned'>('all');

  const savedWordsQuery = useQuery({
    queryKey: ['saved-words', profile?.id],
    queryFn: () => vocabularyService.getSavedWords(profile!.id),
    enabled: !!profile?.id,
  });
  const lessonsQuery = useQuery({
    queryKey: ['vocabulary-lessons', profile?.id, profile?.learning_language],
    queryFn: () => vocabularyService.getLessons(profile!.id, profile!.learning_language ?? 'de'),
    enabled: !!profile?.id,
  });

  if (savedWordsQuery.isLoading || lessonsQuery.isLoading) return <LoadingState label="Loading vocabulary…" />;
  if (savedWordsQuery.isError || lessonsQuery.isError) {
    return <ErrorState message="Couldn't load your vocabulary." onRetry={() => { savedWordsQuery.refetch(); lessonsQuery.refetch(); }} />;
  }

  const words = (savedWordsQuery.data ?? []).filter((w) => filter === 'all' || w.status === filter);
  const lessons = lessonsQuery.data ?? [];

  const removeWord = async (word: SavedWord) => {
    if (!profile?.id) return;
    await vocabularyService.removeWord(profile.id, word.vocabulary_id);
    queryClient.invalidateQueries({ queryKey: ['saved-words', profile.id] });
  };

  const playAudio = async (url: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch((cause) => console.warn('[Vocabulary] failed to unload saved-word audio', cause));
        }
      });
    } catch (cause) {
      console.warn('[Vocabulary] saved-word playback failed', cause);
    }
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Vocabulary</Text>
            <Text style={styles.intro}>Build confidence with themed word sets, clear audio, and speaking practice.</Text>
            <Text style={styles.sectionTitle}>Your 20-lesson path</Text>
            <View style={styles.lessons}>
              {lessons.map((lesson) => (
                <VocabularyLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onPress={() => router.push(`/vocabulary/${lesson.id}`)}
                />
              ))}
            </View>
            <Text style={styles.sectionTitle}>Saved words</Text>
            <FlatList
              horizontal
              data={['all', 'new', 'learning', 'reviewing', 'learned'] as const}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              renderItem={({ item }) => (
                <Pressable onPress={() => setFilter(item)} style={[styles.filterChip, filter === item && styles.filterChipActive]}>
                  <Text style={[styles.filterLabel, filter === item && styles.filterLabelActive]}>
                    {item === 'all' ? 'All' : STATUS_LABEL[item]}
                  </Text>
                </Pressable>
              )}
            />
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>No saved words yet — tap words in a story to save them.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={styles.word}>{item.vocabulary.word}</Text>
                <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[item.status] + '30' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>{STATUS_LABEL[item.status]}</Text>
                </View>
              </View>
              <Text style={styles.translation}>{item.vocabulary.translation}</Text>
            </View>
            {item.vocabulary.audio_url && (
              <Pressable onPress={() => playAudio(item.vocabulary.audio_url!)} style={styles.iconButton} accessibilityLabel="Play pronunciation">
                <Text style={{ fontSize: 18 }}>🔊</Text>
              </Pressable>
            )}
            <Pressable onPress={() => removeWord(item)} style={styles.iconButton} accessibilityLabel="Remove word">
              <Text style={{ fontSize: 18 }}>🗑️</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { ...typography.h1, paddingBottom: spacing.xs },
  intro: { ...typography.bodyMuted, marginBottom: spacing.xl },
  sectionTitle: { ...typography.h2, marginBottom: spacing.sm },
  lessons: { gap: spacing.sm, marginBottom: spacing.xl },
  filterRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { ...typography.caption },
  filterLabelActive: { color: colors.bg, fontWeight: '700' },
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
  empty: { ...typography.bodyMuted, textAlign: 'center', marginTop: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  word: { ...typography.h3 },
  translation: { ...typography.bodyMuted },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  iconButton: { padding: spacing.sm },
});
