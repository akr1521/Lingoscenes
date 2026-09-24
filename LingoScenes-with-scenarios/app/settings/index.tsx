import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { authService } from '@/services/authService';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

const SPEED_OPTIONS = [0.75, 1.0, 1.25];

export default function SettingsScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const reset = useAuthStore((s) => s.reset);
  const { playbackSpeed, setPlaybackSpeed, translationsVisible, toggleTranslations } = useAppStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const updateDailyGoal = async (minutes: number) => {
    if (!profile) return;
    await authService.updateProfile(profile.id, { daily_goal_minutes: minutes });
    setProfile({ ...profile, daily_goal_minutes: minutes });
  };

  const handleLogout = async () => {
    setLoading(true);
    await authService.signOut();
    reset();
    setLoading(false);
    // route guard sends signed-out users to the public landing page
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <Card>
        <Text style={typography.h3}>Notifications</Text>
        <View style={styles.switchRow}>
          <Text style={typography.body}>Daily reminder</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      <Card>
        <Text style={typography.h3}>Audio & playback</Text>
        <Text style={[typography.bodyMuted, { marginTop: spacing.xs }]}>Default playback speed</Text>
        <View style={styles.chipRow}>
          {SPEED_OPTIONS.map((speed) => (
            <Pressable
              key={speed}
              onPress={() => setPlaybackSpeed(speed)}
              style={[styles.chip, playbackSpeed === speed && styles.chipActive]}
            >
              <Text style={[styles.chipText, playbackSpeed === speed && styles.chipTextActive]}>{speed}x</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={typography.body}>Show translations by default</Text>
          <Switch value={translationsVisible} onValueChange={toggleTranslations} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      <Card>
        <Text style={typography.h3}>Daily goal</Text>
        <View style={styles.chipRow}>
          {[5, 10, 20, 30].map((minutes) => (
            <Pressable
              key={minutes}
              onPress={() => updateDailyGoal(minutes)}
              style={[styles.chip, profile?.daily_goal_minutes === minutes && styles.chipActive]}
            >
              <Text style={[styles.chipText, profile?.daily_goal_minutes === minutes && styles.chipTextActive]}>
                {minutes} min
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Button label="Log out" variant="danger" onPress={handleLogout} loading={loading} />
      <Button label="Close" variant="secondary" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { ...typography.h1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  chipRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption },
  chipTextActive: { color: colors.bg, fontWeight: '700' },
});
