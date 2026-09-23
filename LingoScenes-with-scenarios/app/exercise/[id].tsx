import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { exerciseService } from '@/services/exerciseService';
import { progressService } from '@/services/progressService';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { ExerciseMultipleChoice } from '@/components/ExerciseMultipleChoice';
import { ExerciseFillBlank } from '@/components/ExerciseFillBlank';
import { ExerciseWordOrder } from '@/components/ExerciseWordOrder';
import { ExerciseListening } from '@/components/ExerciseListening';
import type { Exercise } from '@/types/database';

// storyId is passed as the route param (exercises belong to a story).
export default function ExerciseSessionScreen() {
  const { id: storyId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  const { data: exercises, isLoading, isError, refetch } = useQuery({
    queryKey: ['exercises', storyId],
    queryFn: () => exerciseService.getExercisesForStory(storyId),
    enabled: !!storyId,
  });

  if (isLoading) return <LoadingState label="Preparing exercises…" />;
  if (isError) return <ErrorState message="Couldn't load exercises." onRetry={refetch} />;
  if (!exercises || exercises.length === 0) {
    return (
      <View style={styles.screen}>
        <ErrorState message="No exercises for this story yet." onRetry={() => router.back()} />
      </View>
    );
  }

  if (finished) {
    const scorePct = Math.round((results.correct / results.total) * 100);
    return (
      <View style={styles.completionScreen}>
        <Text style={styles.completionEmoji}>{scorePct >= 80 ? '🎉' : scorePct >= 50 ? '👍' : '💪'}</Text>
        <Text style={styles.completionTitle}>Lesson complete!</Text>
        <Text style={styles.completionScore}>
          {results.correct} / {results.total} correct ({scorePct}%)
        </Text>
        <Button label="Back to stories" onPress={() => router.replace('/(tabs)/stories')} style={{ marginTop: spacing.xl }} />
        <Button
          label="Practice again"
          variant="secondary"
          onPress={() => {
            setIndex(0);
            setResults({ correct: 0, total: 0 });
            setFinished(false);
          }}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    );
  }

  const exercise = exercises[index];

  const handleAnswered = async (answer: string, correct: boolean) => {
    setAnswered(true);
    setWasCorrect(correct);
    setResults((r) => ({ correct: r.correct + (correct ? 1 : 0), total: r.total + 1 }));
    if (profile?.id) {
      progressService.recordExerciseAttempt(profile.id, exercise.id, answer, correct).catch(() => {});
    }
  };

  const handleContinue = () => {
    setAnswered(false);
    if (index < exercises.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Close exercises">
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <ProgressBar progress={(index / exercises.length) * 100} height={6} />
        <Text style={styles.counter}>
          {index + 1}/{exercises.length}
        </Text>
      </View>

      <View style={styles.body}>{renderExercise(exercise, handleAnswered)}</View>

      {answered && (
        <View style={[styles.feedbackBar, wasCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedbackTitle}>{wasCorrect ? 'Correct!' : 'Not quite'}</Text>
            {!wasCorrect && exercise.explanation && <Text style={styles.feedbackExplanation}>{exercise.explanation}</Text>}
          </View>
          <Button label="Continue" onPress={handleContinue} />
        </View>
      )}
    </View>
  );
}

function renderExercise(exercise: Exercise, onAnswered: (answer: string, correct: boolean) => void) {
  // IMPORTANT: each branch is keyed by exercise.id. Without this, consecutive
  // exercises of the *same* type (e.g. two multiple_choice questions in a row,
  // which is common) would reuse the same component instance and carry over
  // its internal "selected/revealed" state into the next question — showing
  // the previous answer's highlight/disabled state on a brand-new question.
  // Keying forces React to unmount/remount so each question starts fresh.
  switch (exercise.type) {
    case 'multiple_choice':
    case 'vocabulary':
      return <ExerciseMultipleChoice key={exercise.id} exercise={exercise} onAnswered={onAnswered} />;
    case 'listening':
      return <ExerciseListening key={exercise.id} exercise={exercise} onAnswered={onAnswered} />;
    case 'fill_blank':
    case 'translation':
      return <ExerciseFillBlank key={exercise.id} exercise={exercise} onAnswered={onAnswered} />;
    case 'word_order':
      return <ExerciseWordOrder key={exercise.id} exercise={exercise} onAnswered={onAnswered} />;
    case 'pronunciation':
      // Repeat-after-me: reuse listening UI (play + record is device-mic dependent;
      // documented simplification — see README "Known simplifications").
      return <ExerciseListening key={exercise.id} exercise={exercise} onAnswered={onAnswered} />;
    default:
      return <Text style={{ color: colors.textPrimary }}>Unsupported exercise type.</Text>;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  close: { fontSize: 20, color: colors.textSecondary },
  counter: { ...typography.caption },
  body: { flex: 1, padding: spacing.xl },
  feedbackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackCorrect: { backgroundColor: colors.success + '15' },
  feedbackIncorrect: { backgroundColor: colors.danger + '15' },
  feedbackTitle: { ...typography.h3 },
  feedbackExplanation: { ...typography.bodyMuted, marginTop: 2 },
  completionScreen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  completionEmoji: { fontSize: 56 },
  completionTitle: { ...typography.h1, marginTop: spacing.md },
  completionScore: { ...typography.bodyMuted, marginTop: spacing.xs },
});
