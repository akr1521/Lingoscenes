import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { SurvivalPhraseList } from '@/components/SurvivalPhraseList';
import { Button } from '@/components/Button';
import { foundationsService } from '@/services/foundationsService';

export default function FoundationsPhrasesScreen() {
  const profile = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();
  const language = profile?.learning_language ?? 'de';

  const markComplete = async () => {
    if (!profile?.id) return;
    await foundationsService.completePhrases(profile.id, language);
    queryClient.invalidateQueries({ queryKey: ['foundations-progress', profile.id, language] });
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: 'Survival phrases' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <SurvivalPhraseList language={language} />
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Mark as learned" onPress={markComplete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
