import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { foundationsService } from '@/services/foundationsService';
import { LoadingState } from '@/components/LoadingState';

export default function FoundationsHubScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const language = profile?.learning_language ?? 'de';

  const progressQuery = useQuery({
    queryKey: ['foundations-progress', profile?.id, language],
    queryFn: () => foundationsService.getProgress(profile!.id, language),
    enabled: !!profile?.id,
  });

  if (progressQuery.isLoading) return <LoadingState label="Loading foundations…" />;
  const progress = progressQuery.data;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: 'Foundations' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.intro}>
          Master the basics before diving into stories: the sounds/letters of your language and a set of
          phrases that will get you through your very first real conversation.
        </Text>

        <Pressable
          onPress={() => router.push('/foundations/alphabet')}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Alphabet and pronunciation"
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="text" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Alphabet & pronunciation</Text>
            <Text style={styles.cardSubtitle}>Learn the core letters and sounds of your language.</Text>
            {progress?.alphabet_completed_at && <Text style={styles.completed}>✓ Completed</Text>}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/foundations/phrases')}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Survival phrases"
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.successLight }]}>
            <Ionicons name="chatbubble-ellipses" size={22} color={colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Survival phrases</Text>
            <Text style={styles.cardSubtitle}>Greetings, essentials, emergencies, dining, and directions.</Text>
            {progress?.phrases_completed_at && <Text style={styles.completed}>✓ Completed</Text>}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, gap: spacing.md },
  intro: { ...typography.bodyMuted, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadow.sm,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { ...typography.h3 },
  cardSubtitle: { ...typography.caption, marginTop: 2 },
  completed: { ...typography.caption, color: colors.success, fontWeight: '700', marginTop: 4 },
});
