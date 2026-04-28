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
      { id: '1c', name: 'Pan Dulce', quantity: 3, customization: 'Dos de concha, uno de elote', done: false },
    ],
    createdAt: new Date(now.getTime() - 2 * 60000),
    paymentMethod: 'tarjeta', status: 'pendiente', priority: true,
    specialInstructions: 'Cliente con prisa, entregar en mesa 3',
  },
  {
    id: '2', orderNumber: '#A-243',
    items: [
      { id: '2a', name: 'Baguette de Pollo', quantity: 1, customization: 'Sin mayonesa, pan integral', specialInstruction: 'Pollo bien cocido', done: false },
      { id: '2b', name: 'Jugo de Naranja', quantity: 2, done: false },
    ],
    createdAt: new Date(now.getTime() - 5 * 60000),
    paymentMethod: 'efectivo', status: 'pendiente', priority: false,
  },
  {
    id: '3', orderNumber: '#A-240',
    items: [
      { id: '3a', name: 'Bowl Académico', quantity: 1, customization: 'Sin quinoa, extra garbanzos', done: false },
      { id: '3b', name: 'Agua de Jamaica', quantity: 1, done: false },
      { id: '3c', name: 'Cuernito de Chocolate', quantity: 2, done: false },
    ],
    createdAt: new Date(now.getTime() - 8 * 60000),
    startedAt: new Date(now.getTime() - 4 * 60000),
    paymentMethod: 'tarjeta', status: 'en_preparacion', priority: false,
    specialInstructions: 'Entregar en la mesa 5',
  },
  {
    id: '4', orderNumber: '#A-239',
    items: [
      { id: '4a', name: 'Bagel de Huevo', quantity: 1, customization: 'Huevo bien cocido', specialInstruction: 'Con aguacate extra', done: true },
      { id: '4b', name: 'Té Helado', quantity: 1, done: true },
    ],
    createdAt: new Date(now.getTime() - 15 * 60000),
    startedAt: new Date(now.getTime() - 12 * 60000),
    paymentMethod: 'efectivo', status: 'listo', priority: false,
  },
  {
    id: '5', orderNumber: '#A-238',
    items: [
      { id: '5a', name: 'Ensalada César', quantity: 1, customization: 'Sin crutones, aderezo aparte', specialInstruction: 'Pollo a la plancha', done: true },
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
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;

      const updatedItems = o.items.map(i =>
        i.id === itemId ? { ...i, done: !i.done } : i
      );

      // Verificar si todos los items están listos
      const allItemsReady = updatedItems.every(i => i.done);

      // Si todos están listos y el estado es 'en_preparacion', preguntar si marcar como listo
      if (allItemsReady && o.status === 'en_preparacion') {
        setTimeout(() => {
          Alert.alert(
            '✅ Todos los items están listos',
            '¿Deseas marcar este pedido como listo para entregar?',
            [
              { text: 'No', style: 'cancel' },
              { text: 'Sí, marcar como listo', onPress: () => handleMarkReady(orderId) }
            ]
          );
        }, 100);
      }

      return { ...o, items: updatedItems };
    }));
  };

  const handleMarkReady = (orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'listo' } : o
    ));
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

  // Renderizar item individual con checkbox y observaciones
  const renderOrderItem = (orderId: string, item: OrderItem, showCheckbox: boolean = false) => {
    const hasCustomization = !!item.customization;
    const hasInstruction = !!item.specialInstruction;

    const itemContent = (
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[
            styles.itemQuantity,
            !showCheckbox && item.done && styles.itemDoneText
          ]}>{item.quantity}×</Text>
          <Text style={[
            styles.itemName,
            !showCheckbox && item.done && styles.itemDoneText
          ]}>{item.name}</Text>
        </View>

        {/* Customización del producto */}
        {hasCustomization && (
          <View style={styles.itemCustomization}>
            <MaterialCommunityIcons name="pencil" size={12} color={COLORS.primary} />
            <Text style={styles.itemCustomizationText}>{item.customization}</Text>
          </View>
        )}

        {/* Instrucción especial del producto */}
        {hasInstruction && (
          <View style={styles.itemInstruction}>
            <MaterialCommunityIcons name="note-text" size={12} color={COLORS.amber} />
            <Text style={styles.itemInstructionText}>💡 {item.specialInstruction}</Text>
          </View>
        )}
      </View>
    );

    // Si showCheckbox es true, mostrar con checkbox (solo para preparación)
    if (showCheckbox) {
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.itemCard}
          onPress={() => handleToggleItem(orderId, item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.itemCheckbox}>
            <MaterialCommunityIcons
              name={item.done ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
              size={22}
              color={item.done ? COLORS.green : COLORS.onSurfaceVariant}
            />
          </View>
          {itemContent}
        </TouchableOpacity>
      );
    }

    // Si showCheckbox es false, mostrar sin checkbox (para pendiente y listo)
    return (
      <View key={item.id} style={[styles.itemCard, styles.itemCardReadOnly]}>
        <View style={styles.itemCheckboxPlaceholder} />
        {itemContent}
      </View>
    );
  };

  // Renderizar detalle del pedido en modal (con checkboxes siempre visibles)
  const renderOrderDetailModal = () => {
    if (!selectedOrder) return null;

    const doneCount = selectedOrder.items.filter(i => i.done).length;
    const totalCount = selectedOrder.items.length;
    const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

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

              {/* Progress en modal */}
              <View style={styles.modalProgressContainer}>
                <View style={styles.modalProgressBar}>
                  <View style={[styles.modalProgressFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={styles.modalProgressText}>{doneCount}/{totalCount} preparados</Text>
              </View>

              {/* Tiempo y pago */}
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
                  <Text style={styles.modalSectionTitle}>Instrucciones generales</Text>
                  <Text style={styles.modalSpecialText}>{selectedOrder.specialInstructions}</Text>
                </View>
              )}

              {/* Items del pedido con checkboxes */}
              <Text style={styles.modalSectionTitle}>Productos</Text>
              {selectedOrder.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.modalItemCard}
                  onPress={() => {
                    handleToggleItem(selectedOrder.id, item.id);
                    // Actualizar el selectedOrder también
                    setSelectedOrder(prev => prev ? {
                      ...prev,
                      items: prev.items.map(i =>
                        i.id === item.id ? { ...i, done: !i.done } : i
                      )
                    } : null);
                  }}
                >
                  <View style={styles.modalItemHeader}>
                    <MaterialCommunityIcons
                      name={item.done ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                      size={22}
                      color={item.done ? COLORS.green : COLORS.onSurfaceVariant}
                    />
                    <View style={styles.modalItemContent}>
                      <View style={styles.modalItemTitleRow}>
                        <Text style={styles.modalItemQuantity}>{item.quantity}×</Text>
                        <Text style={[styles.modalItemName, item.done && styles.modalItemDone]}>{item.name}</Text>
                      </View>

                      {item.customization && (
                        <View style={styles.modalItemCustomization}>
                          <Text style={styles.modalItemCustomizationText}>✏️ {item.customization}</Text>
                        </View>
                      )}

                      {item.specialInstruction && (
                        <View style={styles.modalItemInstruction}>
                          <Text style={styles.modalItemInstructionText}>📝 {item.specialInstruction}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              {selectedOrder.status === 'pendiente' && (
                <TouchableOpacity
                  style={styles.modalStartButton}
                  onPress={() => {
                    handleStartPrep(selectedOrder.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalStartButtonText}>Iniciar preparación</Text>
                </TouchableOpacity>
              )}

              {selectedOrder.status === 'en_preparacion' && (
                <TouchableOpacity
                  style={[styles.modalReadyButton, doneCount === totalCount && styles.modalReadyButtonFull]}
                  onPress={() => {
                    handleMarkReady(selectedOrder.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalReadyButtonText}>Marcar como listo</Text>
                </TouchableOpacity>
              )}

              {selectedOrder.status === 'listo' && (
                <TouchableOpacity
                  style={styles.modalDeliverButton}
                  onPress={() => {
                    handleDeliverOrder(selectedOrder.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalDeliverButtonText}>Entregar pedido</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // RENDER: ORDER CARD (con items editables solo en preparación)
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
        {/* Header con número de orden y botón de detalle */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.cardHeaderLeft}
            onPress={() => handleViewOrderDetail(order)}
            activeOpacity={0.7}
          >
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <View style={[styles.paymentBadge, order.paymentMethod === 'tarjeta' ? styles.paymentCard : styles.paymentCash]}>
              <Text style={styles.paymentText}>
                {order.paymentMethod === 'tarjeta' ? '💳' : '💵'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => handleViewOrderDetail(order)}
          >
            <MaterialCommunityIcons name="eye" size={20} color={COLORS.primary} />
            <Text style={styles.detailButtonText}>Detalle</Text>
          </TouchableOpacity>
        </View>

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

        {/* Progress Bar - Solo mostrar en preparación */}
        {isPrep && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressText}>{doneCount}/{totalCount}</Text>
          </View>
        )}

        {/* Items list - Mostrar checkboxes solo en preparación */}
        <View style={styles.itemsList}>
          {order.items.map(item => renderOrderItem(order.id, item, isPrep))}
        </View>

        {/* Actions */}
        {isPending && (
          <TouchableOpacity style={styles.btnPending} onPress={() => handleStartPrep(order.id)}>
            <MaterialCommunityIcons name="play-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.btnPendingText}>Iniciar preparación</Text>
          </TouchableOpacity>
        )}

        {isPrep && (
          <TouchableOpacity
            style={[styles.btnReady, doneCount === totalCount && styles.btnReadyFull]}
            onPress={() => handleMarkReady(order.id)}
          >
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
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryDim,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
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
    width: 35,
    textAlign: 'right',
  },

  // Items List
  itemsList: {
    gap: 8,
    maxHeight: 180,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 10,
    padding: 10,
  },
  itemCardReadOnly: {
    opacity: 0.85,
  },
  itemCheckbox: {
    paddingTop: 2,
  },
  itemCheckboxPlaceholder: {
    width: 22,
    height: 22,
    paddingTop: 2,
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemQuantity: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
    flex: 1,
  },
  itemDoneText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  itemCustomization: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCustomizationText: {
    fontSize: 11,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  itemInstruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemInstructionText: {
    fontSize: 11,
    color: COLORS.amber,
    fontStyle: 'italic',
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
    maxHeight: '70%',
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
  modalProgressContainer: {
    marginBottom: 16,
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textAlign: 'right',
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
    alignItems: 'flex-start',
    gap: 10,
  },
  modalItemContent: {
    flex: 1,
    gap: 4,
  },
  modalItemTitleRow: {
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
  modalItemDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  modalItemCustomization: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
  },
  modalItemCustomizationText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  modalItemInstruction: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.amber,
  },
  modalItemInstructionText: {
    fontSize: 12,
    color: COLORS.amber,
    fontStyle: 'italic',
  },
  modalActions: {
    marginTop: 16,
    gap: 10,
  },
  modalStartButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalStartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
  modalReadyButton: {
    backgroundColor: `${COLORS.primary}80`,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalReadyButtonFull: {
    backgroundColor: COLORS.primary,
  },
  modalReadyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
  modalDeliverButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDeliverButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
});