import React, { useState, useEffect } from 'react';
import { TextInput, TextInputProps, Text, StyleProp, ViewStyle, TextStyle, TouchableOpacity, View } from 'react-native';
import { spacing, borderRadius, typography, colors } from '../../theme/tokens';

export interface InputProps extends Omit<TextInputProps, 'style' | 'disabled'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  required?: boolean;
}

type VariantStyle = {
  container: { backgroundColor: string; borderColor: string; borderWidth: number };
  focused: { backgroundColor?: string; borderColor: string; borderWidth: number };
  error: { backgroundColor?: string; borderColor: string; borderWidth: number };
};

const variantStyles: Record<'default' | 'outlined' | 'filled', VariantStyle> = {
  default: {
    container: { backgroundColor: colors.neutral[800], borderColor: colors.neutral[700], borderWidth: 1 },
    focused: { backgroundColor: colors.neutral[800], borderColor: colors.primary[400], borderWidth: 2 },
    error: { backgroundColor: colors.neutral[800], borderColor: colors.error.light, borderWidth: 2 },
  },
  outlined: {
    container: { backgroundColor: 'transparent', borderColor: colors.neutral[700], borderWidth: 1 },
    focused: { backgroundColor: 'transparent', borderColor: colors.primary[400], borderWidth: 2 },
    error: { backgroundColor: 'transparent', borderColor: colors.error.light, borderWidth: 2 },
  },
  filled: {
    container: { backgroundColor: colors.neutral[700], borderColor: 'transparent', borderWidth: 0 },
    focused: { backgroundColor: colors.neutral[800], borderColor: colors.primary[400], borderWidth: 2 },
    error: { backgroundColor: colors.neutral[800], borderColor: colors.error.light, borderWidth: 2 },
  },
};

const sizeStyles = {
  sm: { px: spacing[3], py: spacing[1], fontSize: typography.fontSize.sm, borderRadius: borderRadius.md, gap: spacing[1] },
  md: { px: spacing[3], py: spacing[2], fontSize: typography.fontSize.base, borderRadius: borderRadius.md, gap: spacing[2] },
  lg: { px: spacing[4], py: spacing[3], fontSize: typography.fontSize.lg, borderRadius: borderRadius.lg, gap: spacing[2] },
};

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  style,
  inputStyle,
  labelStyle,
  containerStyle,
  disabled,
  required,
  placeholderTextColor = colors.text.muted,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  const containerBg = hasError ? v.error.backgroundColor : focused ? v.focused.backgroundColor : v.container.backgroundColor;
  const containerBorderColor = hasError ? v.error.borderColor : focused ? v.focused.borderColor : v.container.borderColor;
  const containerBorderWidth = hasError ? v.error.borderWidth : focused ? v.focused.borderWidth : v.container.borderWidth;

  return (
    <View style={[{ flexDirection: 'column', gap: s.gap }, containerStyle]}>
      {label && (
        <Text
          style={[
            { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, letterSpacing: typography.letterSpacing.widest, textTransform: 'uppercase' },
            { color: hasError ? colors.error.light : colors.text.secondary, marginBottom: -s.gap, marginLeft: s.px },
            labelStyle,
          ]}
        >
          {label} {required && <Text style={{ color: colors.error.light }}>*</Text>}
        </Text>
      )}

      <View
        style={[
          { flexDirection: 'row', alignItems: 'center' },
          { backgroundColor: containerBg },
          { borderWidth: containerBorderWidth, borderColor: containerBorderColor },
          { borderRadius: s.borderRadius },
          { paddingHorizontal: s.px },
          { minHeight: s.py * 2 + s.fontSize * 1.5 },
          style,
        ]}
      >
        {leftIcon && (
          <View style={{ marginRight: s.gap, width: s.fontSize * 1.2, height: s.fontSize * 1.2 }}>
            {leftIcon}
          </View>
        )}

        <TextInput
          {...props}
          editable={!disabled}
          placeholderTextColor={placeholderTextColor}
          onFocus={() => { setFocused(true); props.onFocus?.(props as any); }}
          onBlur={() => { setFocused(false); props.onBlur?.(props as any); }}
          style={[
            { flex: 1, fontSize: s.fontSize, color: colors.text.primary, paddingVertical: 0 },
            inputStyle,
          ]}
        />

        {rightIcon && (
          <View style={{ marginLeft: s.gap, width: s.fontSize * 1.2, height: s.fontSize * 1.2 }}>
            {rightIcon}
          </View>
        )}
      </View>

      {(error || helperText) && (
        <Text
          style={[
            { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.normal, letterSpacing: typography.letterSpacing.normal },
            { color: hasError ? colors.error.light : colors.text.muted, marginLeft: s.px },
            hasError && { fontWeight: typography.fontWeight.medium },
          ]}
        >
          {error ?? helperText}
        </Text>
      )}
    </View>
  );
}

export interface NumericInputProps {
  value: number | string | undefined;
  onChange: (value: number | string | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  decimals?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
}

export function NumericInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  decimals = 0,
  size = 'md',
  variant = 'default',
  style,
  inputStyle,
  disabled,
  label,
  error,
  helperText,
}: NumericInputProps) {
  const [localValue, setLocalValue] = useState<string>(value?.toString() ?? '');
  const s = sizeStyles[size];

  useEffect(() => {
    if (value !== undefined && value.toString() !== localValue) {
      setLocalValue(value.toString());
    }
  }, [value]);

  const handleChange = (text: string) => {
    setLocalValue(text);
    const num = text === '' ? undefined : parseFloat(text);
    onChange(num);
  };

  const increment = () => {
    const current = parseFloat(localValue) || 0;
    const next = current + step;
    if (max !== undefined && next > max) return;
    const formatted = decimals > 0 ? next.toFixed(decimals) : next.toString();
    setLocalValue(formatted);
    onChange(next);
  };

  const decrement = () => {
    const current = parseFloat(localValue) || 0;
    const next = current - step;
    if (min !== undefined && next < min) return;
    const formatted = decimals > 0 ? next.toFixed(decimals) : next.toString();
    setLocalValue(formatted);
    onChange(next);
  };

  const canIncrement = max === undefined || (parseFloat(localValue) || 0) + step <= max;
  const canDecrement = min === undefined || (parseFloat(localValue) || 0) - step >= min;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {label && (
        <Text
          style={[
            { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, letterSpacing: typography.letterSpacing.widest, textTransform: 'uppercase' },
            { color: error ? colors.error.light : colors.text.secondary, marginBottom: s.gap },
          ]}
        >
          {label} {error && <Text style={{ color: colors.error.light }}>*</Text>}
        </Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <TouchableOpacity
          onPress={decrement}
          disabled={!canDecrement || disabled}
          style={{
            width: s.fontSize * 2,
            height: s.fontSize * 2,
            borderRadius: borderRadius.full,
            backgroundColor: disabled || !canDecrement ? colors.neutral[700] : colors.neutral[800],
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.neutral[700],
          }}
          accessibilityLabel="Decrementar"
        >
          <Text style={{ fontSize: s.fontSize + 4, fontWeight: 'bold', color: disabled || !canDecrement ? colors.text.muted : colors.text.primary }}>−</Text>
        </TouchableOpacity>

        <TextInput
          editable={!disabled}
          value={localValue}
          onChangeText={handleChange}
          keyboardType={decimals > 0 ? 'decimal-pad' : 'numeric'}
          placeholderTextColor={colors.text.muted}
          style={[
            { flex: 1, fontSize: s.fontSize, color: colors.text.primary, textAlign: 'center', paddingVertical: s.py, paddingHorizontal: 0, backgroundColor: 'transparent' },
            inputStyle,
          ]}
        />

        <TouchableOpacity
          onPress={increment}
          disabled={!canIncrement || disabled}
          style={{
            width: s.fontSize * 2,
            height: s.fontSize * 2,
            borderRadius: borderRadius.full,
            backgroundColor: disabled || !canIncrement ? colors.neutral[700] : colors.neutral[800],
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.neutral[700],
          }}
          accessibilityLabel="Incrementar"
        >
          <Text style={{ fontSize: s.fontSize + 4, fontWeight: 'bold', color: disabled || !canIncrement ? colors.text.muted : colors.text.primary }}>+</Text>
        </TouchableOpacity>
      </View>

      {unit && (
        <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.muted, marginLeft: spacing[2] }}>
          {unit}
        </Text>
      )}

      {(error || helperText) && (
        <Text
          style={[
            { fontSize: typography.fontSize.xs },
            { color: error ? colors.error.light : colors.text.muted, marginTop: s.gap },
            error && { fontWeight: typography.fontWeight.medium },
          ]}
        >
          {error ?? helperText}
        </Text>
      )}
    </View>
  );
}