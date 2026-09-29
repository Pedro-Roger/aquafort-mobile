import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SyncStatusBar } from '../../components/SyncStatusBar';
import { useCyclesCache } from '../../hooks/useCyclesCache';
import { usePondsCache } from '../../hooks/usePondsCache';
import { useSync } from '../../hooks/useSync';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { Cycle, Pond } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BiometricForm'>;
type Route = ReturnType<typeof useRoute> & { params?: { cycleId?: string } };

export function BiometricListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { cycles } = useCyclesCache();
  const { ponds } = usePondsCache();
  const { syncNow, isSyncing } = useSync();

  const cycleId = route.params?.cycleId ?? cycles[0]?.id ?? null;
  const currentCycle = cycles.find(c => c.id === cycleId);
  const currentPond = currentCycle ? ponds.find(p => p.id === currentCycle.pondId) : null;

  const handleRefresh = useCallback(async () => {
    await syncNow();
  }, [syncNow]);

  const navigateToForm = useCallback(() => {
    navigation.navigate('BiometricForm', { cycleId });
  }, [navigation, cycleId]);

  const renderCycle = useCallback(({ item }: { item: Cycle }) => (
    <TouchableOpacity style={styles.cycleCard} onPress={() => navigation.navigate('BiometricForm', { cycleId: item.id })}>
      <View style={styles.cycleLeft}>
        <Text style={styles.cyclePhase}>
          {item.phase === 'BERCARIO' ? '🐟 Berçário' :
           item.phase === 'ENGORDA' ? '🐠 Engorda' : '🥚 Pré-berçário'}
        </Text>
        {item.supplier && <Text style={styles.cycleSupplier}>{item.supplier}</Text>}
        {item.daysOfCulture != null && (
          <Text style={styles.cycleDays}>{item.daysOfCulture} dias de cultura</Text>
        )}
      </View>
      <View style={styles.cycleRight}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  return (
    <View style={styles.container}>
      <SyncStatusBar />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pondCode}>{currentPond?.code ?? '—'}</Text>
          <Text style={styles.pondName}>{currentPond?.name ?? 'Selecione um viveiro/ciclo'}</Text>
        </View>
      </View>

      {currentCycle && (
        <View style={styles.cycleInfo}>
          <Text style={styles.cyclePhase}>
            {currentCycle.phase === 'BERCARIO' ? '🐟 Berçário' :
             currentCycle.phase === 'ENGORDA' ? '🐠 Engorda' : '🥚 Pré-berçário'}
          </Text>
          <Text style={styles.cycleDaysHeader}>
            {currentCycle.daysOfCulture != null ? `${currentCycle.daysOfCulture} dias` : 'Início'}
          </Text>
        </View>
      )}

      <FlatList
        data={cycles.filter(c => c.pondId === currentPond?.id)}
        keyExtractor={item => item.id}
        renderItem={renderCycle}
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
            <Text style={styles.emptyIcon}>⚖</Text>
            <Text style={styles.emptyTitle}>Nenhuma biometria</Text>
            <Text style={styles.emptySubtitle}>
              Toque em + para registrar a primeira biometria
            </Text>
          </View>
        }
      />

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
  cyclePhase: { color: '#0f766e', fontSize: 14, fontWeight: '600' },
  cycleDaysHeader: { color: '#64748b', fontSize: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  cycleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 16,
    marginVertical: 4,
  },
  cycleLeft: { flex: 1 },
  cycleSupplier: { color: '#64748b', fontSize: 12, marginTop: 2 },
  cycleDays: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  cycleRight: {},
  chevron: { color: '#475569', fontSize: 20, fontWeight: '300' },
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
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabIcon: { color: '#ffffff', fontSize: 28, fontWeight: '300' },
});