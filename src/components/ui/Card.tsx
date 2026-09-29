import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle, StyleProp, AccessibilityRole } from 'react-native';
import { spacing, borderRadius, colors, typography } from '../../theme/tokens';

export interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: keyof typeof spacing | number;
  interactive?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const variantStyles = {
  default: { backgroundColor: colors.neutral[800] },
  outlined: { backgroundColor: colors.neutral[800], borderWidth: 1, borderColor: colors.neutral[700] },
  elevated: { backgroundColor: colors.neutral[800], shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
};

export function Card({
  variant = 'default',
  padding = 4,
  interactive = false,
  onPress,
  accessibilityLabel,
  style,
  children,
}: CardProps) {
  const vs = variantStyles[variant];
  const p = typeof padding === 'number' ? padding : spacing[padding];

  const Component = interactive ? TouchableOpacity : View;
  const pressProps = interactive
    ? { onPress, accessibilityLabel, accessibilityRole: 'button' as AccessibilityRole, accessibilityState: { disabled: !onPress } }
    : {};

  return (
    <Component
      style={[
        { borderRadius: borderRadius.lg, padding: p },
        vs,
        style,
      ]}
      {...pressProps}
    >
      {children}
    </Component>
  );
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CardHeader({ title, subtitle, action, style }: CardHeaderProps) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] }, style]}>
      <View style={{ flexDirection: 'column', gap: spacing[1] }}>
        <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.muted }}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

export interface CardContentProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={style}>{children}</View>;
}

export interface CardFooterProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing[2], marginTop: spacing[4], paddingTop: spacing[3] },
        { borderTopWidth: 1, borderTopColor: colors.neutral[700] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface InfoCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function InfoCard({ icon, title, value, subtitle, trend, trendValue, iconColor = colors.primary[400], style }: InfoCardProps) {
  return (
    <Card variant="default" padding={4} style={style}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'column', gap: spacing[1] }}>
          <View
            style={[
              { width: 40, height: 40, borderRadius: borderRadius.full },
              { backgroundColor: colors.badge.info, alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <View style={{ width: 24, height: 24 }}>{icon}</View>
          </View>
          <Text style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, letterSpacing: typography.letterSpacing.widest, textTransform: 'uppercase', color: colors.text.secondary }}>{title}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.heavy, color: colors.text.primary }}>{value}</Text>
          {subtitle && <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.muted }}>{subtitle}</Text>}
          {(trend && trendValue) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginTop: spacing[1] }}>
              <Text
                style={[
                  { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, letterSpacing: typography.letterSpacing.widest, textTransform: 'uppercase' },
                  {
                    color: trend === 'up' ? colors.success.light : trend === 'down' ? colors.error.light : colors.text.muted,
                  },
                ]}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}