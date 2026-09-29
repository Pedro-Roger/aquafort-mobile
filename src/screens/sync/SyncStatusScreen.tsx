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
import { useSync } from '../../hooks/useSync';
import { useOutbox } from '../../hooks/useOutbox';
import { usePendingWaterQualityReadings } from '../../hooks/useWaterQualityReadingsCache';
import { SyncStatusBar } from '../../components/SyncStatusBar';
import { OutboxItemCard } from '../../components/OutboxItemCard';

export function SyncStatusScreen() {
  const { syncNow, isSyncing, isOnline } = useSync();
  const { items: outboxItems, retryOne, retryAllErrors } = useOutbox();
  const { readings: pendingReadings, count: pendingReadingsCount, refetch: refetchReadings } = usePendingWaterQualityReadings();

  const totalPending = outboxItems.filter(i => i.status === 'pending').length;
  const totalErrors = outboxItems.filter(i => i.status === 'error').length;

  const handleSync = useCallback(async () => {
    await syncNow();
    refetchReadings();
  }, [syncNow, refetchReadings]);

  const handleRetryErrors = useCallback(async () => {
    await retryAllErrors();
    await syncNow();
  }, [retryAllErrors, syncNow]);

  return (
    <View style={styles.container}>
      <SyncStatusBar />

      <View style={styles.header}>
        <Text style={styles.title}>Sincronização</Text>
      </View>

      {/* Connection status */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#22c55e' : '#ef4444' }]} />
          <Text style={styles.statusLabel}>
            {isOnline ? 'Conectado' : 'Offline'}
          </Text>
        </View>
        <Text style={styles.statusSub}>
          {isOnline ? 'Dados sincronizam automaticamente' : 'Dados salvos localmente até conexão voltar'}
        </Text>
      </View>

      {/* Pending counts */}
      <View style={styles.countsRow}>
        <View style={styles.countCard}>
          <Text style={styles.countNumber}>{totalPending + pendingReadingsCount}</Text>
          <Text style={styles.countLabel}>Pendentes</Text>
        </View>
        <View style={styles.countCard}>
          <Text style={styles.countNumber}>{totalErrors}</Text>
          <Text style={styles.countLabel}>Erros</Text>
        </View>
        <View style={styles.countCard}>
          <Text style={styles.countNumber}>{outboxItems.length}</Text>
          <Text style={styles.countLabel}>Total na fila</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, isSyncing && styles.actionBtnDisabled]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.actionBtnText}>Sincronizar Agora</Text>
          )}
        </TouchableOpacity>

        {totalErrors > 0 && (
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleRetryErrors}>
            <Text style={styles.actionBtnSecondaryText}>Repetir Erros ({totalErrors})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Outbox list */}
      {outboxItems.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fila de Sincronização</Text>
          </View>
          <FlatList
            data={outboxItems}
            keyExtractor={item => item.clientId}
            renderItem={({ item }) => (
              <OutboxItemCard
                item={item}
                onRetry={() => retryOne(item.clientId)}
              />
            )}
            contentContainerStyle={styles.list}
          />
        </>
      )}

      {/* Pending readings */}
      {pendingReadingsCount > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Leituras Aguardando Sync ({pendingReadingsCount})</Text>
          </View>
          <FlatList
            data={pendingReadings}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.readingItem}>
                <View style={styles.readingLeft}>
                  <Text style={styles.readingEntity}>water_quality</Text>
                  <Text style={styles.readingTime}>
                    {new Date(item.measuredAt).toLocaleString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.readingRight}>
                  {item.oxygenMgL != null && (
                    <Text style={styles.readingOxygen}>
                      O₂: {item.oxygenMgL.toFixed(1)} mg/L
                    </Text>
                  )}
                </View>
              </View>
            )}
            contentContainerStyle={styles.list}
          />
        </>
      )}

      {outboxItems.length === 0 && pendingReadingsCount === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>Tudo sincronizado</Text>
          <Text style={styles.emptySubtitle}>
            Nenhum item pendente na fila
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, paddingBottom: 8 },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusLabel: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  statusSub: { color: '#64748b', fontSize: 13, marginTop: 4 },
  countsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  countCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  countNumber: { color: '#0ea5e9', fontSize: 28, fontWeight: '800' },
  countLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600', marginTop: 4 },
  actions: { paddingHorizontal: 16, marginBottom: 16 },
  actionBtn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
  },
  actionBtnDisabled: { backgroundColor: '#0369a1' },
  actionBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  actionBtnSecondary: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  actionBtnSecondaryText: { color: '#f59e0b', fontSize: 16, fontWeight: '600' },
  sectionHeader: { paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  sectionTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  readingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    marginVertical: 4,
  },
  readingLeft: { flex: 1 },
  readingEntity: { color: '#0ea5e9', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  readingTime: { color: '#ffffff', fontSize: 14, fontWeight: '500', marginTop: 2 },
  readingRight: { alignItems: 'flex-end' },
  readingOxygen: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, marginTop: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { color: '#64748b', fontSize: 14, textAlign: 'center' },
});