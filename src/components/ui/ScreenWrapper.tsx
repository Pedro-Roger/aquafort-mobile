import React, { View, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, RefreshControl, ViewStyle, StyleProp, Text as RNText } from 'react-native';
import { ReactNode, ReactElement } from 'react';
import { spacing, colors } from '../../theme/tokens';

export interface ScreenWrapperProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  scrollEnabled?: boolean;
  showsVerticalScrollIndicator?: boolean;
  refreshControl?: ReactElement<typeof RefreshControl>;
  keyboardAvoiding?: boolean;
  keyboardBehavior?: 'padding' | 'height' | 'position';
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

export function ScreenWrapper({
  children,
  style,
  scrollable = true,
  scrollEnabled = true,
  showsVerticalScrollIndicator = false,
  refreshControl,
  keyboardAvoiding = false,
  keyboardBehavior = Platform.OS === 'ios' ? 'padding' : undefined,
  contentContainerStyle,
  backgroundColor = colors.neutral[900],
}: ScreenWrapperProps) {
  const content = (
    <View style={[{ flex: 1, backgroundColor, flexDirection: 'column' }, style]}>
      {children}
    </View>
  );

  if (!scrollable) {
    return <SafeAreaView>{content}</SafeAreaView>;
  }

  const scrollView = (
    <ScrollView
      contentContainerStyle={[
        { flexGrow: 1, paddingBottom: spacing[8] },
        contentContainerStyle,
      ]}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      refreshControl={refreshControl as any}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      {children}
    </ScrollView>
  );

  if (keyboardAvoiding && keyboardBehavior) {
    return (
      <SafeAreaView>
        <KeyboardAvoidingView behavior={keyboardBehavior} style={{ flex: 1 }} keyboardVerticalOffset={0}>
          {scrollView}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return <SafeAreaView>{scrollView}</SafeAreaView>;
}

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({ title, subtitle, leftAction, rightAction, style }: ScreenHeaderProps) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
        style,
      ]}
    >
      {leftAction ? <View>{leftAction}</View> : <View style={{ width: 44 }} />}
      <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
        <RNText style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary }}>{title}</RNText>
        {subtitle && <RNText style={{ fontSize: 14, color: colors.text.muted }}>{subtitle}</RNText>}
      </View>
      {rightAction ? <View>{rightAction}</View> : <View style={{ width: 44 }} />}
    </View>
  );
}

export interface SectionProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Section({ title, subtitle, action, children, style, headerStyle, contentStyle }: SectionProps) {
  return (
    <View style={style}>
      {(title || subtitle || action) && (
        <View
          style={[
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
            headerStyle,
          ]}
        >
          <View style={{ flexDirection: 'column', gap: spacing[1] }}>
            {title && <RNText style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: colors.text.muted }}>{title}</RNText>}
            {subtitle && <RNText style={{ fontSize: 14, color: colors.text.secondary }}>{subtitle}</RNText>}
          </View>
          {action}
        </View>
      )}
      <View style={[{ paddingHorizontal: spacing[4] }, contentStyle]}>{children}</View>
    </View>
  );
}

export interface DividerProps {
  style?: StyleProp<ViewStyle>;
  vertical?: boolean;
  color?: string;
  thickness?: number;
  inset?: boolean;
}

export function Divider({ style, vertical = false, color = colors.neutral[700], thickness = 1, inset = false }: DividerProps) {
  if (vertical) {
    return <View style={[{ width: thickness, backgroundColor: color }, style]} />;
  }
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {inset && <View style={{ width: spacing[4] }} />}
      <View style={{ flex: 1, height: thickness, backgroundColor: color }} />
      {inset && <View style={{ width: spacing[4] }} />}
    </View>
  );
}

export interface SpacerProps {
  size?: keyof typeof spacing | number;
  horizontal?: boolean;
}

export function Spacer({ size = 4, horizontal = false }: SpacerProps) {
  const value = typeof size === 'number' ? size : spacing[size];
  return horizontal ? <View style={{ width: value }} /> : <View style={{ height: value }} />;
}