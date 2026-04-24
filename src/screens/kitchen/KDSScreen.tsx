import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Modal,
  BackHandler,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 🎨 COLORES
const COLORS = {
  primary: '#630ED4',
  primaryContainer: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDim: 'rgba(99,14,212,0.15)',
  surface: '#F8F9FA',
  onSurface: '#191C1D',
  onSurfaceVariant: '#4A4455',
  onPrimary: '#FFFFFF',
  surfaceContainerLow: '#F3F4F5',
  surfaceContainerLowest: '#FFFFFF',
  outlineVariant: '#CCC3D8',
  error: '#BA1A1A',
  errorDim: 'rgba(186,26,26,0.12)',
  green: '#16A34A',
  greenLight: '#22C55E',
  greenDim: 'rgba(22,163,74,0.12)',
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  amberDim: 'rgba(245,158,11,0.12)',
  red: '#EF4444',
  border: '#E5E7EB',
};

type OrderStatus = 'pendiente' | 'en_preparacion' | 'listo';
type PaymentMethod = 'tarjeta' | 'efectivo';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  customization?: string;
  specialInstruction?: string;
  done: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  startedAt?: Date;
  createdAt: Date;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  priority: boolean;
  specialInstructions?: string;
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const now = new Date();
const MOCK_ORDERS: Order[] = [
  {
    id: '1', orderNumber: '#A-242',
    items: [
      {
        id: '1a',
        name: 'Chilaquiles Verdes',
        quantity: 2,
        customization: 'Extra crema, sin cebolla',
        specialInstruction: 'Salsa aparte por favor',
        done: false
      },
      { id: '1b', name: 'Café de Olla', quantity: 1, done: false },
    ],
    createdAt: new Date(now.getTime() - 2 * 60000),
    paymentMethod: 'tarjeta', status: 'pendiente', priority: true,
    specialInstructions: 'Cliente con prisa',
  },
  {
    id: '2', orderNumber: '#A-243',
    items: [
      { id: '2a', name: 'Baguette de Pollo', quantity: 1, customization: 'Sin mayonesa', done: false },
      { id: '2b', name: 'Jugo de Naranja', quantity: 2, done: false },
    ],
    createdAt: new Date(now.getTime() - 5 * 60000),
    paymentMethod: 'efectivo', status: 'pendiente', priority: false,
  },
  {
    id: '3', orderNumber: '#A-240',
    items: [
      { id: '3a', name: 'Bowl Académico', quantity: 1, customization: 'Sin quinoa, extra garbanzos', done: true },
      { id: '3b', name: 'Agua de Jamaica', quantity: 1, done: false },
      { id: '3c', name: 'Cuernito de Chocolate', quantity: 2, done: true },
    ],
    createdAt: new Date(now.getTime() - 8 * 60000),
    startedAt: new Date(now.getTime() - 4 * 60000),
    paymentMethod: 'tarjeta', status: 'en_preparacion', priority: false,
    specialInstructions: 'Entregar en la mesa 5',
  },
  {
    id: '4', orderNumber: '#A-239',
    items: [
      { id: '4a', name: 'Bagel de Huevo', quantity: 1, customization: 'Huevo bien cocido', done: true },
      { id: '4b', name: 'Té Helado', quantity: 1, done: true },
    ],
    createdAt: new Date(now.getTime() - 15 * 60000),
    startedAt: new Date(now.getTime() - 12 * 60000),
    paymentMethod: 'efectivo', status: 'listo', priority: false,
  },
  {
    id: '5', orderNumber: '#A-238',
    items: [
      { id: '5a', name: 'Ensalada César', quantity: 1, customization: 'Sin crutones, aderezo aparte', done: true },
      { id: '5b', name: 'Limonada Mineral', quantity: 2, done: true },
    ],
    createdAt: new Date(now.getTime() - 20 * 60000),
    startedAt: new Date(now.getTime() - 18 * 60000),
    paymentMethod: 'tarjeta', status: 'listo', priority: false,
  },
];

// ── UTILS ──────────────────────────────────────────────────────────────────
const formatTime = (date: Date) =>
  date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

const getElapsedMin = (date: Date) =>
  Math.floor((Date.now() - date.getTime()) / 60000);

const getUrgencyColor = (elapsedMin: number) => {
  if (elapsedMin < 5) return COLORS.green;
  if (elapsedMin < 10) return COLORS.amber;
  return COLORS.red;
};

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function KDSScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Forzar orientación horizontal
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Pulso para órdenes urgentes
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Manejar botón de retroceso
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (modalVisible) {
        setModalVisible(false);
        return true;
      }
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, [modalVisible, navigation]);

  const handleStartPrep = (orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'en_preparacion', startedAt: new Date() } : o
    ));
  };

  const handleToggleItem = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, items: o.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) }
        : o
    ));
  };

  const handleMarkReady = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    const pendingItems = order?.items.filter(i => !i.done).length ?? 0;
    if (pendingItems > 0) {
      Alert.alert(
        '¿Marcar como listo?',
        `Quedan ${pendingItems} ${pendingItems === 1 ? 'ítem sin' : 'ítems sin'} marcar. ¿Continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Marcar listo', onPress: () => setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'listo' } : o)) },
        ]
      );
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'listo' } : o));
    }
  };

  const handleDeliverOrder = (orderId: string) => {
    Alert.alert(
      'Entregar pedido',
      '¿Confirmas que el pedido ha sido entregado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Entregar', onPress: () => setOrders(prev => prev.filter(o => o.id !== orderId)) },
      ]
    );
  };

  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const pendingOrders = orders.filter(o => o.status === 'pendiente');
  const prepOrders = orders.filter(o => o.status === 'en_preparacion');
  const readyOrders = orders.filter(o => o.status === 'listo');

  // Renderizar detalle del pedido en modal
  const renderOrderDetailModal = () => {
    if (!selectedOrder) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del Pedido</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Orden Number */}
              <View style={styles.modalOrderNumber}>
                <MaterialCommunityIcons name="receipt" size={20} color={COLORS.primary} />
                <Text style={styles.modalOrderNumberText}>{selectedOrder.orderNumber}</Text>
              </View>

              {/* Tiempo */}
              <View style={styles.modalInfoRow}>
                <View style={styles.modalInfoItem}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.onSurfaceVariant} />
                  <Text style={styles.modalInfoText}>
                    Hora: {formatTime(selectedOrder.createdAt)}
                  </Text>
                </View>
                <View style={styles.modalInfoItem}>
                  <MaterialCommunityIcons name="cash" size={16} color={COLORS.onSurfaceVariant} />
                  <Text style={styles.modalInfoText}>
                    Pago: {selectedOrder.paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}
                  </Text>
                </View>
              </View>

              {/* Instrucciones especiales del pedido */}
              {selectedOrder.specialInstructions && (
                <View style={styles.modalSpecialInstructions}>
                  <Text style={styles.modalSectionTitle}>Instrucciones especiales</Text>
                  <Text style={styles.modalSpecialText}>{selectedOrder.specialInstructions}</Text>
                </View>
              )}

              {/* Items del pedido */}
              <Text style={styles.modalSectionTitle}>Productos</Text>
              {selectedOrder.items.map((item, idx) => (
                <View key={item.id} style={styles.modalItemCard}>
                  <View style={styles.modalItemHeader}>
                    <Text style={styles.modalItemQuantity}>{item.quantity}×</Text>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    {item.done && (
                      <View style={styles.modalItemDoneBadge}>
                        <Text style={styles.modalItemDoneText}>✓ Listo</Text>
                      </View>
                    )}
                  </View>

                  {item.customization && (
                    <View style={styles.modalItemCustomization}>
                      <MaterialCommunityIcons name="pencil" size={12} color={COLORS.primary} />
                      <Text style={styles.modalItemCustomizationText}>{item.customization}</Text>
                    </View>
                  )}

                  {item.specialInstruction && (
                    <View style={styles.modalItemInstruction}>
                      <MaterialCommunityIcons name="note-text" size={12} color={COLORS.amber} />
                      <Text style={styles.modalItemInstructionText}>{item.specialInstruction}</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // RENDER: ORDER CARD
  const renderOrderCard = (order: Order) => {
    const elapsed = getElapsedMin(order.createdAt);
    const prepElapsed = order.startedAt ? getElapsedMin(order.startedAt) : 0;
    const isPending = order.status === 'pendiente';
    const isPrep = order.status === 'en_preparacion';
    const isReady = order.status === 'listo';
    const isUrgent = elapsed >= 8 && !isReady;
    const urgencyColor = getUrgencyColor(elapsed);
    const doneCount = order.items.filter(i => i.done).length;
    const totalCount = order.items.length;
    const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

    return (
      <Animated.View
        key={order.id}
        style={[
          styles.card,
          isPending && styles.cardPending,
          isPrep && styles.cardPrep,
          isReady && styles.cardReady,
          isUrgent && { transform: [{ scale: pulseAnim }] },
        ]}
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => handleViewOrderDetail(order)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <View style={[styles.paymentBadge, order.paymentMethod === 'tarjeta' ? styles.paymentCard : styles.paymentCash]}>
              <Text style={styles.paymentText}>
                {order.paymentMethod === 'tarjeta' ? '💳' : '💵'}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="eye" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Timer */}
        <View style={styles.timerRow}>
          <View style={styles.timerItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={urgencyColor} />
            <Text style={[styles.timerText, { color: urgencyColor }]}>
              {elapsed < 1 ? 'Ahora' : `${elapsed} min`}
            </Text>
          </View>
          {isPrep && order.startedAt && (
            <View style={styles.timerItem}>
              <MaterialCommunityIcons name="chef-hat" size={14} color={COLORS.primary} />
              <Text style={[styles.timerText, { color: COLORS.primary }]}>
                Prep: {prepElapsed} min
              </Text>
            </View>
          )}
        </View>

        {/* Progress */}
        {isPrep && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressText}>{doneCount}/{totalCount}</Text>
          </View>
        )}

        {/* Items preview */}
        <View style={styles.itemsPreview}>
          {order.items.slice(0, 2).map(item => (
            <View key={item.id} style={styles.itemPreviewRow}>
              <Text style={styles.itemPreviewText}>
                <Text style={styles.itemQuantity}>{item.quantity}×</Text> {item.name}
              </Text>
              {item.customization && (
                <MaterialCommunityIcons name="pencil" size={12} color={COLORS.onSurfaceVariant} />
              )}
            </View>
          ))}
          {order.items.length > 2 && (
            <Text style={styles.moreItemsText}>+{order.items.length - 2} más...</Text>
          )}
        </View>

        {/* Actions */}
        {isPending && (
          <TouchableOpacity style={styles.btnPending} onPress={() => handleStartPrep(order.id)}>
            <MaterialCommunityIcons name="play-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.btnPendingText}>Iniciar preparación</Text>
          </TouchableOpacity>
        )}
        {isPrep && (
          <TouchableOpacity style={[styles.btnReady, doneCount === totalCount && styles.btnReadyFull]} onPress={() => handleMarkReady(order.id)}>
            <MaterialCommunityIcons name="check-all" size={20} color={COLORS.onPrimary} />
            <Text style={styles.btnReadyText}>Marcar como listo</Text>
          </TouchableOpacity>
        )}
        {isReady && (
          <TouchableOpacity style={styles.btnDeliver} onPress={() => handleDeliverOrder(order.id)}>
            <MaterialCommunityIcons name="bell-ring-outline" size={20} color={COLORS.green} />
            <Text style={styles.btnDeliverText}>Entregar pedido</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  // RENDER: COLUMN
  const renderColumn = (
    title: string,
    ordersList: Order[],
    accent: string,
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    bgColor: string
  ) => (
    <View style={[styles.column, { backgroundColor: bgColor }]}>
      <View style={[styles.columnHeader, { borderBottomColor: `${accent}30` }]}>
        <View style={styles.columnTitleContainer}>
          <View style={[styles.columnDot, { backgroundColor: accent }]} />
          <Text style={styles.columnTitle}>{title}</Text>
        </View>
        <View style={[styles.columnCount, { backgroundColor: `${accent}15` }]}>
          <Text style={[styles.columnCountText, { color: accent }]}>{ordersList.length}</Text>
        </View>
      </View>
      <ScrollView
        style={styles.columnScroll}
        contentContainerStyle={styles.columnScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ordersList.length === 0 ? (
          <View style={styles.emptyColumn}>
            <MaterialCommunityIcons name={icon} size={48} color={COLORS.outlineVariant} />
            <Text style={styles.emptyColumnText}>Sin órdenes</Text>
          </View>
        ) : (
          ordersList.map(renderOrderCard)
        )}
      </ScrollView>
    </View>
  );

  const urgentCount = pendingOrders.filter(o => getElapsedMin(o.createdAt) >= 8).length;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <SafeAreaView style={styles.container}>

        {/* Top Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.topBarLeft}>
            <MaterialCommunityIcons name="chef-hat" size={28} color={COLORS.primary} />
            <Text style={styles.topBarTitle}>KDS - Cocina</Text>
            <View style={styles.clockBadge}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.onSurfaceVariant} />
              <Text style={styles.clockText}>{formatTime(currentTime)}</Text>
            </View>
            {urgentCount > 0 && (
              <View style={styles.urgentBadge}>
                <MaterialCommunityIcons name="lightning-bolt" size={12} color={COLORS.amber} />
                <Text style={styles.urgentText}>{urgentCount} urgente{urgentCount > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>

          <View style={styles.topBarRight}>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>En línea</Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.amber }]}>{pendingOrders.length}</Text>
                <Text style={styles.statLabel}>Espera</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.primary }]}>{prepOrders.length}</Text>
                <Text style={styles.statLabel}>Prep.</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.green }]}>{readyOrders.length}</Text>
                <Text style={styles.statLabel}>Listos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Kanban Board */}
        <View style={styles.kanban}>
          {renderColumn('Pendientes', pendingOrders, COLORS.amber, 'clock-outline', COLORS.surface)}
          {renderColumn('En preparación', prepOrders, COLORS.primary, 'chef-hat', COLORS.surfaceContainerLow)}
          {renderColumn('Listos', readyOrders, COLORS.green, 'check-circle-outline', COLORS.surface)}
        </View>

        {/* Modal de detalle */}
        {renderOrderDetailModal()}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  clockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  clockText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.amberDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.amber,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.greenDim,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.green,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },

  // Kanban
  kanban: {
    flex: 1,
    flexDirection: 'row',
    gap: 1,
    backgroundColor: COLORS.border,
  },

  // Column
  column: {
    flex: 1,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
  },
  columnTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  columnDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  columnCount: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  columnCountText: {
    fontSize: 13,
    fontWeight: '800',
  },
  columnScroll: {
    flex: 1,
  },
  columnScrollContent: {
    padding: 12,
    gap: 12,
  },
  emptyColumn: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyColumnText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },

  // Card
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardPending: {
    borderLeftColor: COLORS.amber,
  },
  cardPrep: {
    borderLeftColor: COLORS.primary,
  },
  cardReady: {
    borderLeftColor: COLORS.green,
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 6,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  paymentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  paymentCard: {
    backgroundColor: COLORS.primaryDim,
  },
  paymentCash: {
    backgroundColor: COLORS.greenDim,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },

  // Timer
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  timerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    width: 30,
    textAlign: 'right',
  },

  // Items Preview
  itemsPreview: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  itemPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPreviewText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  itemQuantity: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  moreItemsText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Buttons
  btnPending: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    marginTop: 6,
  },
  btnPendingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  btnReady: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}80`,
    marginTop: 6,
  },
  btnReadyFull: {
    backgroundColor: COLORS.primary,
  },
  btnReadyText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
  btnDeliver: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.greenDim,
    borderWidth: 1,
    borderColor: `${COLORS.green}40`,
    marginTop: 6,
  },
  btnDeliverText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.green,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 24,
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  modalScroll: {
    maxHeight: '80%',
  },
  modalOrderNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryDim,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  modalOrderNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalInfoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalInfoText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  modalSpecialInstructions: {
    backgroundColor: COLORS.amberDim,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  modalSpecialText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  modalItemCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  modalItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  modalItemQuantity: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
    flex: 1,
  },
  modalItemDoneBadge: {
    backgroundColor: COLORS.greenDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  modalItemDoneText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.green,
  },
  modalItemCustomization: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalItemCustomizationText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  modalItemInstruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  modalItemInstructionText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.amber,
    flex: 1,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
});