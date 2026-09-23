import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { ErrorState } from '@/components/ErrorState';
import { track } from '@/lib/analytics';
import { useScenarios } from '../hooks/useScenarios';
import { useScenarioCategories } from '../hooks/useScenarioCategories';
import { ScenarioCard } from '../components/ScenarioCard';
import { ScenarioListSkeleton } from '../components/ScenarioSkeleton';

export function ScenarioCategoryScreen({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const categoriesQuery = useScenarioCategories();
  const category = categoriesQuery.data?.find((c) => c.slug === categorySlug);
  const listQuery = useScenarios({ category: categorySlug });

  const scenarios = listQuery.data?.pages.flatMap((p) => p.items) ?? [];

  useEffect(() => {
    track('category_selected', { category: categorySlug });
  }, [categorySlug]);

  if (listQuery.isLoading) {
    return (
      <View style={styles.container}>
        <ScenarioListSkeleton />
      </View>
    );
  }

  if (listQuery.error && scenarios.length === 0) {
    return (
      <ErrorState
        message="Unable to load scenarios. Please check your internet connection."
        onRetry={() => listQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={scenarios}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <Text style={styles.title}>{category?.name ?? 'Category'}</Text>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No scenarios in this category yet.</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <ScenarioCard
          scenario={item}
          onPress={() => {
            track('scenario_card_clicked', {
              scenarioId: item.id,
              category: categorySlug,
              level: item.level,
              source: 'category',
              position: index,
            });
            router.push(`/scenario/${item.id}`);
          }}
        />
      )}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) listQuery.fetchNextPage();
      }}
      ListFooterComponent={listQuery.isFetchingNextPage ? <ScenarioListSkeleton count={2} /> : null}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.md },
  emptyState: { alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.bodyMuted, textAlign: 'center' },
});
