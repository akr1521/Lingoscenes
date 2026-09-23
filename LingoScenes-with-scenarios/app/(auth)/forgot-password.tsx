import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { Button } from '@/components/Button';
import { AuthCard } from '@/components/AuthCard';
import { AuthField } from '@/components/AuthField';
import { authService } from '@/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Enter the email associated with your account.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await authService.resetPassword(email.trim());
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSent(true);
  };

  return (
    <AuthCard title="Reset your password" greeting="We'll get you back in.">
      {sent ? (
        <Text style={styles.subtitle}>If an account exists for {email}, a password reset link is on its way.</Text>
      ) : (
        <View style={styles.form}>
          <Text style={styles.subtitle}>We'll email you a link to reset it.</Text>
          <AuthField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Send reset link" onPress={handleSubmit} loading={loading} disabled={!email.trim()} />
        </View>
      )}
      <Button label="Back to Sign In" onPress={() => router.replace('/(auth)/login')} variant="ghost" style={{ marginTop: spacing.md }} />
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  subtitle: { ...typography.bodyMuted, marginBottom: spacing.md },
  error: { ...typography.caption, color: colors.danger },
});
