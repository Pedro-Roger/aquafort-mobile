import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePondsCache } from '../../hooks/usePondsCache';
import { useCyclesCache } from '../../hooks/useCyclesCache';
import { useSync } from '../../hooks/useSync';
import { SyncStatusBar } from '../../components/SyncStatusBar';
import { usePondOxygenAlerts } from '../../hooks/useWebSocket';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';

type Nav = NavigationProp<RootStackParamList>;

const PHASE_LABELS: Record<string, string> = {
  PRE_BERCARIO: 'Pré-berçário',
  BERCARIO: 'Berçário',
  ENGORDA: 'Engorda',
};

const STATUS_COLORS = {
  ACTIVE: '#22c55e',
  INACTIVE: '#64748b',
  MAINTENANCE: '#f59e0b',
} as const;

export function PondsScreen() {
  const navigation = useNavigation<Nav>();
  const { ponds, isLoading, reload } = usePondsCache();
  const { cycles } = useCyclesCache();
  const { syncNow, isSyncing } = useSync();

  const handleRefresh = useCallback(async () => {
    await syncNow();
    await reload();
  }, [syncNow, reload]);

  const navigateToPond = useCallback((pondId: string) => {
    navigation.navigate('Root', { screen: 'Tabs', params: { screen: 'WaterQuality', params: { pondId } } });
    // Close drawer is not available on Root navigation, it's handled by the drawer itself
  }, [navigation]);

  const renderPond = useCallback(({ item }: { item: typeof ponds[0] }) => {
    const pondCycles = cycles.filter(c => c.pondId === item.id);
    const activeCycle = pondCycles.find(c => c.status === 'ATIVO');
    const { hasCritical, hasWarning, latestEvent } = usePondOxygenAlerts(item.id);

    const statusColor = hasCritical ? '#ef4444' : hasWarning ? '#f59e0b' : '#22c55e';
    const statusIcon = hasCritical ? '🔴' : hasWarning ? '🟡' : '🟢';
    const oxygenValue = latestEvent ? `${latestEvent.oxygenMgL} mg/L` : '—';

    return (
      <TouchableOpacity style={styles.pondCard} onPress={() => navigateToPond(item.id)}>
        <View style={styles.pondLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: STATUS_COLORS[item.status ?? 'INACTIVE'] }]} />
          <View style={styles.pondInfo}>
            <Text style={styles.pondCode}>{item.code}</Text>
            <Text style={styles.pondName}>{item.name}</Text>
          </View>
        </View>
        <View style={styles.pondRight}>
          <View style={[styles.oxygenBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.oxygenBadgeIcon}>{statusIcon}</Text>
            <View style={styles.oxygenBadgeText}>
              <Text style={styles.oxygenBadgeValue}>{oxygenValue}</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    );
  }, [cycles, navigateToPond]);

  return (
    <View style={styles.container}>
      <SyncStatusBar />

      <View style={styles.header}>
        <Text style={styles.title}>Viveiros</Text>
      </View>

      <FlatList
        data={ponds}
        keyExtractor={item => item.id}
        renderItem={renderPond}
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
              <Text style={styles.emptyIcon}>🌊</Text>
              <Text style={styles.emptyTitle}>Nenhum viveiro</Text>
              <Text style={styles.emptySubtitle}>
                Sincronize para carregar os viveiros da fazenda
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, paddingBottom: 8 },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  pondCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 16,
    marginVertical: 6,
  },
  pondLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  pondInfo: { flex: 1 },
  pondCode: { color: '#0ea5e9', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  pondName: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 2 },
  pondRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  oxygenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  oxygenBadgeIcon: { fontSize: 12, marginRight: 4 },
  oxygenBadgeText: { flexDirection: 'column' },
  oxygenBadgeValue: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
  chevron: { color: '#475569', fontSize: 20, fontWeight: '300' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { color: '#64748b', fontSize: 14, textAlign: 'center' },
});