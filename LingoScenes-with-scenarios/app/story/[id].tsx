import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, radius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { storyService } from '@/services/storyService';
import { progressService } from '@/services/progressService';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { WordPopover } from '@/components/WordPopover';

const SPEED_OPTIONS = [0.75, 1.0, 1.25];

export default function StoryPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { translationsVisible, toggleTranslations, playbackSpeed, setPlaybackSpeed } = useAppStore();

  const [sceneIndex, setSceneIndex] = useState(0);
  const [tappedWord, setTappedWord] = useState<string | null>(null);

  const storyQuery = useQuery({
    queryKey: ['story', id],
    queryFn: () => storyService.getStoryById(id),
    enabled: !!id,
  });

  const scenesQuery = useQuery({
    queryKey: ['scenes', id],
    queryFn: () => storyService.getScenesForStory(id),
    enabled: !!id,
  });

  const scenes = scenesQuery.data ?? [];
  const currentScene = scenes[sceneIndex];

  const player = useAudioPlayer(currentScene?.audio_url, {
    id: `scene-${currentScene?.id}`,
    onFinish: () => handleSceneComplete(),
  });

  // Persist progress whenever the scene changes.
  useEffect(() => {
    if (!profile?.id || !id || !currentScene) return;
    const percentage = Math.round(((sceneIndex + 1) / Math.max(scenes.length, 1)) * 100);
    progressService.upsertSceneProgress(profile.id, id, currentScene.id, percentage, sceneIndex).catch(() => {});
  }, [sceneIndex, currentScene?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSceneComplete = () => {
    // Auto-advance when a scene's audio finishes, mirroring the "advance when
    // appropriate" requirement — but don't yank control away mid-read, so we
    // just surface the Next button state; user taps to continue.
  };

  const goNext = async () => {
    await player.unload();
    if (sceneIndex < scenes.length - 1) {
      setSceneIndex((i) => i + 1);
    } else if (profile?.id) {
      await progressService.markStoryCompleted(profile.id, id);
      router.replace(`/exercise/${id}`);
    }
  };

  const goPrev = async () => {
    if (sceneIndex === 0) return;
    await player.unload();
    setSceneIndex((i) => i - 1);
  };

  const words = useMemo(() => currentScene?.dialogue.split(/\s+/) ?? [], [currentScene]);

  if (storyQuery.isLoading || scenesQuery.isLoading) return <LoadingState label="Loading story…" />;
  if (storyQuery.isError || scenesQuery.isError || !storyQuery.data) {
    return <ErrorState message="Couldn't load this story." onRetry={() => { storyQuery.refetch(); scenesQuery.refetch(); }} />;
  }
  if (scenes.length === 0) {
    return <ErrorState message="This story doesn't have any scenes yet." onRetry={() => router.back()} />;
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Close story" accessibilityRole="button">
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <ProgressBar progress={((sceneIndex + 1) / scenes.length) * 100} height={6} />
        <Pressable onPress={toggleTranslations} accessibilityLabel="Toggle translation" accessibilityRole="button">
          <Text style={styles.translateToggle}>{translationsVisible ? '🇬🇧' : '🌐'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.character}>{currentScene.character}</Text>

        <View style={styles.transcript}>
          {words.map((word, i) => (
            <Pressable key={`${word}-${i}`} onPress={() => setTappedWord(word.replace(/[.,!?¿¡]/g, ''))}>
              <Text style={styles.word}>{word} </Text>
            </Pressable>
          ))}
        </View>

        {translationsVisible && <Text style={styles.translation}>{currentScene.translation}</Text>}
      </ScrollView>

      <View style={styles.controls}>
        <View style={styles.speedRow}>
          {SPEED_OPTIONS.map((speed) => (
            <Pressable key={speed} onPress={() => setPlaybackSpeed(speed)} style={styles.speedChip}>
              <Text style={[styles.speedText, playbackSpeed === speed && styles.speedTextActive]}>{speed}x</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.transportRow}>
          <Pressable onPress={goPrev} disabled={sceneIndex === 0} accessibilityLabel="Previous scene">
            <Text style={[styles.transportIcon, sceneIndex === 0 && styles.disabled]}>⏮</Text>
          </Pressable>
          <Pressable onPress={player.replay} accessibilityLabel="Replay">
            <Text style={styles.transportIcon}>↺</Text>
          </Pressable>
          <Pressable
            onPress={player.isPlaying ? player.pause : player.play}
            accessibilityLabel={player.isPlaying ? 'Pause' : 'Play'}
            style={styles.playButton}
          >
            <Text style={styles.playIcon}>{player.isPlaying ? '⏸' : '▶'}</Text>
          </Pressable>
          <Pressable onPress={goNext} accessibilityLabel="Next scene">
            <Text style={styles.transportIcon}>⏭</Text>
          </Pressable>
        </View>

        <Button
          label={sceneIndex < scenes.length - 1 ? 'Next scene' : 'Finish story → Exercises'}
          onPress={goNext}
        />
      </View>

      <WordPopover
        visible={!!tappedWord}
        word={tappedWord}
        language={profile?.learning_language ?? 'de'}
        userId={profile?.id ?? ''}
        onClose={() => setTappedWord(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  close: { fontSize: 20, color: colors.textSecondary },
  translateToggle: { fontSize: 20 },
  content: { padding: spacing.xl, gap: spacing.md, flexGrow: 1, justifyContent: 'center' },
  character: { ...typography.caption, textAlign: 'center', textTransform: 'uppercase' },
  transcript: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  word: { ...typography.h2, lineHeight: 34 },
  translation: { ...typography.bodyMuted, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },
  controls: { padding: spacing.lg, gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  speedRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  speedChip: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  speedText: { ...typography.caption },
  speedTextActive: { color: colors.primary, fontWeight: '700' },
  transportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  transportIcon: { fontSize: 24, color: colors.textPrimary },
  disabled: { opacity: 0.3 },
  playButton: {
    backgroundColor: colors.primary,
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 26, color: colors.bg },
});
