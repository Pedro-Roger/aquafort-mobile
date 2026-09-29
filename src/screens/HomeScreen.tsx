import React, { useCallback } from 'react';
import { View, Text, FlatList, SectionList, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SyncStatusBar } from '../components/SyncStatusBar';
import { useCyclesCache } from '../hooks/useCyclesCache';
import { useSync } from '../hooks/useSync';
import { usePondOxygenAlerts, useWebSocket } from '../hooks/useWebSocket';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Cycle } from '../types';
import { ScreenWrapper, Section, Card, Badge, PhaseBadge, StatusBadge, Button, Spacer } from '../components/ui';
import { spacing, colors, typography, borderRadius } from '../theme/tokens';

// HomeScreen is kept for potential legacy use but not in new tab navigation
type HomeNav = NativeStackNavigationProp<RootStackParamList, 'WaterQualityForm'>;

const PHASE_LABELS: Record<string, string> = {
  PRE_BERCARIO: 'Pré-berçário',
  BERCARIO: 'Berçário',
  ENGORDA: 'Engorda',
};

function groupByPond(cycles: Cycle[]) {
  const map = new Map<string, { title: string; pondCode: string; pondId: string; data: Cycle[] }>();

  for (const c of cycles) {
    const key = c.pondId;
    if (!map.has(key)) {
      map.set(key, {
        title: c.pondName ?? c.pondId,
        pondCode: c.pondCode ?? '',
        pondId: c.pondId,
        data: [],
      });
    }
    map.get(key)!.data.push(c);
  }

  return Array.from(map.values());
}

const sectionHeaderStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  paddingHorizontal: spacing[1],
  paddingVertical: spacing[1],
};

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { cycles, isLoading, reload } = useCyclesCache();
  const { syncNow, isSyncing } = useSync();
  const { isConnected: wsConnected } = useWebSocket();

  const handleRefresh = useCallback(async () => {
    await syncNow();
    await reload();
  }, [syncNow, reload]);

  const sections = groupByPond(cycles);

  const navigateToForm = useCallback(() => {
    navigation.navigate('WaterQualityForm', undefined);
  }, [navigation]);

  const navigateToBiometricForm = useCallback(() => {
    navigation.navigate('BiometricForm', undefined);
  }, [navigation]);

  const navigateToFeedingForm = useCallback(() => {
    navigation.navigate('FeedingForm', undefined);
  }, [navigation]);

  const navigateToMortalityForm = useCallback(() => {
    navigation.navigate('MortalityForm', undefined);
  }, [navigation]);

  const navigateToOutbox = useCallback(() => {
    navigation.navigate('Root' as any);
  }, [navigation]);

  const renderCycleItem = useCallback(({ item }: { item: Cycle }) => (
    <Card variant="default" padding={3} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <PhaseBadge phase={item.phase} size="sm" />
        {item.supplier && <Spacer size={1} />}
        {item.supplier && <span style={{ fontSize: typography.fontSize.sm, color: colors.text.muted }}>{item.supplier}</span>}
      </View>
      {item.daysOfCulture != null && (
        <View style={{ alignItems: 'center', backgroundColor: colors.neutral[900], borderRadius: borderRadius.md, paddingHorizontal: spacing[3], paddingVertical: spacing[1] }}>
          <span style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.heavy, color: colors.primary[400] }}>{item.daysOfCulture}</span>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.text.muted }}>dias</span>
        </View>
      )}
    </Card>
  ), []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; pondCode: string; pondId: string } }) => {
      const { latestEvent, hasCritical, hasWarning } = usePondOxygenAlerts(section.pondId);
      
      const statusType = hasCritical ? 'critical' : hasWarning ? 'warning' : 'ok';
      const oxygenValue = latestEvent ? `${latestEvent.oxygenMgL} mg/L` : '—';

      return (
        <View style={sectionHeaderStyle}>
          <View style={{ flexDirection: 'column', gap: spacing[0.5] }}>
            <span style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.widest, textTransform: 'uppercase', color: colors.primary[400] }}>{section.pondCode}</span>
            <span style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>{section.title}</span>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            <StatusBadge status={statusType} size="md" />
            <span style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, color: colors.text.secondary }}>{oxygenValue}</span>
          </View>
        </View>
      );
    },
    [],
  );

  return (
    <ScreenWrapper
      refreshControl={
        <RefreshControl
          refreshing={isLoading || isSyncing}
          onRefresh={handleRefresh}
          tintColor={colors.primary[400]}
        />
      }
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[2] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
          <span style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.heavy, color: colors.text.primary }}>Ciclos Ativos</span>
          <StatusBadge status={wsConnected ? 'online' : 'offline'} size="sm" />
        </View>
        <Button variant="ghost" size="sm" onPress={navigateToOutbox} accessibilityLabel="Ver fila de sincronização">
          Fila ›
        </Button>
      </View>

      {sections.length === 0 && !isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[8] }}>
          <span style={{ fontSize: 56, marginBottom: spacing[4] }}>🌊</span>
          <Spacer size={3} />
          <span style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>Nenhum ciclo ativo</span>
          <Spacer size={1} />
          <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, textAlign: 'center' }}>Sincronize para carregar os dados</span>
          <Spacer size={4} />
          <Button variant="primary" size="lg" onPress={handleRefresh} fullWidth={false}>
            Sincronizar agora
          </Button>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderCycleItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ paddingHorizontal: spacing[4], paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading || isSyncing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[400]}
            />
          }
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* FAB Stack - Primary action (feeding) is widest and most accessible */}
      <TouchableOpacity style={[
        { position: 'absolute', bottom: spacing[7], right: spacing[6], width: 60, height: 60, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
        { backgroundColor: colors.error.dark, shadowColor: colors.error.dark, elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      ]} onPress={navigateToMortalityForm} accessibilityLabel="Registrar mortalidade">
        <span style={{ fontSize: 28 }}>💀</span>
      </TouchableOpacity>
      <TouchableOpacity style={[
        { position: 'absolute', bottom: 44, right: spacing[6], width: 60, height: 60, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
        { backgroundColor: '#0284c7', shadowColor: '#0284c7', elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      ]} onPress={navigateToForm} accessibilityLabel="Registrar qualidade da água">
        <span style={{ fontSize: 28 }}>💧</span>
      </TouchableOpacity>
      <TouchableOpacity style={[
        { position: 'absolute', bottom: 52, right: spacing[6], width: 60, height: 60, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
        { backgroundColor: colors.phase.bercario, shadowColor: colors.phase.bercario, elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      ]} onPress={navigateToBiometricForm} accessibilityLabel="Registrar biometria">
        <span style={{ fontSize: 28 }}>⚖</span>
      </TouchableOpacity>
      <TouchableOpacity style={[
        { position: 'absolute', bottom: spacing[7], right: spacing[6], width: 96, height: 60, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
        { backgroundColor: colors.primary[400], shadowColor: colors.primary[400], elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      ]} onPress={navigateToFeedingForm} accessibilityLabel="Registrar trato">
        <span style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.heavy, color: colors.text.onPrimary }}>Trato</span>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}