import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { vocabularyService } from '@/services/vocabularyService';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

/**
 * Spaced-repetition vocabulary review: shows a word, user recalls the
 * meaning, then reveals the answer and self-grades (Knew it / Didn't know).
 * This is the "Practice" surface distinct from in-story exercises.
 */
export default function PracticeScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  const { data: dueWords, isLoading, isError, refetch } = useQuery({
    queryKey: ['due-review', profile?.id],
    queryFn: () => vocabularyService.getDueForReview(profile!.id),
    enabled: !!profile?.id,
  });

  if (isLoading) return <LoadingState label="Finding words to review…" />;
  if (isError) return <ErrorState message="Couldn't load your review queue." onRetry={refetch} />;

  if (!dueWords || dueWords.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>✅</Text>
        <Text style={typography.h2}>All caught up!</Text>
        <Text style={styles.subtitle}>No vocabulary due for review right now. Save words from stories to build your queue.</Text>
      </View>
    );
  }

  if (sessionDone) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={typography.h2}>Review complete</Text>
        <Button
          label="Review again"
          onPress={() => {
            setIndex(0);
            setSessionDone(false);
            refetch();
          }}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  const current = dueWords[index];

  const grade = async (knewIt: boolean) => {
    await vocabularyService.recordReview(current, knewIt);
    setRevealed(false);
    if (index < dueWords.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setSessionDone(true);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Practice</Text>
      <Text style={styles.counter}>
        {index + 1} of {dueWords.length} due
      </Text>

      <Card style={styles.flashcard}>
        <Text style={styles.word}>{current.vocabulary.word}</Text>
        {revealed && (
          <>
            <Text style={styles.translation}>{current.vocabulary.translation}</Text>
            {current.vocabulary.example_sentence && (
              <Text style={styles.example}>“{current.vocabulary.example_sentence}”</Text>
            )}
          </>
        )}
      </Card>

      {!revealed ? (
        <Button label="Show answer" onPress={() => setRevealed(true)} />
      ) : (
        <View style={styles.gradeRow}>
          <Button label="😕 Didn't know" variant="secondary" onPress={() => grade(false)} style={{ flex: 1 }} />
          <Button label="😊 Knew it" onPress={() => grade(true)} style={{ flex: 1 }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, gap: spacing.md },
  header: { ...typography.h1 },
  counter: { ...typography.caption },
  flashcard: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm, marginTop: spacing.lg },
  word: { ...typography.h1 },
  translation: { ...typography.h3, color: colors.primary },
  example: { ...typography.bodyMuted, fontStyle: 'italic', textAlign: 'center' },
  gradeRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emoji: { fontSize: 48 },
  subtitle: { ...typography.bodyMuted, textAlign: 'center' },
});
