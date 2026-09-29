import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SyncStatusBar } from '../../components/SyncStatusBar';
import { useWaterQualityReadingsCache } from '../../hooks/useWaterQualityReadingsCache';
import { useCyclesCache } from '../../hooks/useCyclesCache';
import { usePondsCache } from '../../hooks/usePondsCache';
import { useSync } from '../../hooks/useSync';
import { usePondOxygenAlerts } from '../../hooks/useWebSocket';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { Cycle, Pond } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'WaterQualityForm'>;
type Route = ReturnType<typeof useRoute> & { params?: { pondId?: string } };

const STATUS_COLORS = {
  OK: '#22c55e',
  WARNING: '#f59e0b',
  CRITICAL: '#ef4444',
} as const;

const STATUS_ICONS = {
  OK: '🟢',
  WARNING: '🟡',
  CRITICAL: '🔴',
} as const;

const STATUS_LABELS = {
  OK: 'OK',
  WARNING: 'ATENÇÃO',
  CRITICAL: 'CRÍTICO',
} as const;

export function WaterQualityListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { cycles } = useCyclesCache();
  const { ponds } = usePondsCache();
  const { syncNow, isSyncing } = useSync();

  const pondId = route.params?.pondId ?? cycles[0]?.pondId ?? ponds[0]?.id ?? null;
  const { readings, isLoading, refetch, saveReading } = useWaterQualityReadingsCache(pondId);
  const { latestEvent, hasCritical, hasWarning } = usePondOxygenAlerts(pondId);

  const currentPond = ponds.find(p => p.id === pondId);
  const currentCycle = cycles.find(c => c.pondId === pondId);

  const handleRefresh = useCallback(async () => {
    await syncNow();
    await refetch();
  }, [syncNow, refetch]);

  const navigateToForm = useCallback(() => {
    navigation.navigate('WaterQualityForm', { pondId });
  }, [navigation, pondId]);

  const renderItem = useCallback(({ item }: { item: typeof readings[0] }) => {
    const status = item.oxygenMgL != null
      ? item.oxygenMgL >= 5 ? 'OK' : item.oxygenMgL >= 3 ? 'WARNING' : 'CRITICAL'
      : 'OK';

    const measuredAt = new Date(item.measuredAt);
    const timeStr = measuredAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = measuredAt.toLocaleDateString('pt-BR');

    return (
      <TouchableOpacity style={styles.item} onPress={() => {}}>
        <View style={styles.itemLeft}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
          <View style={styles.itemTexts}>
            <Text style={styles.itemTime}>{timeStr}</Text>
            <Text style={styles.itemDate}>{dateStr}</Text>
          </View>
        </View>
        <View style={styles.itemRight}>
          {item.oxygenMgL != null && (
            <View style={styles.param}>
              <Text style={styles.paramLabel}>O₂</Text>
              <Text style={[styles.paramValue, { color: STATUS_COLORS[status] }]}>
                {item.oxygenMgL.toFixed(1)} mg/L
              </Text>
            </View>
          )}
          {item.ph != null && (
            <View style={styles.param}>
              <Text style={styles.paramLabel}>pH</Text>
              <Text style={styles.paramValue}>{item.ph.toFixed(1)}</Text>
            </View>
          )}
          {item.temperatureC != null && (
            <View style={styles.param}>
              <Text style={styles.paramLabel}>Temp</Text>
              <Text style={styles.paramValue}>{item.temperatureC.toFixed(1)}°C</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <View style={styles.container}>
      <SyncStatusBar />

      {/* Header with pond selector and semaphore */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pondCode}>{currentPond?.code ?? '—'}</Text>
          <Text style={styles.pondName}>{currentPond?.name ?? 'Selecione um viveiro'}</Text>
        </View>
        <View style={[styles.semaphore, { backgroundColor: hasCritical ? '#ef4444' : hasWarning ? '#f59e0b' : '#22c55e' }]}>
          <Text style={styles.semaphoreIcon}>
            {hasCritical ? '🔴' : hasWarning ? '🟡' : '🟢'}
          </Text>
          <View style={styles.semaphoreTexts}>
            <Text style={styles.semaphoreStatus}>
              {hasCritical ? 'CRÍTICO' : hasWarning ? 'ATENÇÃO' : 'OK'}
            </Text>
            <Text style={styles.semaphoreValue}>
              {latestEvent ? `${latestEvent.oxygenMgL} mg/L` : '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Cycle info */}
      {currentCycle && (
        <View style={styles.cycleInfo}>
          <Text style={styles.cyclePhase}>
            {currentCycle.phase === 'BERCARIO' ? '🐟 Berçário' :
             currentCycle.phase === 'ENGORDA' ? '🐠 Engorda' :
             currentCycle.phase === 'PRE_BERCARIO' ? '🥚 Pré-berçário' : currentCycle.phase}
          </Text>
          {currentCycle.daysOfCulture != null && (
            <Text style={styles.cycleDays}>{currentCycle.daysOfCulture} dias de cultura</Text>
          )}
        </View>
      )}

      {/* Readings list */}
      <FlatList
        data={readings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isSyncing}
            onRefresh={handleRefresh}
            tintColor="#0ea5e9"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💧</Text>
              <Text style={styles.emptyTitle}>Nenhuma leitura</Text>
              <Text style={styles.emptySubtitle}>
                Toque em + para registrar a primeira coleta
              </Text>
            </View>
          ) : null
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={navigateToForm}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1 },
  pondCode: { color: '#0ea5e9', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  pondName: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginTop: 2 },
  semaphore: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  semaphoreIcon: { fontSize: 18, marginRight: 8 },
  semaphoreTexts: { flexDirection: 'column' },
  semaphoreStatus: { color: '#ffffff', fontSize: 11, fontWeight: '700', lineHeight: 14 },
  semaphoreValue: { color: '#ffffff', fontSize: 12, fontWeight: '500', lineHeight: 16, opacity: 0.9 },
  cycleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  cyclePhase: { color: '#0ea5e9', fontSize: 13, fontWeight: '600' },
  cycleDays: { color: '#64748b', fontSize: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    marginVertical: 4,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  itemTexts: { flexDirection: 'column' },
  itemTime: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  itemDate: { color: '#64748b', fontSize: 11 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  param: { alignItems: 'flex-end' },
  paramLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  paramValue: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { color: '#64748b', fontSize: 14, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabIcon: { color: '#ffffff', fontSize: 28, fontWeight: '300' },
});