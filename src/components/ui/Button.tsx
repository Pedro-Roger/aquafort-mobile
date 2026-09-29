import React, { ReactNode } from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text, StyleProp, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { spacing, borderRadius, typography, colors } from '../../theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary[400], text: colors.text.onPrimary },
  secondary: { bg: colors.neutral[700], text: colors.text.primary, border: colors.neutral[600] },
  outline: { bg: 'transparent', text: colors.primary[400], border: colors.primary[400] },
  ghost: { bg: 'transparent', text: colors.primary[400] },
  danger: { bg: colors.error.light, text: colors.text.onError },
  success: { bg: colors.success.light, text: colors.text.onSuccess },
};

const sizeStyles: Record<ButtonSize, { px: number; py: number; fontSize: number; borderRadius: number; gap: number }> = {
  sm: { px: spacing[3], py: spacing[1], fontSize: typography.fontSize.sm, borderRadius: borderRadius.md, gap: spacing[1] },
  md: { px: spacing[4], py: spacing[2], fontSize: typography.fontSize.base, borderRadius: borderRadius.lg, gap: spacing[2] },
  lg: { px: spacing[5], py: spacing[3], fontSize: typography.fontSize.lg, borderRadius: borderRadius.lg, gap: spacing[2] },
  xl: { px: spacing[6], py: spacing[4], fontSize: typography.fontSize.xl, borderRadius: borderRadius.xl, gap: spacing[3] },
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  children,
  onPress,
  accessibilityLabel,
  ...props
}: ButtonProps) {
  const { bg, text: textColor, border } = variantStyles[variant];
  const { px, py, fontSize, borderRadius: radius, gap } = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        { paddingHorizontal: px, paddingVertical: py },
        { borderRadius: radius },
        { backgroundColor: isDisabled ? colors.neutral[600] : bg },
        { borderWidth: border ? 1 : 0, borderColor: border },
        { width: fullWidth ? '100%' : undefined },
        { opacity: isDisabled ? 0.6 : 1 },
        style,
      ]}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {leftIcon && <View style={{ marginRight: gap }}>{leftIcon}</View>}
          <Text
            style={[
              { fontSize, fontWeight: typography.fontWeight.semibold, color: textColor },
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon && <View style={{ marginLeft: gap }}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}

interface IconButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

const iconButtonSizes = {
  sm: { size: 32, iconSize: 18, radius: borderRadius.full },
  md: { size: 40, iconSize: 22, radius: borderRadius.full },
  lg: { size: 48, iconSize: 26, radius: borderRadius.full },
};

const iconButtonVariants = {
  primary: { bg: colors.primary[400], iconColor: colors.text.onPrimary },
  secondary: { bg: colors.neutral[700], iconColor: colors.text.primary },
  ghost: { bg: 'transparent', iconColor: colors.text.primary },
  danger: { bg: colors.error.light, iconColor: colors.text.onError },
};

export function IconButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  accessibilityLabel,
  style,
  onPress,
  ...props
}: IconButtonProps) {
  const { size: btnSize, iconSize, radius } = iconButtonSizes[size];
  const { bg, iconColor } = iconButtonVariants[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        { width: btnSize, height: btnSize },
        { borderRadius: radius },
        { backgroundColor: isDisabled ? colors.neutral[600] : bg },
        { alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <View style={{ width: iconSize, height: iconSize }}>{children}</View>
      )}
    </TouchableOpacity>
  );
}