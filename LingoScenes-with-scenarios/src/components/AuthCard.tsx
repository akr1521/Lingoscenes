import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '@/theme';
import { NightSky } from '@/components/NightSky';

export function AuthCard({
  title,
  greeting,
  children,
}: {
  title: string;
  greeting: string;
  children: React.ReactNode;
}) {
  return (
    <NightSky>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.welcomeRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarFace}>🙂</Text>
              </View>
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{greeting}</Text>
              </View>
            </View>
            <Text style={styles.title}>{title}</Text>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </NightSky>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    ...shadow.card,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFace: { fontSize: 32 },
  bubble: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
  },
  bubbleText: { ...typography.body, fontWeight: '600' },
  title: { ...typography.h1, marginBottom: spacing.lg },
});
