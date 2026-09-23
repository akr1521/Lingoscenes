import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '@/theme';
import { Button } from '@/components/Button';
import { AuthCard } from '@/components/AuthCard';
import { AuthField } from '@/components/AuthField';
import { authService } from '@/services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    const { error } = await authService.signIn(email.trim(), password);
    setLoading(false);
    if (error) setError(error);
  };

  return (
    <AuthCard title="Sign In to LingoScenes" greeting="Welcome back to LingoScenes!">
      <View style={styles.form}>
        <AuthField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
        />
        <AuthField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        {error ? (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <Button label="Sign In" onPress={handleLogin} loading={loading} disabled={!canSubmit} />

        <Link href="/(auth)/forgot-password" asChild>
          <Text style={styles.link}>Forgot password?</Text>
        </Link>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/(auth)/register" asChild>
          <Text style={styles.footerLink}> Sign up</Text>
        </Link>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dangerLight,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  error: { ...typography.caption, color: colors.danger, flex: 1 },
  link: { ...typography.bodyMuted, color: colors.primary, textAlign: 'center', marginTop: spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { ...typography.bodyMuted },
  footerLink: { color: colors.primary, fontWeight: '700' },
});
