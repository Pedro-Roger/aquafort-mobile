import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFarm } from '../../hooks/useFarm';
import { SyncStatusBar } from '../../components/SyncStatusBar';
import { useSync } from '../../hooks/useSync';
import { api, clearToken, clearActiveFarmId } from '../../services/api';

export function SettingsScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const farm = useFarm(isAuthenticated);
  const { syncNow, isSyncing } = useSync();

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await clearToken();
          await clearActiveFarmId();
          logout();
        },
      },
    ]);
  };

  const handleSync = async () => {
    try {
      await syncNow();
      Alert.alert('Sucesso', 'Sincronização concluída');
    } catch {
      Alert.alert('Erro', 'Falha na sincronização');
    }
  };

  const handleSwitchFarm = async (farmId: string) => {
    try {
      const res = await api.post('/v1/auth/switch-farm', { farmId });
      const { accessToken } = res.data;
      // Token and farmId are saved in SecureStore by the api interceptor
      // The next request will automatically use the new farmId
    } catch {
      Alert.alert('Erro', 'Não foi possível trocar de fazenda');
    }
  };

  return (
    <View style={styles.container}>
      <SyncStatusBar />

      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      {/* User info */}
      <View style={styles.card}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? 'Usuário'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
            <Text style={styles.userRole}>
              {user?.role === 'ADMIN' ? 'Administrador' :
               user?.role === 'MANAGER' ? 'Gerente' : 'Técnico de Campo'}
            </Text>
          </View>
        </View>
      </View>

      {/* Farm section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fazenda Ativa</Text>
        {farm.farms.length > 0 ? (
          farm.farms.map(f => (
            <TouchableOpacity
              key={f.farmId}
              style={[
                styles.farmOption,
                farm.activeFarm?.farmId === f.farmId && styles.farmOptionActive,
              ]}
              onPress={() => f.farmId !== farm.activeFarm?.farmId && handleSwitchFarm(f.farmId)}
              disabled={farm.activeFarm?.farmId === f.farmId || farm.isSwitching}
            >
              <View style={styles.farmOptionLeft}>
                <View
                  style={[
                    styles.farmStatusDot,
                    { backgroundColor: f.status === 'ACTIVE' ? '#22c55e' : '#64748b' },
                  ]}
                />
                <View style={styles.farmInfo}>
                  <Text style={styles.farmName}>{f.farmName}</Text>
                  <Text style={styles.farmRole}>
                    {f.role === 'ADMIN' ? 'Admin' : f.role === 'MANAGER' ? 'Gerente' : 'Técnico'}
                  </Text>
                </View>
              </View>
              {farm.activeFarm?.farmId === f.farmId && (
                <Text style={styles.farmActiveBadge}>Ativa</Text>
              )}
              {farm.isSwitching && farm.activeFarm?.farmId === f.farmId && (
                <ActivityIndicator color="#0ea5e9" size="small" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noFarms}>Nenhuma fazenda vinculada</Text>
        )}
      </View>

      {/* Sync section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sincronização</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleSync} disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.actionBtnText}>Sincronizar Agora</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.syncNote}>
          Dados offline sincronizam automaticamente quando há conexão.
        </Text>
      </View>

      {/* App info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Versão</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ambiente</Text>
          <Text style={styles.infoValue}>
            {__DEV__ ? 'Desenvolvimento' : 'Produção'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>API</Text>
          <Text style={styles.infoValue}>
            {process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}
          </Text>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
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
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  userEmail: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  userRole: { color: '#64748b', fontSize: 12, marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  farmOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  farmOptionActive: { borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.1)' },
  farmOptionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  farmStatusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  farmInfo: { flex: 1 },
  farmName: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  farmRole: { color: '#64748b', fontSize: 12, marginTop: 2 },
  farmActiveBadge: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  noFarms: { color: '#64748b', fontSize: 14, textAlign: 'center', padding: 20 },
  actionBtn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  syncNote: { color: '#64748b', fontSize: 12, textAlign: 'center' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  infoLabel: { color: '#94a3b8', fontSize: 14 },
  infoValue: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  logoutBtn: {
    backgroundColor: '#b91c1c',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
  },
  logoutText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});