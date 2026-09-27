import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradient, radius, spacing, typography } from '@/theme';
import { LEARNING_LANGUAGES } from '@/constants/languages';
import { FlagMark } from '@/components/FlagMark';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

const COOKIE_KEY = 'lingoscenes_cookie_pref';
const FEATURED = LEARNING_LANGUAGES.filter((l) => ['de', 'es', 'fr'].includes(l.code));

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const setOnboardingField = useAppStore((s) => s.setOnboardingField);
  const compact = width < 640;
  const [cookieVisible, setCookieVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(COOKIE_KEY).then((value) => {
      if (!value) setCookieVisible(true);
    });
  }, []);

  const chooseLanguage = (code: string) => {
    setOnboardingField('learningLanguage', code);
    router.push('/(auth)/register');
  };

  const saveCookie = async (pref: 'all' | 'essential' | 'custom') => {
    await AsyncStorage.setItem(COOKIE_KEY, pref);
    setCookieVisible(false);
  };

  return (
    <LinearGradient colors={[...gradient.landing]} locations={[...gradient.landingLocations]} style={styles.root}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>LingoScenes</Text>
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={({ pressed }) => [styles.signIn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text style={styles.signInLabel}>SIGN IN</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.hero} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Start Speaking A New Language</Text>
        <Text style={styles.subhead}>Learn the fun and effective way.</Text>

        <View style={[styles.langRow, compact && styles.langRowCompact]}>
          {FEATURED.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() => chooseLanguage(lang.code)}
              accessibilityRole="link"
              accessibilityLabel={lang.label}
              style={({ pressed }) => [styles.langCard, compact && styles.langCardCompact, pressed && { opacity: 0.85 }]}
            >
              <FlagMark code={lang.code} size={88} />
              <Text style={styles.langLabel}>{lang.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.moreRow}>
          {LEARNING_LANGUAGES.filter((l) => !['de', 'es', 'fr'].includes(l.code)).map((lang) => (
            <Pressable key={lang.code} onPress={() => chooseLanguage(lang.code)} style={styles.moreChip}>
              <FlagMark code={lang.code} size={22} />
              <Text style={styles.moreChipText}>{lang.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.pitch}>
          <Text style={styles.pitchTitle}>Every sentence is a scene</Text>
          <Text style={styles.pitchBody}>
            Practice real conversations with video scenes, tap any word for grammar, and train pronunciation by
            speaking along with native audio.
          </Text>
        </View>
      </ScrollView>

      {cookieVisible ? (
        <View style={styles.cookieBar}>
          <Text style={styles.cookieText}>
            This website uses cookies to improve your user experience. View our Privacy Policy.
          </Text>
          <View style={styles.cookieActions}>
            <Pressable style={styles.cookieWhite} onPress={() => saveCookie('all')}>
              <Text style={styles.cookieWhiteLabel}>Accept All</Text>
            </Pressable>
            <Pressable style={styles.cookieWhite} onPress={() => saveCookie('essential')}>
              <Text style={styles.cookieWhiteLabel}>Reject Optional</Text>
            </Pressable>
            <Pressable style={styles.cookieTeal} onPress={() => saveCookie('custom')}>
              <Text style={styles.cookieTealLabel}>Customize</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  brand: { color: colors.textInverse, fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
  signIn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  signInLabel: { color: colors.primary, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  hero: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 140,
    gap: spacing.md,
  },
  headline: {
    ...typography.hero,
    fontSize: 36,
    maxWidth: 560,
  },
  subhead: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  langRowCompact: { gap: spacing.md },
  langCard: {
    width: 140,
    height: 200,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  langCardCompact: { width: 108, height: 160 },
  flagCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flag: { fontSize: 48 },
  langLabel: { color: colors.textInverse, fontSize: 18, fontWeight: '600' },
  moreRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  moreChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moreChipText: { color: colors.textInverse, fontWeight: '600' },
  pitch: { maxWidth: 520, marginTop: spacing.xl },
  pitchTitle: { color: colors.textInverse, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  pitchBody: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 22, fontSize: 15 },
  cookieBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#243044',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cookieText: { color: colors.textInverse, flex: 1, minWidth: 220, fontSize: 13, lineHeight: 18 },
  cookieLink: { textDecorationLine: 'underline', fontWeight: '600' },
  cookieActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cookieWhite: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  cookieWhiteLabel: { color: '#00B4C8', fontWeight: '700' },
  cookieTeal: {
    backgroundColor: '#00B4C8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  cookieTealLabel: { color: colors.textInverse, fontWeight: '700' },
});
