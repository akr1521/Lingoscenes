import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { ProgressBar } from '@/components/ProgressBar';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { usePronunciationRecorder } from '@/hooks/usePronunciationRecorder';
import { vocabularyService } from '@/services/vocabularyService';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, typography } from '@/theme';

export default function VocabularyLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useAuthStore((state) => state.profile);
  const [wordIndex, setWordIndex] = useState(0);
  const lessonQuery = useQuery({
    queryKey: ['vocabulary-lesson', id, profile?.id],
    queryFn: () => vocabularyService.getLesson(profile!.id, id),
    enabled: !!profile?.id && !!id,
  });
  const lesson = lessonQuery.data;
  const currentWord = lesson?.words[wordIndex];
  const audio = useAudioPlayer(currentWord?.audio_url, { id: `vocabulary-word-${currentWord?.id ?? id}` });
  const recorder = usePronunciationRecorder();
  const completeLesson = useMutation({
    mutationFn: () => vocabularyService.completeLesson(profile!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary-lessons', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary-lesson', id, profile?.id] });
    },
  });

  useEffect(() => {
    recorder.reset().catch((cause) => console.warn('[VocabularyLesson] failed to reset recorder', cause));
  }, [wordIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = useMemo(
    () => lesson && lesson.words.length ? ((wordIndex + 1) / lesson.words.length) * 100 : 0,
    [lesson, wordIndex]
  );

  const nextWord = async () => {
    await audio.unload();
    if (!lesson) return;
    if (wordIndex < lesson.words.length - 1) {
      setWordIndex((index) => index + 1);
      return;
    }
    completeLesson.mutate();
  };

  if (lessonQuery.isLoading) return <LoadingState label="Loading lesson…" />;
  if (lessonQuery.isError || !lesson) {
    return <ErrorState message="Couldn't load this vocabulary lesson." onRetry={lessonQuery.refetch} />;
  }
  if (!currentWord) {
    return <ErrorState message="This lesson is being prepared. Check back soon." onRetry={() => router.back()} />;
  }

  const targetAudioLabel = audio.state === 'error' ? 'Retry pronunciation' : audio.isPlaying ? 'Playing pronunciation…' : 'Listen to pronunciation';

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close lesson">
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={styles.progressWrap}>
          <Text style={styles.lessonLabel}>Lesson {lesson.order_index}: {lesson.title}</Text>
          <ProgressBar progress={progress} height={6} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.prompt}>Listen, then say the word aloud.</Text>
        <View style={styles.wordCard}>
          <Text style={styles.word}>{currentWord.word}</Text>
          {currentWord.pronunciation && <Text style={styles.pronunciation}>/{currentWord.pronunciation}/</Text>}
          <Text style={styles.translation}>{currentWord.translation}</Text>
          {currentWord.example_sentence && <Text style={styles.example}>“{currentWord.example_sentence}”</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Listen</Text>
          {currentWord.audio_url ? (
            <Button
              label={targetAudioLabel}
              onPress={audio.state === 'error' ? audio.play : audio.isPlaying ? audio.pause : audio.replay}
              variant="secondary"
              loading={audio.state === 'loading'}
            />
          ) : (
            <Text style={styles.unavailable}>Pronunciation audio will be available soon.</Text>
          )}
          {audio.state === 'error' && <Text style={styles.error}>Audio could not be played. Tap Retry pronunciation to try again.</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Speak</Text>
          <Text style={styles.guidance}>Record yourself saying “{currentWord.word}”, then compare it with the pronunciation.</Text>
          <Button
            label={recorder.state === 'recording' ? 'Stop recording' : recorder.state === 'recorded' ? 'Record again' : 'Start recording'}
            onPress={recorder.state === 'recording' ? recorder.stopRecording : recorder.startRecording}
            variant={recorder.state === 'recording' ? 'danger' : 'primary'}
          />
          {recorder.state === 'recorded' && (
            <Button label="Play my recording" onPress={recorder.playRecording} variant="secondary" />
          )}
          {recorder.error && <Text style={styles.error}>{recorder.error}</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.count}>{wordIndex + 1} of {lesson.words.length}</Text>
        {completeLesson.isError && <Text style={styles.error}>Couldn’t finish the lesson. Please try again.</Text>}
        <Button
          label={wordIndex === lesson.words.length - 1 ? (completeLesson.isPending ? 'Finishing…' : 'Finish lesson') : 'Next word'}
          onPress={nextWord}
          loading={completeLesson.isPending}
          disabled={completeLesson.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.bg, flex: 1 },
  topBar: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  close: { color: colors.textSecondary, fontSize: 20 },
  progressWrap: { flex: 1, gap: spacing.xs },
  lessonLabel: { ...typography.caption, color: colors.textSecondary },
  content: { gap: spacing.xl, padding: spacing.lg, paddingTop: spacing.xl },
  prompt: { ...typography.bodyMuted, textAlign: 'center' },
  wordCard: {
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  word: { ...typography.h1, color: colors.secondary, textAlign: 'center' },
  pronunciation: { ...typography.bodyMuted, fontStyle: 'italic' },
  translation: { ...typography.h3, color: colors.primary },
  example: { ...typography.bodyMuted, fontStyle: 'italic', textAlign: 'center' },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.h3 },
  guidance: { ...typography.bodyMuted },
  unavailable: { ...typography.bodyMuted, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md },
  error: { ...typography.caption, color: colors.danger },
  footer: { borderTopColor: colors.border, borderTopWidth: 1, gap: spacing.sm, padding: spacing.lg },
  count: { ...typography.caption, textAlign: 'center' },
});
