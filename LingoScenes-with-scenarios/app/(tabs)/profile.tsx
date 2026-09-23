import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LEARNING_LANGUAGES } from '@/constants/languages';

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const reset = useAuthStore((s) => s.reset);

  const language = LEARNING_LANGUAGES.find((l) => l.code === profile?.learning_language);

  const handleLogout = async () => {
    await authService.signOut();
    reset();
    // route guard sends signed-out users to the public landing page
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{(profile?.display_name || profile?.email || '?')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{profile?.display_name || 'Learner'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <Card>
        <Row label="Learning" value={`${language?.flag ?? ''} ${language?.label ?? '—'}`} />
        <Row label="Level" value={profile?.level ?? '—'} />
        <Row label="Daily goal" value={`${profile?.daily_goal_minutes ?? 10} min`} />
        <Row label="Streak" value={`${profile?.streak_count ?? 0} days 🔥`} />
      </Card>

      <Button label="⚙️ Settings" variant="secondary" onPress={() => router.push('/settings')} />
      <Button label="Log out" variant="danger" onPress={handleLogout} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarInitial: { fontSize: 28, fontWeight: '800', color: colors.bg },
  name: { ...typography.h2 },
  email: { ...typography.bodyMuted },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { ...typography.bodyMuted },
  rowValue: { ...typography.body, fontWeight: '600', textTransform: 'capitalize' },
});
