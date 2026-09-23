import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

const DEBOUNCE_MS = 350;

/**
 * FR-01 §12 Search Requirement. Debounces onSearch calls so we don't spam
 * the search RPC on every keystroke, and fires `onSearchStarted` once per
 * "session" of typing (for the `search_started` analytics event, §39).
 */
export function ScenarioSearch({
  value,
  onChangeText,
  onSearchStarted,
  placeholder = 'Search scenarios…',
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSearchStarted?: () => void;
  placeholder?: string;
}) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (text: string) => {
    setLocalValue(text);
    if (!startedRef.current && text.trim().length > 0) {
      startedRef.current = true;
      onSearchStarted?.();
    }
    if (text.trim().length === 0) startedRef.current = false;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChangeText(text), DEBOUNCE_MS);
  };

  const handleClear = () => {
    setLocalValue('');
    startedRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        value={localValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        accessibilityLabel="Search scenarios"
        returnKeyType="search"
        autoCorrect={false}
      />
      {localValue.length > 0 && (
        <Pressable onPress={handleClear} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8}>
          <Text style={styles.clear}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
  },
  icon: { fontSize: 15 },
  input: { flex: 1, ...typography.body, padding: 0 },
  clear: { color: colors.textMuted, fontSize: 15, fontWeight: '700' },
});
