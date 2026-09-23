import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Button } from './Button';
import { ExerciseMultipleChoice } from './ExerciseMultipleChoice';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import type { Exercise } from '@/types/database';

interface Props {
  exercise: Exercise;
  onAnswered: (answer: string, correct: boolean) => void;
}

/** Plays audio, then reuses the multiple-choice UI to pick what was heard. */
export function ExerciseListening({ exercise, onAnswered }: Props) {
  const player = useAudioPlayer(exercise.audio_url, { id: `exercise-${exercise.id}` });

  return (
    <View style={styles.container}>
      <View style={styles.playerRow}>
        <Button
          label={player.isPlaying ? '⏸ Pause' : '▶ Play audio'}
          onPress={player.isPlaying ? player.pause : player.play}
          variant="secondary"
        />
        <Button label="↺ Replay" onPress={player.replay} variant="ghost" />
      </View>
      {player.state === 'error' && <Text style={styles.error}>Couldn't load audio for this exercise.</Text>}

      <ExerciseMultipleChoice exercise={exercise} onAnswered={onAnswered} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  playerRow: { flexDirection: 'row', gap: spacing.sm },
  error: { ...typography.caption, color: colors.danger },
});
