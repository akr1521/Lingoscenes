import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadow } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { storyService } from '@/services/storyService';
import { progressService } from '@/services/progressService';
import { vocabularyService } from '@/services/vocabularyService';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.id;

  const continueQuery = useQuery({
    queryKey: ['continue-learning', userId],
    queryFn: () => storyService.getContinueLearning(userId!),
    enabled: !!userId,
  });

  const summaryQuery = useQuery({
    queryKey: ['progress-summary', userId],
    queryFn: () => progressService.getSummary(userId!),
    enabled: !!userId,
  });

  const savedWordsQuery = useQuery({
    queryKey: ['saved-words-count', userId],
    queryFn: () => vocabularyService.getSavedWords(userId!),
    enabled: !!userId,
  });

  const isLoading = continueQuery.isLoading || summaryQuery.isLoading;

  if (isLoading) return <LoadingState label="Loading your dashboard…" />;
  if (summaryQuery.isError) {
    return <ErrorState message="Couldn't load your progress." onRetry={() => summaryQuery.refetch()} />;
  }

  const summary = summaryQuery.data;
  const continueItem = continueQuery.data;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => {
            continueQuery.refetch();
            summaryQuery.refetch();
            savedWordsQuery.refetch();
          }}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Ready to speak?</Text>
          <Text style={styles.subGreeting}>Keep going — every sentence is a scene.</Text>
        </View>
        <View style={styles.streakPill}>
          <Ionicons name="flame" size={16} color={colors.warning} />
          <Text style={styles.streakText}>{summary?.currentStreak ?? 0}</Text>
        </View>
      </View>

      <Card style={styles.continueCard}>
        <View style={styles.continueHeader}>
          <View style={styles.continueIconWrap}>
            <Ionicons name="play-circle" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.continueLabel}>Continue learning</Text>
            {continueItem ? (
              <Text style={styles.continueTitle}>{continueItem.story.title}</Text>
            ) : (
              <Text style={styles.continueTitle}>Start your first story</Text>
            )}
          </View>
        </View>
        {continueItem ? (
          <>
            <ProgressBar progress={continueItem.progress} height={6} />
            <Button
              label="Continue"
              onPress={() => router.push(`/story/${continueItem.story.id}`)}
              style={{ marginTop: spacing.md }}
            />
          </>
        ) : (
          <Button
            label="Browse stories"
            onPress={() => router.push('/(tabs)/stories')}
            variant="secondary"
            style={{ marginTop: spacing.md }}
          />
        )}
      </Card>

      <View style={styles.statsGrid}>
        <StatBox
          icon="flame-outline"
          label="Streak"
          value={`${summary?.currentStreak ?? 0}`}
          color={colors.warning}
        />
        <StatBox
          icon="book-outline"
          label="Stories"
          value={`${summary?.storiesCompleted ?? 0}`}
          color={colors.primary}
        />
        <StatBox
          icon="heart-outline"
          label="Words"
          value={`${savedWordsQuery.data?.length ?? 0}`}
          color={colors.danger}
        />
        <StatBox
          icon="trophy-outline"
          label="Accuracy"
          value={accuracyLabel(summary?.correctAnswers, summary?.incorrectAnswers)}
          color={colors.secondary}
        />
      </View>

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.quickActions}>
        <QuickAction
          icon="book-outline"
          label="Stories"
          color={colors.primary}
          onPress={() => router.push('/(tabs)/stories')}
        />
        <QuickAction
          icon="compass-outline"
          label="Learn"
          color={colors.secondary}
          onPress={() => router.push('/(tabs)/learn')}
        />
        <QuickAction
          icon="flash-outline"
          label="Practice"
          color={colors.warning}
          onPress={() => router.push('/(tabs)/practice')}
        />
        <QuickAction
          icon="stats-chart-outline"
          label="Progress"
          color={colors.danger}
          onPress={() => router.push('/(tabs)/progress')}
        />
        <QuickAction
          icon="text-outline"
          label="Foundations"
          color={colors.success}
          onPress={() => router.push('/foundations')}
        />
      </View>
    </ScrollView>
  );
}

function accuracyLabel(correct = 0, incorrect = 0) {
  const total = correct + incorrect;
  if (total === 0) return '—';
  return `${Math.round((correct / total) * 100)}%`;
}

function StatBox({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '12' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgWarm },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  greeting: { ...typography.h1 },
  subGreeting: { ...typography.bodyMuted, marginTop: 2 },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warning,
  },
  continueCard: {
    padding: spacing.lg,
  },
  continueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  continueIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueLabel: { ...typography.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  continueTitle: { ...typography.h3, marginTop: 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    ...shadow.sm,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.caption, marginTop: 2 },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAction: {
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
    ...shadow.sm,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { ...typography.caption, fontWeight: '600' },
});
