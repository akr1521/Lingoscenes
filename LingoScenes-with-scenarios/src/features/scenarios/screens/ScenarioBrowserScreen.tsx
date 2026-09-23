import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { ErrorState } from '@/components/ErrorState';
import { track } from '@/lib/analytics';
import { useScenarios } from '../hooks/useScenarios';
import { useRecommendedScenarios } from '../hooks/useRecommendedScenarios';
import { useScenarioCategories } from '../hooks/useScenarioCategories';
import { useScenarioSearch } from '../hooks/useScenarioSearch';
import { ScenarioCard } from '../components/ScenarioCard';
import { FeaturedScenarioCard } from '../components/FeaturedScenarioCard';
import { ScenarioFilters } from '../components/ScenarioFilters';
import { ScenarioSearch } from '../components/ScenarioSearch';
import { ScenarioListSkeleton } from '../components/ScenarioSkeleton';
import type { ScenarioLevel, ScenarioSummary } from '../types/scenario.types';

const EMPTY_SEARCH_SUGGESTIONS = ['Restaurant', 'Family', 'Travel', 'Parents', 'Work'];

export function ScenarioBrowserScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [level, setLevel] = useState<ScenarioLevel | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const isSearching = searchQuery.trim().length > 0;

  const categoriesQuery = useScenarioCategories();
  const recommendedQuery = useRecommendedScenarios(10);
  const listQuery = useScenarios({ category, level });
  const searchResultsQuery = useScenarioSearch(searchQuery);

  useEffect(() => {
    track('learn_screen_viewed');
  }, []);

  useEffect(() => {
    if (listQuery.data) {
      const total = listQuery.data.pages[0]?.pagination.totalItems ?? 0;
      track('scenario_list_loaded', { category: category ?? 'all', level: level ?? 'all', totalItems: total });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listQuery.data]);

  const scenarios: ScenarioSummary[] = useMemo(
    () => (isSearching ? searchResultsQuery.data?.items ?? [] : listQuery.data?.pages.flatMap((p) => p.items) ?? []),
    [isSearching, searchResultsQuery.data, listQuery.data]
  );

  const openScenario = (scenario: ScenarioSummary, source: 'browse' | 'recommended' | 'search', position: number) => {
    track(source === 'search' ? 'search_result_clicked' : 'scenario_card_clicked', {
      scenarioId: scenario.id,
      category: scenario.categories[0]?.slug,
      level: scenario.level,
      source,
      position,
    });
    router.push(`/scenario/${scenario.id}`);
  };

  const handleSelectCategory = (slug: string | undefined) => {
    setCategory(slug);
    track('category_selected', { category: slug ?? 'all' });
    if (slug) track('filter_applied', { category: slug, level });
  };

  const handleSelectLevel = (value: ScenarioLevel | undefined) => {
    setLevel(value);
    track('filter_applied', { category: category ?? 'all', level: value ?? 'all' });
  };

  const renderHeader = () => (
    <View>
      <Text style={styles.screenTitle}>Learn</Text>
      <Text style={styles.screenSubtitle}>Find a real-life Hindi conversation to practice.</Text>

      <ScenarioSearch
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearchStarted={() => track('search_started', { query: searchQuery })}
      />

      {!isSearching && (
        <>
          {recommendedQuery.data && recommendedQuery.data.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended for you</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
                {recommendedQuery.data.map((scenario, i) => (
                  <FeaturedScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onPress={() => openScenario(scenario, 'recommended', i)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <ScenarioFilters
              categories={categoriesQuery.data ?? []}
              selectedCategory={category}
              onSelectCategory={handleSelectCategory}
              selectedLevel={level}
              onSelectLevel={handleSelectLevel}
            />
          </View>

          <Text style={styles.sectionTitle}>All scenarios</Text>
        </>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isSearching) {
      if (searchResultsQuery.isLoading) return <ScenarioListSkeleton count={2} />;
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No scenarios found.</Text>
          <Text style={styles.emptySubtitle}>Try searching for:</Text>
          <View style={styles.suggestionRow}>
            {EMPTY_SEARCH_SUGGESTIONS.map((s) => (
              <Text key={s} style={styles.suggestionChip} onPress={() => setSearchQuery(s)}>
                {s}
              </Text>
            ))}
          </View>
        </View>
      );
    }
    if (listQuery.isLoading) return <ScenarioListSkeleton />;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No scenarios available right now.</Text>
      </View>
    );
  };

  const activeError = isSearching ? searchResultsQuery.error : listQuery.error;
  const hasData = scenarios.length > 0;

  if (activeError && !hasData) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <ErrorState
          message="Unable to load scenarios. Please check your internet connection."
          onRetry={() => (isSearching ? searchResultsQuery.refetch() : listQuery.refetch())}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={scenarios}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      renderItem={({ item, index }) => (
        <ScenarioCard scenario={item} onPress={() => openScenario(item, isSearching ? 'search' : 'browse', index)} />
      )}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (!isSearching && listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
          listQuery.fetchNextPage();
        }
      }}
      ListFooterComponent={listQuery.isFetchingNextPage ? <ScenarioListSkeleton count={2} /> : null}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  screenTitle: { ...typography.h1, marginBottom: spacing.xs },
  screenSubtitle: { ...typography.bodyMuted, marginBottom: spacing.md },
  section: { marginTop: spacing.lg },
  sectionTitle: { ...typography.h2, fontSize: 18, marginTop: spacing.md, marginBottom: spacing.sm },
  emptyState: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { ...typography.body, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { ...typography.bodyMuted },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  suggestionChip: {
    ...typography.caption,
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
});
