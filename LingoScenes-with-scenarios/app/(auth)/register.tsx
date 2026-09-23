import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '@/theme';
import { Button } from '@/components/Button';
import { AuthCard } from '@/components/AuthCard';
import { AuthField } from '@/components/AuthField';
import { authService } from '@/services/authService';
import { useAppStore } from '@/store/appStore';
import { LEARNING_LANGUAGES } from '@/constants/languages';

export default function RegisterScreen() {
  const learningLanguage = useAppStore((s) => s.onboardingDraft.learningLanguage);
  const languageLabel = LEARNING_LANGUAGES.find((l) => l.code === learningLanguage)?.label;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 8 && confirmPassword.length > 0 && !loading;

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error, needsEmailConfirmation } = await authService.signUp(email.trim(), password, {
      learningLanguage,
    });
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    if (needsEmailConfirmation) {
      setConfirmationSent(true);
    }
  };

  if (confirmationSent) {
    return (
      <AuthCard title="Check your inbox" greeting="You're almost in!">
        <Text style={styles.subtitle}>
          We sent a confirmation link to {email}. Confirm your email, then sign in to start learning
          {languageLabel ? ` ${languageLabel}` : ''}.
        </Text>
        <Link href="/(auth)/login" asChild>
          <Button label="Back to Sign In" onPress={() => {}} variant="secondary" style={{ marginTop: spacing.lg }} />
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      greeting={languageLabel ? `Let's learn ${languageLabel} together!` : 'Start speaking a new language!'}
    >
      <View style={styles.form}>
        <AuthField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
        />
        <AuthField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <AuthField label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        {error ? (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <Button label="Sign Up" onPress={handleRegister} loading={loading} disabled={!canSubmit} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href="/(auth)/login" asChild>
          <Text style={styles.footerLink}> Sign in</Text>
        </Link>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  subtitle: { ...typography.bodyMuted, marginBottom: spacing.md },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dangerLight,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  error: { ...typography.caption, color: colors.danger, flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { ...typography.bodyMuted },
  footerLink: { color: colors.primary, fontWeight: '700' },
});
