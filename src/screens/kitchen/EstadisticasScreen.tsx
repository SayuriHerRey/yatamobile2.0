// src/screens/kitchen/EstadisticasScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 🎨 COLORES (consistente con el resto de la app)
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
  surfaceContainerHigh: '#E7E8E9',
  outlineVariant: '#CCC3D8',
  green: '#16A34A',
  greenLight: '#DCFCE7',
};

// 📦 TIPOS
interface TopProduct {
  id: string;
  name: string;
  image: string;
  ordersToday: number;
  revenue: number;
}

interface HourlyData {
  hour: string;
  value: number; // 0-100 para altura de barra
}

// 👤 DATOS MOCK (luego vendrán de analytics-service)
const STAFF_USER = {
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVLPgqfJ4_wEpcHSHqgBTsM5UXPH9MLFSUF-v5aTfq3Kz4YjsEK4VD871ZV8LNUp2jOkGcvNJoL_BoP_MtiIt4CcmJnWsLomU67jaj6uKTFDWv_CsNAyJgiyJDCCqZSVecc7alIjb5dOj4CGqKwMxWtyapMVUGQ_zn_-9aqkUR658jkRQJFaEkRJ-FaE8BixknKVGBs-bz8LWZMzwk9ACizVkYbIKZSflOaAwErwAyM45OEZccyb6vMwmJA8N0InRdxMh9_8WmNQM',
};

const TIME_RANGES = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
] as const;

type TimeRange = typeof TIME_RANGES[number]['id'];

const METRICS = {
  today: {
    totalOrders: 145,
    growth: '+12%',
    avgTicket: 82.00,
    avgPrepTime: 10,
  },
  week: {
    totalOrders: 892,
    growth: '+8%',
    avgTicket: 79.50,
    avgPrepTime: 11,
  },
  month: {
    totalOrders: 3421,
    growth: '+15%',
    avgTicket: 81.20,
    avgPrepTime: 10,
  },
};

const HOURLY_DATA: HourlyData[] = [
  { hour: '08:00', value: 40 },
  { hour: '10:00', value: 65 },
  { hour: '12:00', value: 90 }, // Pico de mediodía
  { hour: '14:00', value: 75 },
  { hour: '16:00', value: 50 },
  { hour: '18:00', value: 30 },
];

const TOP_PRODUCTS: TopProduct[] = [
  {
    id: '1',
    name: 'Torta de lomo',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1ouOIh-PDhjhziMdxcyYJ73rkQUvfyajMAhDCrKBYg9BMEzlrbI_xV0f3lJkdUteJSfPULk6y6Fed-WWLxgb_HE1lvd_w9VzJyCv-vPQU61fGlrIRi9C4NYVo9xHk6bnHtelrWDgz_xxOXq7aNzv3iZJGFQlFjfimhIYOgv_WW-qFrKuYPZEBYxsgplG9BhR27lPQMJbGW9slepN1P7PddxyJNo5LUnNTPTS2tZzULzG4GYkKKHB0al-jOvUsPlOd3lCatTSmFXg',
    ordersToday: 42,
    revenue: 3444,
  },
  {
    id: '2',
    name: 'Café Americano',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzeiiZMnHY9bz0GqdRSkekrDzrEjtax09A5EEcWwFg1ggZ6yGDlSz3e3lipVHC_OJ0doItPO17gez_fsAzb4y-gyGiObOZphzRCEY_rYQ8fOU603wHY7h1ixaHkGGXWoLT5IgTiTrgDFdtg7GASJIpvIuP8Oo4u85VLFMCC6m1WfSmlh9Ynfo4Xfmb76AP2YAOfwdc-FCRoUUOOOOzBcRIXQTXg_s-aP8ZNPFf4Xm83FZCovglE1cY2oBnRasciU3GtMR8g11dTCM',
    ordersToday: 38,
    revenue: 1140,
  },
  {
    id: '3',
    name: 'Chilaquiles Verdes',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1qVNHG75RcYrsJ6pJJ2tfhoaplrXcMq8mWVMMLMCcfEKJuPIBjYlI5iQ5Vu7t5tysKafjAySyLQLOQqyI4bAQKJLMRMw9OcImSUZYnl1ifbzO16GN4qhcWodu0B1RMKfs02KXPxBuZn6D7DmBEst9s7kgurYMUVSwXPik-EUqRk-mOGkagQ15CAmkmTBtE-i7A5nhm4IP2tH7q9HUe6hkDzzj8I4o2zn_-CweO0E7Hywa-2q6Ce2Mf36dzRTsDA70zvstXB6OTTE',
    ordersToday: 25,
    revenue: 2125,
  },
];

export default function EstadisticasScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [timeRange, setTimeRange] = useState<TimeRange>('today');

  // 🔧 HANDLERS
  const handleNotification = () => {
    console.log('🔔 Ver notificaciones');
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    console.log(`📅 Rango cambiado a: ${range}`);
  };

  const handleViewAllProducts = () => {
    console.log('📋 Ver todos los productos');
  };

  const currentMetrics = METRICS[timeRange];
  const isToday = timeRange === 'today';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── TOP APP BAR CON PADDING PARA LA BARRA DE ESTADO ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topBarLeft}>
          <Image
            source={{ uri: STAFF_USER.avatar }}
            style={styles.avatar}
            accessibilityLabel="Foto de perfil"
          />
          <Text style={styles.topBarTitle}>YaTa Cafetería</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNotification}
          accessibilityLabel="Notificaciones"
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Estadísticas de Venta</Text>

          {/* Time Selector */}
          <View style={styles.timeSelector}>
            {TIME_RANGES.map((range) => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.timeButton,
                  timeRange === range.id && styles.timeButtonActive,
                ]}
                onPress={() => handleTimeRangeChange(range.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    timeRange === range.id && styles.timeButtonTextActive,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Metrics Bento Grid */}
        <View style={styles.metricsGrid}>
          {/* Total Pedidos (full width) */}
          <View style={[styles.metricCard, styles.metricCardWide]}>
            <Text style={styles.metricLabel}>Total pedidos</Text>
            <Text style={styles.metricValue}>{currentMetrics.totalOrders}</Text>
            <View style={styles.growthIndicator}>
              <MaterialCommunityIcons name="trending-up" size={14} color={COLORS.green} />
              <Text style={styles.growthText}>{currentMetrics.growth} vs ayer</Text>
            </View>
          </View>

          {/* Ticket Promedio */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Ticket promedio</Text>
            <Text style={styles.metricValueSmall}>${currentMetrics.avgTicket.toFixed(2)}</Text>
          </View>

          {/* Tiempo Prep. Med */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Tiempo prep. med</Text>
            <View style={styles.timeValue}>
              <Text style={styles.metricValueSmall}>{currentMetrics.avgPrepTime}</Text>
              <Text style={styles.timeUnit}>min</Text>
            </View>
          </View>
        </View>

        {/* Bar Chart: Pedidos por hora */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Pedidos por hora</Text>
            <MaterialCommunityIcons name="chart-bar" size={20} color={COLORS.onSurfaceVariant} />
          </View>

          <View style={styles.chartContainer}>
            {HOURLY_DATA.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { height: `${item.value}%` },
                    timeRange === 'today' && item.value >= 80 && styles.barPeak,
                  ]}
                />
                <Text style={styles.barLabel}>{item.hour}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Products List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top 5 productos</Text>
            <TouchableOpacity onPress={handleViewAllProducts}>
              <Text style={styles.viewAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsList}>
            {TOP_PRODUCTS.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productContent}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productOrders}>
                    {product.ordersToday} pedidos {isToday ? 'hoy' : 'este período'}
                  </Text>
                </View>
                <Text style={styles.productRevenue}>+${product.revenue.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Espacio para bottom nav */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── BOTTOM NAVIGATION BAR - SÓLIDA, NO TRANSPARENTE ── */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('StaffHome')}>
          <MaterialCommunityIcons name="home-outline" size={24} color={COLORS.onSurfaceVariant} />
          <Text style={styles.navLabel}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('GestionMenu')}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={COLORS.onSurfaceVariant} />
          <Text style={styles.navLabel}>Menú</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemActive} onPress={() => navigation.popToTop()}>
          <MaterialCommunityIcons name="chart-box" size={24} color={COLORS.primary} />
          <Text style={styles.navLabelActive}>Panel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('StaffPerfil')}>
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

  /* Top Bar - Ajustado para que no se sobreponga con la barra de estado */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Scroll Content */
  scrollContent: { flex: 1 },
  scrollPadding: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },

  /* Header Section */
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 4,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeButtonActive: {
    backgroundColor: COLORS.surfaceContainerLowest,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  timeButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  /* Metrics Grid */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  metricCardWide: {
    width: '100%',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  metricValueSmall: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.green,
  },
  timeValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  timeUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },

  /* Chart Card */
  chartCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    gap: 20,
    marginBottom: 24,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 128,
    gap: 8,
    paddingHorizontal: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    width: '100%',
    maxWidth: 32,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 4,
  },
  barPeak: {
    backgroundColor: COLORS.primary,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* Section */
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* Products List */
  productsList: {
    gap: 12,
  },
  productCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainer,
  },
  productContent: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  productOrders: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* Bottom Spacer */
  bottomSpacer: { height: 24 },

  /* Bottom Navigation - SÓLIDA, NO TRANSPARENTE */
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
    backgroundColor: COLORS.surfaceContainerLowest, // ✅ SÓLIDO, no transparente
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navItemActive: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: `${COLORS.primary}1A`,
    borderRadius: 12,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  navLabelActive: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 4,
  },
});