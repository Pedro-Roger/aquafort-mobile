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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SyncStatusBar } from '../../components/SyncStatusBar';
import { useCyclesCache } from '../../hooks/useCyclesCache';
import { usePondsCache } from '../../hooks/usePondsCache';
import { useFeedProductsCache } from '../../hooks/useFeedProductsCache';
import { useSync } from '../../hooks/useSync';
import { getPendingFeedKgForPond, saveOfflineFeeding } from '../../services/feeding.service';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { Cycle, Pond, FeedProduct } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'FeedingForm'>;
type Route = ReturnType<typeof useRoute> & { params?: { pondId?: string } };

export function FeedingListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { cycles } = useCyclesCache();
  const { ponds } = usePondsCache();
  const { products } = useFeedProductsCache();
  const { syncNow, isSyncing } = useSync();

  const pondId = route.params?.pondId ?? cycles[0]?.pondId ?? ponds[0]?.id ?? null;
  const [pendingKg, setPendingKg] = React.useState(0);

  React.useEffect(() => {
    if (!pondId) return;
    getPendingFeedKgForPond(pondId).then(setPendingKg).catch(() => setPendingKg(0));
  }, [pondId]);

  const pondFeeds = React.useMemo(() => {
    // Group by cycle for display
    const feedsByCycle = new Map<string, { cycle: Cycle; totalKg: number }>();
    cycles.filter(c => c.pondId === pondId).forEach(cycle => {
      feedsByCycle.set(cycle.id, { cycle, totalKg: 0 });
    });
    // In a real app, you'd fetch from local cache or API
    return Array.from(feedsByCycle.values());
  }, [cycles, pondId]);

  const currentPond = ponds.find(p => p.id === pondId);

  const handleRefresh = useCallback(async () => {
    await syncNow();
  }, [syncNow]);

  const navigateToForm = useCallback(() => {
    navigation.navigate('FeedingForm', { pondId });
  }, [navigation, pondId]);

  const renderCycleFeed = useCallback(({ item }: { item: typeof pondFeeds[0] }) => (
    <View style={styles.cycleCard}>
      <Text style={styles.cyclePhase}>
        {item.cycle.phase === 'BERCARIO' ? '🐟 Berçário' :
         item.cycle.phase === 'ENGORDA' ? '🐠 Engorda' : '🥚 Pré-berçário'}
      </Text>
      <Text style={styles.cycleSupplier}>
        {item.cycle.supplier ?? 'Sem fornecedor'}
      </Text>
      <View style={styles.feedRow}>
        <Text style={styles.feedLabel}>Total hoje (local)</Text>
        <Text style={styles.feedValue}>{pendingKg.toFixed(2)} kg</Text>
      </View>
      <View style={styles.feedRow}>
        <Text style={styles.feedLabel}>Produtos disponíveis</Text>
        <Text style={styles.feedValue}>{products.length}</Text>
      </View>
    </View>
  ), [pendingKg, products.length]);

  return (
    <View style={styles.container}>
      <SyncStatusBar />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pondCode}>{currentPond?.code ?? '—'}</Text>
          <Text style={styles.pondName}>{currentPond?.name ?? 'Selecione um viveiro'}</Text>
        </View>
        {pendingKg > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>
              {pendingKg.toFixed(2)} kg pendentes
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={pondFeeds}
        keyExtractor={item => item.cycle.id}
        renderItem={renderCycleFeed}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={handleRefresh}
            tintColor="#0ea5e9"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐟</Text>
            <Text style={styles.emptyTitle}>Nenhum trato registrado</Text>
            <Text style={styles.emptySubtitle}>
              Toque em + para registrar o primeiro trato
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={navigateToForm}>
        <Text style={styles.fabLabel}>Trato</Text>
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
  pendingBadge: {
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pendingText: { color: '#7dd3fc', fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  cycleCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 16,
    marginVertical: 4,
  },
  cyclePhase: { color: '#0ea5e9', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cycleSupplier: { color: '#64748b', fontSize: 12, marginBottom: 12 },
  feedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  feedLabel: { color: '#94a3b8', fontSize: 13 },
  feedValue: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { color: '#64748b', fontSize: 14, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 96,
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
  fabLabel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
});