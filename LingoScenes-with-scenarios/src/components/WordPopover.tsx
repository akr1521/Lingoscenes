import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { colors, radius, spacing, typography } from '@/theme';
import { Button } from './Button';
import { vocabularyService } from '@/services/vocabularyService';
import type { Vocabulary } from '@/types/database';

interface WordPopoverProps {
  visible: boolean;
  word: string | null;
  language: string;
  userId: string;
  onClose: () => void;
}

/**
 * Tapping a word in the transcript opens this panel with translation,
 * part of speech, pronunciation, an audio button, and a save-to-vocabulary action.
 */
export function WordPopover({ visible, word, language, userId, onClose }: WordPopoverProps) {
  const [entry, setEntry] = useState<Vocabulary | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!visible || !word) return;
    setLoading(true);
    setSaved(false);
    vocabularyService
      .lookupVocabularyForWord(word, language)
      .then(setEntry)
      .finally(() => setLoading(false));
  }, [visible, word, language]);

  const playPronunciation = async () => {
    if (!entry?.audio_url) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: entry.audio_url }, { shouldPlay: true });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (err) {
      console.warn('[WordPopover] pronunciation playback failed', err);
    }
  };

  const handleSave = async () => {
    if (!entry) return;
    await vocabularyService.saveWord(userId, entry.id);
    setSaved(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close word details">
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : entry ? (
            <>
              <Text style={styles.word}>{entry.word}</Text>
              {entry.part_of_speech && <Text style={styles.pos}>{entry.part_of_speech}</Text>}
              <Text style={styles.translation}>{entry.translation}</Text>
              {entry.pronunciation && <Text style={styles.pronunciation}>/{entry.pronunciation}/</Text>}
              {entry.example_sentence && <Text style={styles.example}>“{entry.example_sentence}”</Text>}

              <View style={styles.actionsRow}>
                {entry.audio_url && (
                  <Button label="🔊 Play" onPress={playPronunciation} variant="secondary" style={{ flex: 1 }} />
                )}
                <Button
                  label={saved ? '✓ Saved' : 'Save word'}
                  onPress={handleSave}
                  disabled={saved}
                  style={{ flex: 1 }}
                />
              </View>
            </>
          ) : (
            <Text style={styles.notFound}>No definition found for “{word}” yet.</Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  panel: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    minHeight: 200,
  },
  word: { ...typography.h2 },
  pos: { ...typography.caption, textTransform: 'uppercase' },
  translation: { ...typography.body, color: colors.primary, fontWeight: '600' },
  pronunciation: { ...typography.bodyMuted },
  example: { ...typography.bodyMuted, fontStyle: 'italic', marginTop: spacing.xs },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  notFound: { ...typography.bodyMuted, textAlign: 'center', padding: spacing.lg },
});
