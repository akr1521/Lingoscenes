import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '@/theme';
import type { VocabularyLessonSummary } from '@/services/vocabularyService';

interface VocabularyLessonCardProps {
  lesson: VocabularyLessonSummary;
  onPress: () => void;
}

export function VocabularyLessonCard({ lesson, onPress }: VocabularyLessonCardProps) {
  const isAvailable = lesson.word_count > 0;
  const status = lesson.completed ? 'Completed' : isAvailable ? `${lesson.word_count} words` : 'Coming soon';

  return (
    <Pressable
      onPress={onPress}
      disabled={!isAvailable}
      accessibilityRole="button"
      accessibilityLabel={`Lesson ${lesson.order_index}: ${lesson.title}, ${status}`}
      accessibilityState={{ disabled: !isAvailable }}
      style={({ pressed }) => [styles.card, !isAvailable && styles.unavailable, pressed && isAvailable && styles.pressed]}
    >
      <View style={styles.lessonNumber}>
        <Text style={styles.lessonNumberText}>{lesson.order_index}</Text>
      </View>
      <Text style={styles.icon}>{lesson.icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{lesson.description}</Text>
        <Text style={[styles.status, lesson.completed && styles.completed]}>
          {lesson.completed ? '✓ ' : ''}{status}
        </Text>
      </View>
      <Text style={styles.chevron}>{lesson.completed ? '✓' : isAvailable ? '›' : '•'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    ...shadow.sm,
  },
  unavailable: { opacity: 0.55 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  lessonNumber: {
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  lessonNumberText: { ...typography.caption, color: colors.primary, fontWeight: '800' },
  icon: { fontSize: 28 },
  content: { flex: 1, gap: 2 },
  title: { ...typography.h3 },
  description: { ...typography.caption, lineHeight: 17 },
  status: { ...typography.caption, color: colors.primary, fontWeight: '700', marginTop: 2 },
  completed: { color: colors.success },
  chevron: { color: colors.primary, fontSize: 28, fontWeight: '400' },
});
