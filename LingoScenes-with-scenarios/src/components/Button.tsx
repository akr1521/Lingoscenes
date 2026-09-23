import React, { forwardRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '@/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Button = forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(
  (
    {
      label,
      onPress,
      variant = 'primary',
      loading,
      disabled,
      style,
      testID,
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const handlePress = () => {
      if (isDisabled) return;

      Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Light
      ).catch(() => {});

      onPress();
    };

    return (
      <Pressable
        ref={ref}
        testID={testID}
        onPress={handlePress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
        style={({ pressed }) => [
          styles.base,
          variantStyles[variant],
          isDisabled && styles.disabled,
          isDisabled && variant === 'primary' && styles.disabledPrimary,
          pressed && !isDisabled && styles.pressed,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={
              variant === 'primary'
                ? colors.textInverse
                : colors.primary
            }
            size="small"
          />
        ) : (
          <Text
            style={[
              styles.label,
              variant === 'primary' && styles.labelPrimary,
              variant === 'secondary' && styles.labelSecondary,
              variant === 'ghost' && styles.labelGhost,
              variant === 'danger' && styles.labelDanger,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },

  label: {
    ...typography.button,
  },

  labelPrimary: {
    color: colors.textInverse,
    fontWeight: '600',
  },

  labelSecondary: {
    color: colors.primary,
    fontWeight: '600',
  },

  labelGhost: {
    color: colors.primary,
    fontWeight: '500',
  },

  labelDanger: {
    color: colors.textInverse,
    fontWeight: '600',
  },

  disabled: {
    opacity: 0.5,
  },

  disabledPrimary: {
    opacity: 1,
    backgroundColor: colors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

const variantStyles: Record<
  NonNullable<ButtonProps['variant']>,
  ViewStyle
> = {
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  secondary: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  danger: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
};
