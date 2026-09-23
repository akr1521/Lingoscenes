import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Button } from './Button';
import { exerciseService } from '@/services/exerciseService';
import type { Exercise } from '@/types/database';

interface Props {
  exercise: Exercise;
  onAnswered: (answer: string, correct: boolean) => void;
}

/** Question text should contain "___" where the blank goes. Also used for
 *  free-text "translation" exercises (no blank marker — the whole sentence). */
export function ExerciseFillBlank({ exercise, onAnswered }: Props) {
  const [value, setValue] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);

  const parts = exercise.question.split('___');

  const submit = () => {
    if (revealed || !value.trim()) return;
    const correct = exerciseService.checkAnswer(exercise, value);
    setWasCorrect(correct);
    setRevealed(true);
    onAnswered(value, correct);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sentenceRow}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <Text style={styles.sentence}>{part}</Text>
            {i < parts.length - 1 && (
              <View style={styles.blankWrap}>
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  editable={!revealed}
                  style={[
                    styles.input,
                    revealed && (wasCorrect ? styles.inputCorrect : styles.inputIncorrect),
                  ]}
                  placeholder="type here"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  accessibilityLabel="Fill in the blank"
                />
              </View>
            )}
          </React.Fragment>
        ))}
      </View>

      {revealed && !wasCorrect && <Text style={styles.correction}>Correct answer: {exercise.answer}</Text>}
      {revealed && exercise.explanation && <Text style={styles.explanation}>{exercise.explanation}</Text>}

      {!revealed && <Button label="Check" onPress={submit} disabled={!value.trim()} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  sentenceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  sentence: { ...typography.h3, fontWeight: '500' },
  blankWrap: { minWidth: 100 },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    color: colors.textPrimary,
    fontSize: 18,
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
    minWidth: 100,
  },
  inputCorrect: { borderBottomColor: colors.success, color: colors.success },
  inputIncorrect: { borderBottomColor: colors.danger, color: colors.danger },
  correction: { ...typography.bodyMuted, color: colors.danger },
  explanation: { ...typography.bodyMuted },
});
