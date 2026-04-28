// src/screens/student/HomeScreen.tsx
import React from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentTabParamList, StudentStackParamList } from '../../types';

// 🎨 COLORES (consistente con SplashScreen y LoginPersonal)
const COLORS = {
  primary: '#630ED4',
  primaryContainer: '#7C3AED',
  surface: '#F8F9FA',
  onSurface: '#191C1D',
  onSurfaceVariant: '#4A4455',
  onPrimary: '#FFFFFF',
  surfaceContainerLow: '#F3F4F5',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainer: '#EDEEEF',
  tertiary: '#7D3D00',
};

// 📦 TIPOS (para cuando integremos lógica real)
type OrderStatus = 'recibido' | 'en_preparacion' | 'listo';

interface ActiveOrder {
  id: string;
  number: string;
  status: OrderStatus;
  progress: number; // 0-100
  etaMinutes: number;
  message: string;
}

// 👤 DATOS DE EJEMPLO (luego vendrán del backend/store)
const MOCK_USER = {
  name: 'Brian',
  avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEWTFMH7NMbGjAC99Dt81we2KDXfTKrbYeMg&s',
};

const MOCK_ACTIVE_ORDER: ActiveOrder | null = null;/*{
  id: '1',
  number: '#A-042',
  status: 'en_preparacion',
  progress: 65,
  etaMinutes: 8,
  message: 'Tu pedido está siendo preparado con esmero.',
};
*/
type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<StudentTabParamList, 'Home'>,
  NativeStackNavigationProp<StudentStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();

  // 🔄 En producción: const activeOrder = useOrderStore(state => state.activeOrder);
  const activeOrder = MOCK_ACTIVE_ORDER;

  const handleNotifications = () => {
    console.log('🔔 Ver notificaciones');
  };

  const handleGoToMenu = () => {
    console.log('🍽️ Navegar a Menú');
    navigation.navigate('Menu');
  };

  const handleGoToCart = () => {
    console.log('🛒 Navegar a Carrito');
    navigation.getParent()?.navigate('Carrito');
  };

  const handleGoToPromos = () => {
    console.log('🎟️ Ver promociones');
    navigation.getParent()?.navigate('Promo');
  };

  const renderActiveOrderCard = () => {
    if (!activeOrder) return null;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderLabel}>Pedido en curso</Text>
            <Text style={styles.orderNumber}>{activeOrder.number}</Text>
          </View>
          <View style={styles.etaBadge}>
            <Text style={styles.etaText}>~{activeOrder.etaMinutes} min</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, activeOrder.progress >= 0 && styles.progressLabelActive]}>
              Recibido
            </Text>
            <Text style={[styles.progressLabel, activeOrder.progress >= 50 && styles.progressLabelActive]}>
              En preparación
            </Text>
            <Text style={[styles.progressLabel, activeOrder.progress >= 100 && styles.progressLabelActive]}>
              Listo
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${activeOrder.progress}%` }]}
            />
          </View>

          <Text style={styles.orderMessage}>{activeOrder.message}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyOrderState = () => (
    <TouchableOpacity
      style={styles.emptyOrderCard}
      onPress={handleGoToMenu}
      activeOpacity={0.8}
    >
      <Text style={styles.emptyOrderTitle}>¿Tienes hambre?</Text>
      <Text style={styles.emptyOrderSubtitle}>Haz tu primer pedido del día</Text>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryContainer]}
        style={styles.emptyOrderButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emptyOrderButtonText}>Ver menú</Text>
        <MaterialCommunityIcons name="arrow-right" size={16} color={COLORS.onPrimary} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <SafeAreaView style={styles.container}>

        {/* ── TOP APP BAR ── */}
        <View style={[styles.topBar, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: MOCK_USER.avatar }}
              style={styles.avatar}
              accessibilityLabel="Foto de perfil"
            />
            <View style={styles.greeting}>
              <Text style={styles.greetingLabel}>Hola, {MOCK_USER.name}</Text>
              <Text style={styles.cafeteriaName}>YaTa</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotifications}
            accessibilityLabel="Notificaciones"
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ── CONTENIDO PRINCIPAL (SCROLL) ── */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={false}
        >

          {/* Active Order Card (condicional) */}
          {activeOrder ? renderActiveOrderCard() : renderEmptyOrderState()}

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accesos rápidos</Text>
            <View style={styles.bentoGrid}>

              {/* Card 1: Menú del día (grande) */}
              <TouchableOpacity
                style={styles.bentoCardLarge}
                onPress={handleGoToMenu}
                activeOpacity={0.9}
              >
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5Pt4dwqRwqvxK_c5e5ZBVUnpWSWyaczStZA&s'
                  }}
                  style={styles.bentoImage}
                  resizeMode="cover"
                />
                <View style={styles.bentoOverlay} />
                <View style={styles.bentoContent}>
                  <Text style={styles.bentoTitle}>Menú del día</Text>
                  <Text style={styles.bentoSubtitle}>Descubre las opciones de hoy</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Featured Announcement */}
          <View style={styles.announcementCard}>
            <View style={styles.announcementContent}>
              <View style={styles.announcementBadge}>
                <Text style={styles.announcementBadgeText}>Aviso Académico</Text>
              </View>
              <Text style={styles.announcementTitle}>
                Cafetería Central operando en horario extendido
              </Text>
              <Text style={styles.announcementText}>
                Durante la semana de exámenes finales, estaremos abiertos hasta las 22:00 hrs.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="school"
              size={80}
              color={COLORS.onSurface}
              style={styles.announcementIcon}
            />
          </View>

          {/* Espacio para el bottom nav */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ── BOTTOM NAVIGATION BAR ── */}
        <View style={styles.bottomNav}>
          {/* Inicio (Activo) */}
          <TouchableOpacity
            style={styles.navItemActive}
            onPress={() => console.log('🏠 Inicio')}
          >
            <MaterialCommunityIcons name="home" size={24} color={COLORS.primary} />
            <Text style={styles.navLabelActive}>Inicio</Text>
          </TouchableOpacity>

          {/* Menú */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={handleGoToMenu}
          >
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={COLORS.onSurface} />
            <Text style={styles.navLabel}>Menú</Text>
          </TouchableOpacity>

          {/* Carrito */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={handleGoToCart}
          >
            <MaterialCommunityIcons name="cart-outline" size={24} color={COLORS.onSurface} />
            <Text style={styles.navLabel}>Carrito</Text>
          </TouchableOpacity>

          {/* Perfil */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => console.log('👤 Perfil')}
          >
            <MaterialCommunityIcons name="account-outline" size={24} color={COLORS.onSurface} />
            <Text style={styles.navLabel}>Perfil</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
  },
  greeting: {
    gap: 2,
  },
  greetingLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cafeteriaName: {
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
  scrollContent: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100, // Espacio para bottom nav
  },

  /* Order Card */
  orderCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    marginBottom: 32,
  },
  emptyOrderCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    marginBottom: 32,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: -2,
  },
  etaBadge: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  progressContainer: {
    gap: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressLabelActive: {
    color: COLORS.primary,
    opacity: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
  },
  orderMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },
  emptyOrderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  emptyOrderSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyOrderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onPrimary,
  },

  /* Section */
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 16,
  },

  /* Bento Grid */
  bentoGrid: {
    gap: 16,
  },
  bentoCardLarge: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bentoImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  bentoOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(25, 28, 29, 0.5)',
  },
  bentoContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  bentoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onPrimary,
    marginBottom: 4,
  },
  bentoSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: `${COLORS.onPrimary}CC`,
  },
  bentoCardSmall: {
    backgroundColor: `${COLORS.primary}1A`,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  bentoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  bentoIconContainerPrimary: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  bentoLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  /* Announcement Card */
  announcementCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  announcementContent: {
    position: 'relative',
    zIndex: 1,
    gap: 8,
  },
  announcementBadge: {
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  announcementBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    lineHeight: 24,
  },
  announcementText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  announcementIcon: {
    position: 'absolute',
    bottom: -16,
    right: -16,
    opacity: 0.05,
  },

  /* Bottom Spacer */
  bottomSpacer: {
    height: 24,
  },

  /* Bottom Navigation */
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingTop: 12,
    backgroundColor: `${COLORS.surface}CC`,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    opacity: 0.6,
  },
  navItemActive: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: `${COLORS.primary}1A`,
    borderRadius: 12,
    transform: [{ scale: 1.1 }],
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurface,
    marginTop: 4,
  },
  navLabelActive: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 4,
  },
});