import React, { ReactNode } from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { spacing, borderRadius, colors, typography } from '../../theme/tokens';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  default: { bg: colors.neutral[700], text: colors.text.primary },
  success: { bg: colors.badge.success, text: colors.badge.successText },
  warning: { bg: colors.badge.warning, text: colors.badge.warningText },
  error: { bg: colors.badge.error, text: colors.badge.errorText },
  info: { bg: colors.badge.info, text: colors.badge.infoText },
  outline: { bg: 'transparent', text: colors.text.secondary, border: colors.neutral[600] },
};

const sizeStyles: Record<BadgeSize, { px: number; py: number; fontSize: number; borderRadius: number; gap: number }> = {
  sm: { px: spacing[2], py: spacing[0.5], fontSize: typography.fontSize.xs, borderRadius: borderRadius.full, gap: spacing[1] },
  md: { px: spacing[2], py: spacing[1], fontSize: typography.fontSize.xs, borderRadius: borderRadius.full, gap: spacing[1] },
  lg: { px: spacing[3], py: spacing[1.5], fontSize: typography.fontSize.sm, borderRadius: borderRadius.full, gap: spacing[2] },
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot,
  dotColor,
  style,
}: BadgeProps) {
  const { bg, text, border } = variantStyles[variant];
  const { px, py, fontSize, borderRadius: radius, gap } = sizeStyles[size];

  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center' },
        { paddingHorizontal: px, paddingVertical: py },
        { borderRadius: radius },
        { backgroundColor: bg },
        { borderWidth: border ? 1 : 0, borderColor: border },
        { gap },
        style,
      ]}
    >
      {dot && (
        <View
          style={{
            width: size === 'sm' ? 5 : size === 'md' ? 6 : 8,
            height: size === 'sm' ? 5 : size === 'md' ? 6 : 8,
            borderRadius: borderRadius.full,
            backgroundColor: dotColor ?? text,
          }}
        />
      )}
      <Text
        style={{
          fontSize,
          fontWeight: typography.fontWeight.semibold,
          letterSpacing: typography.letterSpacing.widest,
          textTransform: 'uppercase',
          color: text,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

export type StatusType = 'ok' | 'warning' | 'critical' | 'unknown' | 'pending' | 'synced' | 'error' | 'online' | 'offline';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
}

const statusConfig: Record<StatusType, { variant: BadgeVariant; icon: string; label: string }> = {
  ok: { variant: 'success', icon: '🟢', label: 'OK' },
  warning: { variant: 'warning', icon: '🟡', label: 'ATENÇÃO' },
  critical: { variant: 'error', icon: '🔴', label: 'CRÍTICO' },
  unknown: { variant: 'default', icon: '⚪', label: 'DESCONHECIDO' },
  pending: { variant: 'warning', icon: '⏳', label: 'PENDENTE' },
  synced: { variant: 'success', icon: '✅', label: 'SINCRONIZADO' },
  error: { variant: 'error', icon: '❌', label: 'ERRO' },
  online: { variant: 'success', icon: '🟢', label: 'ONLINE' },
  offline: { variant: 'error', icon: '🔴', label: 'OFFLINE' },
};

export function StatusBadge({ status, label, showIcon = true, size = 'md', style }: StatusBadgeProps) {
  const { variant, icon, label: defaultLabel } = statusConfig[status];
  const displayLabel = label ?? defaultLabel;

  return (
    <Badge variant={variant} size={size} style={style}>
      {showIcon && <Text style={{ fontSize: size === 'sm' ? 10 : size === 'md' ? 11 : 12 }}>{icon}</Text>}
      <Text style={{ fontWeight: typography.fontWeight.bold }}>{displayLabel}</Text>
    </Badge>
  );
}

export type PhaseType = 'PRE_BERCARIO' | 'BERCARIO' | 'ENGORDA' | string;

interface PhaseBadgeProps {
  phase: PhaseType;
  label?: string;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
}

const phaseConfig: Record<string, { variant: BadgeVariant; icon: string; label: string; color: string }> = {
  PRE_BERCARIO: { variant: 'info', icon: '🥚', label: 'Pré-berçário', color: '#6366f1' },
  BERCARIO: { variant: 'success', icon: '🐟', label: 'Berçário', color: '#0f766e' },
  ENGORDA: { variant: 'default', icon: '🐠', label: 'Engorda', color: '#0ea5e9' },
};

export function PhaseBadge({ phase, label, size = 'md', style }: PhaseBadgeProps) {
  const config = phaseConfig[phase] ?? { variant: 'default' as BadgeVariant, icon: '❓', label: phase, color: colors.text.muted };
  const displayLabel = label ?? config.label;

  return (
    <Badge variant={config.variant} size={size} style={style} dot dotColor={config.color}>
      {config.icon}
      <Text style={{ fontWeight: typography.fontWeight.bold }}>{displayLabel}</Text>
    </Badge>
  );
}