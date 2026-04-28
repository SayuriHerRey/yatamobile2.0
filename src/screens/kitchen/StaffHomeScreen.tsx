// src/screens/kitchen/StaffHomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StaffStackParamList } from '../../types';

// 🎨 COLORES
const COLORS = {
  primary: '#630ED4',
  primaryContainer: '#7C3AED',
  secondary: '#712EDD',
  surface: '#F8F9FA',
  onSurface: '#191C1D',
  onSurfaceVariant: '#4A4455',
  onPrimary: '#FFFFFF',
  surfaceContainer: '#EDEEEF',
  surfaceContainerLow: '#F3F4F5',
  surfaceContainerLowest: '#FFFFFF',
  outline: '#7B7487',
  outlineVariant: '#CCC3D8',
  green: '#16A34A',
  orange: '#F59E0B',
};

// 👤 DATOS MOCK
const STAFF_USER = {
  name: 'Carlos',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeDmRmcLZXXuwI7Kl229gnSYhCjCnlePF--Lk-85T4hbhgDV0h0Ve9A9ONMrnK0LxydA8zpwR_2KTFVGUbAl9iq82sWkgLQuoUENSlZ9XBRqy1THqZF7VZt_BnZP1ChlECUpOfr4lln5PqcNnvzvmw_Ck-Beo8GU7eAU2qafyd2zlcrmu4UTsW3lo7PQIefS1dBN3AGMCOSWu_vpU3ouUV_NZOPYIN-ylLc88r70n-kSCQ5LJMgAz6PsmwP9JcXtDI11uNStC5004',
};

const TODAY_METRICS = {
  received: 142,
  completed: 128,
  pending: 14,
};

export default function StaffHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // 🔧 MANEJADORES DE NAVEGACIÓN CORREGIDOS
  // NOTA: Todas estas rutas deben existir DENTRO de StaffStack
  const handleGoToMenu = () => {
    navigation.navigate('GestionMenu');
  };

  const handleGoToAnalytics = () => {
    // IMPORTANTE: Cambia 'Estadisticas' por el nombre EXACTO de tu pantalla en StaffStack
    // Por defecto usaremos 'EstadisticasStaff' como ejemplo
    navigation.navigate('Estadisticas');
  };

  const handleGoToProfile = () => {
    navigation.navigate('StaffPerfil');
  };

  const handleOpenKDS = () => {
    navigation.navigate('KDS');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* TOP APP BAR - CON PADDING SUPERIOR PARA LA BARRA DE ESTADO */}
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topBarLeft}>
          <MaterialCommunityIcons name="chef-hat" size={24} color={COLORS.primary} />
          <Text style={styles.topBarTitle}>YaTa Staff</Text>
        </View>
        <View style={styles.topBarRight}>
          <Text style={styles.userName}>{STAFF_USER.name}</Text>
          <Image source={{ uri: STAFF_USER.avatar }} style={styles.avatar} />
        </View>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>¡Buen día, {STAFF_USER.name}!</Text>
          <Text style={styles.welcomeTitle}>Panel de control</Text>
        </View>

        {/* KDS Card */}
        <TouchableOpacity style={styles.kdsCard} onPress={handleOpenKDS} activeOpacity={0.9}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryContainer]}
            style={styles.kdsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.kdsContent}>
              <View style={styles.kdsHeader}>
                <View style={styles.kdsIconContainer}>
                  <MaterialCommunityIcons name="tablet-dashboard" size={30} color={COLORS.onPrimary} />
                </View>
                <MaterialCommunityIcons name="arrow-right" size={24} color={COLORS.onPrimary} opacity={0.7} />
              </View>
              <View style={styles.kdsText}>
                <Text style={styles.kdsTitle}>Comandas</Text>
                <Text style={styles.kdsSubtitle}>Gestiona comandas en tiempo real</Text>
              </View>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={100}
                color={COLORS.onPrimary}
                style={styles.kdsDecorativeIcon}
                opacity={0.08}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.metricCardReceived]}>
            <View style={styles.metricHeader}>
              <MaterialCommunityIcons name="inbox-outline" size={18} color={COLORS.primary} />
              <Text style={styles.metricLabel}>RECIBIDOS</Text>
            </View>
            <Text style={styles.metricValue}>{TODAY_METRICS.received}</Text>
            <Text style={styles.metricDescription}>Pedidos hoy</Text>
          </View>

          <View style={[styles.metricCard, styles.metricCardCompleted]}>
            <View style={styles.metricHeader}>
              <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.green} />
              <Text style={[styles.metricLabel, { color: COLORS.green }]}>COMPLETADOS</Text>
            </View>
            <Text style={[styles.metricValue, { color: COLORS.green }]}>{TODAY_METRICS.completed}</Text>
            <Text style={styles.metricDescription}>Listos para entrega</Text>
          </View>

          <View style={[styles.metricCard, styles.metricCardPending]}>
            <View style={styles.metricHeader}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.orange} />
              <Text style={[styles.metricLabel, { color: COLORS.orange }]}>PENDIENTES</Text>
            </View>
            <Text style={[styles.metricValue, { color: COLORS.orange }]}>{TODAY_METRICS.pending}</Text>
            <Text style={styles.metricDescription}>En preparación</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.navItemActive} onPress={() => navigation.popToTop()}>
          <MaterialCommunityIcons name="home" size={24} color={COLORS.primary} />
          <Text style={styles.navLabelActive}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleGoToMenu}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={COLORS.onSurfaceVariant} />
          <Text style={styles.navLabel}>Menú</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleGoToAnalytics}>
          <MaterialCommunityIcons name="chart-bar" size={24} color={COLORS.onSurfaceVariant} />
          <Text style={styles.navLabel}>Panel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleGoToProfile}>
          <MaterialCommunityIcons name="account-outline" size={24} color={COLORS.onSurfaceVariant} />
          <Text style={styles.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 🎨 ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
  },

  /* Scroll Content */
  scrollContent: { flex: 1 },
  scrollPadding: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },

  /* Welcome Section */
  welcomeSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -1,
  },

  /* KDS Card */
  kdsCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  kdsGradient: {
    padding: 28,
  },
  kdsContent: {
    position: 'relative',
  },
  kdsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  kdsIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kdsText: {
    flex: 1,
  },
  kdsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onPrimary,
    marginBottom: 6,
  },
  kdsSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  kdsDecorativeIcon: {
    position: 'absolute',
    right: -20,
    bottom: -30,
  },

  /* Metrics Grid */
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    gap: 8,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  metricCardReceived: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  metricCardCompleted: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.green,
  },
  metricCardPending: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  metricDescription: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },

  /* Bottom Spacer */
  bottomSpacer: { height: 20 },

  /* Bottom Navigation */
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: `${COLORS.surface}CC`,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navItemActive: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: `${COLORS.primary}1A`,
    borderRadius: 12,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navLabelActive: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});