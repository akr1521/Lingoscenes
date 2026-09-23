import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, radius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { storyService, type StoryWithProgress } from '@/services/storyService';
import { StoryCard } from '@/components/StoryCard';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import type { Difficulty } from '@/types/database';

type FilterTab = 'all' | Difficulty | 'completed';

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'completed', label: 'Completed' },
];

export default function StoriesScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const [filter, setFilter] = useState<FilterTab>('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['stories', profile?.id, profile?.learning_language],
    queryFn: () => storyService.getStoriesForUser(profile!.id, profile!.learning_language!),
    enabled: !!profile?.id && !!profile?.learning_language,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data;
    if (filter === 'completed') return data.filter((s) => s.completed);
    return data.filter((s) => s.difficulty === filter);
  }, [data, filter]);

  // A story is "locked" if it's not the first in its level and the previous
  // story at that level hasn't been completed yet — mirrors a typical
  // progressive-unlock story path.
  const isLocked = (story: StoryWithProgress, index: number, list: StoryWithProgress[]) => {
    if (index === 0) return false;
    const prev = list[index - 1];
    return prev.difficulty === story.difficulty && !prev.completed;
  };

  if (isLoading) return <LoadingState label="Loading stories…" />;
  if (isError) return <ErrorState message="Couldn't load stories." onRetry={refetch} />;

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Stories</Text>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setFilter(item.key)}
            style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterLabel, filter === item.key && styles.filterLabelActive]}>{item.label}</Text>
          </Pressable>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No stories match this filter yet.</Text>}
        renderItem={({ item, index }) => (
          <StoryCard
            story={item}
            locked={isLocked(item, index, filtered)}
            onPress={() => router.push(`/story/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { ...typography.h1, padding: spacing.lg, paddingBottom: spacing.sm },
  filterRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { ...typography.caption },
  filterLabelActive: { color: colors.bg, fontWeight: '700' },
  list: { padding: spacing.lg, paddingTop: spacing.sm },
  empty: { ...typography.bodyMuted, textAlign: 'center', marginTop: spacing.xl },
});
