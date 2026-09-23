import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { Button } from './Button';
import type { Exercise } from '@/types/database';

interface Props {
  exercise: Exercise;
  onAnswered: (answer: string, correct: boolean) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** exercise.options holds the shuffled word bank; exercise.answer is the correct sentence. */
export function ExerciseWordOrder({ exercise, onAnswered }: Props) {
  const wordBank = useMemo(() => shuffle(exercise.options ?? exercise.answer.split(' ')), [exercise]);
  const [available, setAvailable] = useState(wordBank);
  const [chosen, setChosen] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);

  const pick = (word: string, index: number) => {
    if (revealed) return;
    setChosen((c) => [...c, word]);
    setAvailable((a) => a.filter((_, i) => i !== index));
  };

  const unpick = (index: number) => {
    if (revealed) return;
    const word = chosen[index];
    setAvailable((a) => [...a, word]);
    setChosen((c) => c.filter((_, i) => i !== index));
  };

  const submit = () => {
    const built = chosen.join(' ');
    const correct = built.trim().toLowerCase() === exercise.answer.trim().toLowerCase();
    setWasCorrect(correct);
    setRevealed(true);
    onAnswered(built, correct);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{exercise.question}</Text>

      <View style={[styles.answerZone, revealed && (wasCorrect ? styles.zoneCorrect : styles.zoneIncorrect)]}>
        {chosen.length === 0 ? (
          <Text style={styles.placeholder}>Tap words below to build the sentence</Text>
        ) : (
          chosen.map((word, i) => (
            <Pressable key={`${word}-${i}`} onPress={() => unpick(i)} style={styles.chip}>
              <Text style={styles.chipText}>{word}</Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.bank}>
        {available.map((word, i) => (
          <Pressable key={`${word}-${i}`} onPress={() => pick(word, i)} style={styles.chip}>
            <Text style={styles.chipText}>{word}</Text>
          </Pressable>
        ))}
      </View>

      {revealed && !wasCorrect && <Text style={styles.correction}>Correct answer: {exercise.answer}</Text>}

      {!revealed && (
        <Button label="Check" onPress={submit} disabled={available.length > 0} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  question: { ...typography.h3 },
  answerZone: {
    minHeight: 60,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  zoneCorrect: { borderColor: colors.success, borderStyle: 'solid' },
  zoneIncorrect: { borderColor: colors.danger, borderStyle: 'solid' },
  placeholder: { ...typography.caption, alignSelf: 'center' },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { ...typography.body },
  correction: { ...typography.bodyMuted, color: colors.danger },
});
