import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../hooks/useAuth';
import { useFarm, type UseFarmReturn } from '../hooks/useFarm';
import { FarmSwitcher } from '../components/FarmSwitcher';
import { LoginScreen } from '../screens/LoginScreen';

// Tab screens
import { WaterQualityListScreen } from '../screens/water-quality/WaterQualityListScreen';
import { FeedingListScreen } from '../screens/feeding/FeedingListScreen';
import { BiometricListScreen } from '../screens/biometrics/BiometricListScreen';
import { SyncStatusScreen } from '../screens/sync/SyncStatusScreen';

// Drawer screens
import { PondsScreen } from '../screens/ponds/PondsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

// Modal screens (will be rendered as modals via stack)
import { WaterQualityFormScreen } from '../screens/water-quality/WaterQualityFormScreen';
import { FeedingFormScreen } from '../screens/feeding/FeedingFormScreen';
import { BiometricFormScreen } from '../screens/biometrics/BiometricFormScreen';
import { MortalityFormScreen } from '../screens/mortality/MortalityFormScreen';

export type AuthStackParamList = {
  Login: undefined;
};

export type TabParamList = {
  WaterQuality: undefined;
  Feeding: undefined;
  Biometrics: undefined;
  Sync: undefined;
};

export type DrawerParamList = {
  Tabs: undefined;
  Ponds: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Root: { screen: string; params?: any } | undefined;
  WaterQualityForm: { pondId?: string } | undefined;
  FeedingForm: { pondId?: string } | undefined;
  BiometricForm: { cycleId?: string } | undefined;
  MortalityForm: { pondId?: string } | undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopWidth: 1,
          borderTopColor: '#1e293b',
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="WaterQuality"
        component={WaterQualityListScreen}
        options={{
          title: 'Qualidade',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Icon name="water" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Feeding"
        component={FeedingListScreen}
        options={{
          title: 'Trato',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Icon name="fish" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Biometrics"
        component={BiometricListScreen}
        options={{
          title: 'Biometria',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Icon name="scale" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sync"
        component={SyncStatusScreen}
        options={{
          title: 'Sync',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Icon name="sync" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function DrawerNavigator({ farm }: { farm: UseFarmReturn }) {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} farm={farm} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
        drawerStyle: { backgroundColor: '#0f172a' },
        drawerActiveTintColor: '#0ea5e9',
        drawerInactiveTintColor: '#64748b',
      }}
    >
      <Drawer.Screen
        name="Tabs"
        component={TabNavigator}
        options={{
          title: 'Aquafort',
          drawerIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Ponds"
        component={PondsScreen}
        options={{
          title: 'Viveiros',
          drawerIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Icon name="map-marker" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configurações',
          drawerIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <Icon name="cog" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function CustomDrawerContent({ navigation, farm }: { navigation: any; farm: UseFarmReturn }) {
  return (
    <View style={drawerStyles.content}>
      <View style={drawerStyles.header}>
        <Text style={drawerStyles.title}>Aquafort</Text>
        <Text style={drawerStyles.subtitle}>Sistema de Monitoramento</Text>
      </View>

      <View style={drawerStyles.section}>
        <Text style={drawerStyles.sectionLabel}>Navegação</Text>
        {[
          { name: 'Tabs', label: 'Início', icon: 'home' },
          { name: 'Ponds', label: 'Viveiros', icon: 'map-marker' },
          { name: 'Settings', label: 'Configurações', icon: 'cog' },
        ].map(item => (
          <TouchableOpacity
            key={item.name}
            style={drawerStyles.item}
            onPress={() => {
              navigation.navigate(item.name as any);
              navigation.closeDrawer();
            }}
          >
            <Icon name={item.icon} size={22} color="#94a3b8" style={{ marginRight: 12 }} />
            <Text style={drawerStyles.itemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={drawerStyles.section}>
        <Text style={drawerStyles.sectionLabel}>Fazenda Ativa</Text>
        <FarmSwitcher
          farms={farm.farms}
          activeFarm={farm.activeFarm}
          isLoading={farm.isLoading}
          isSwitching={farm.isSwitching}
          onSwitch={farm.switchFarm}
        />
      </View>

      <View style={drawerStyles.footer}>
        <Text style={drawerStyles.version}>v1.0.0</Text>
      </View>
    </View>
  );
}

const drawerStyles = StyleSheet.create({
  content: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 24, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#64748b', fontSize: 12, marginTop: 4 },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderRadius: 8 },
  itemText: { color: '#e2e8f0', fontSize: 15, fontWeight: '500' },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#1e293b', alignItems: 'center' },
  version: { color: '#475569', fontSize: 11 },
});

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color="#0ea5e9" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
});

function RootStackNavigator({ farm }: { farm: UseFarmReturn }) {
  const DrawerNavigatorWithFarm = React.useCallback(
    () => <DrawerNavigator farm={farm} />,
    [farm]
  );

  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#0f172a' },
        headerRight: () => (
          <FarmSwitcher
            farms={farm.farms}
            activeFarm={farm.activeFarm}
            isLoading={farm.isLoading}
            isSwitching={farm.isSwitching}
            onSwitch={farm.switchFarm}
          />
        ),
      }}
    >
      <RootStack.Screen
        name="Root"
        component={DrawerNavigatorWithFarm}
        options={{ headerShown: true }}
      />
      <RootStack.Screen
        name="WaterQualityForm"
        component={WaterQualityFormScreen}
        options={{ title: 'Nova Coleta', presentation: 'modal' }}
      />
      <RootStack.Screen
        name="FeedingForm"
        component={FeedingFormScreen}
        options={{ title: 'Novo Trato', presentation: 'modal' }}
      />
      <RootStack.Screen
        name="BiometricForm"
        component={BiometricFormScreen}
        options={{ title: 'Nova Biometria', presentation: 'modal' }}
      />
      <RootStack.Screen
        name="MortalityForm"
        component={MortalityFormScreen}
        options={{ title: 'Nova Mortalidade', presentation: 'modal' }}
      />
    </RootStack.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const farm = useFarm(isAuthenticated);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && farm.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <RootStackNavigator farm={farm} /> : <AuthNavigator />}
    </NavigationContainer>
  );
}