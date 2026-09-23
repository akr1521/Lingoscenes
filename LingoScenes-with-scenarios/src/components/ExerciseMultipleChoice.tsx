import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '@/theme';
import type { Exercise } from '@/types/database';

interface Props {
  exercise: Exercise;
  onAnswered: (answer: string, correct: boolean) => void;
}

/** Handles multiple_choice, listening (select-what-you-heard), and vocabulary
 *  (word -> meaning) exercise types, which all share this UI shape. */
export function ExerciseMultipleChoice({ exercise, onAnswered }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const options = exercise.options ?? [];

  const handleSelect = (option: string) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    const correct = option.trim().toLowerCase() === exercise.answer.trim().toLowerCase();
    onAnswered(option, correct);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{exercise.question}</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const isSelected = selected === option;
          const isCorrectOption = revealed && option.trim().toLowerCase() === exercise.answer.trim().toLowerCase();
          const isWrongSelection = revealed && isSelected && !isCorrectOption;
          return (
            <OptionButton
              key={option}
              label={option}
              onPress={() => handleSelect(option)}
              state={isCorrectOption ? 'correct' : isWrongSelection ? 'incorrect' : 'default'}
              disabled={revealed}
            />
          );
        })}
      </View>
    </View>
  );
}

function OptionButton({
  label,
  onPress,
  state,
  disabled,
}: {
  label: string;
  onPress: () => void;
  state: 'default' | 'correct' | 'incorrect';
  disabled: boolean;
}) {
  const shakeStyle = useAnimatedStyle(() => {
    if (state !== 'incorrect') return { transform: [{ translateX: 0 }] };
    return {
      transform: [
        {
          translateX: withSequence(
            withTiming(-6, { duration: 40 }),
            withTiming(6, { duration: 40 }),
            withTiming(-4, { duration: 40 }),
            withTiming(0, { duration: 40 })
          ),
        },
      ],
    };
  }, [state]);

  return (
    <Animated.View style={shakeStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.option,
          state === 'correct' && styles.optionCorrect,
          state === 'incorrect' && styles.optionIncorrect,
        ]}
      >
        <Text style={styles.optionText}>{label}</Text>
        {state === 'correct' && <Text style={styles.icon}>✓</Text>}
        {state === 'incorrect' && <Text style={styles.icon}>✕</Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  question: { ...typography.h3 },
  options: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 52,
  },
  optionCorrect: { borderColor: colors.success, backgroundColor: colors.success + '20' },
  optionIncorrect: { borderColor: colors.danger, backgroundColor: colors.danger + '20' },
  optionText: { ...typography.body, flexShrink: 1 },
  icon: { ...typography.h3 },
});
