import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { AlphabetExplorer } from '@/components/AlphabetExplorer';
import { Button } from '@/components/Button';
import { foundationsService } from '@/services/foundationsService';

export default function FoundationsAlphabetScreen() {
  const profile = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();
  const language = profile?.learning_language ?? 'de';

  const markComplete = async () => {
    if (!profile?.id) return;
    await foundationsService.completeAlphabet(profile.id, language);
    queryClient.invalidateQueries({ queryKey: ['foundations-progress', profile.id, language] });
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: 'Alphabet & pronunciation' }} />
      <View style={styles.content}>
        <AlphabetExplorer language={language} />
      </View>
      <View style={styles.footer}>
        <Button label="Mark as learned" onPress={markComplete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
