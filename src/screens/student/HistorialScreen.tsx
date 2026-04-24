import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#630ED4',
  surface: '#F8F9FA',
  onSurface: '#191C1D',
  onSurfaceVariant: '#4A4455',
  onPrimary: '#FFFFFF',
  surfaceContainerLowest: '#FFFFFF',
  outlineVariant: '#CCC3D8',
  error: '#BA1A1A',
  green: '#16A34A',
};

const ALL_ORDERS = [
  { id: '1', orderNumber: '#A-030', date: '12 May', location: 'Cafetería Central', total: 120.00, status: 'completado' as const },
  { id: '2', orderNumber: '#A-021', date: '8 May', location: 'Cafetería Central', total: 75.50, status: 'completado' as const },
  { id: '3', orderNumber: '#A-015', date: '3 May', location: 'Cafetería Central', total: 55.00, status: 'cancelado' as const },
  { id: '4', orderNumber: '#A-009', date: '28 Abr', location: 'Cafetería Central', total: 98.00, status: 'completado' as const },
  { id: '5', orderNumber: '#A-002', date: '20 Abr', location: 'Cafetería Central', total: 45.00, status: 'completado' as const },
];

type OrderStatus = 'completado' | 'cancelado' | 'en_proceso';

export default function HistorialScreen() {
  const navigation = useNavigation<any>();

  const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
    completado: { bg: `${COLORS.green}1A`, text: COLORS.green },
    cancelado: { bg: `${COLORS.error}1A`, text: COLORS.error },
    en_proceso: { bg: `${COLORS.primary}1A`, text: COLORS.primary },
  };
  const statusLabels: Record<OrderStatus, string> = {
    completado: 'Completado',
    cancelado: 'Cancelado',
    en_proceso: 'En proceso',
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <SafeAreaView style={styles.container}>
        {/* TOP BAR */}
        <View style={[styles.topBar, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8 }]}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Historial de Pedidos</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {ALL_ORDERS.map((order) => {
            const style = statusColors[order.status];
            return (
              <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.8}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                    <Text style={[styles.statusText, { color: style.text }]}>
                      {statusLabels[order.status]}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderFooter}>
                  <View style={styles.orderMeta}>
                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="calendar" size={14} color={COLORS.onSurfaceVariant} />
                      <Text style={styles.metaText}>{order.date}</Text>
                    </View>
                    <Text style={styles.metaText}>{order.location}</Text>
                  </View>
                  <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  list: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32, gap: 12 },
  orderCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}1A`,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderNumber: { fontSize: 18, fontWeight: '700', color: COLORS.primary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  orderMeta: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.onSurfaceVariant },
  orderTotal: { fontSize: 18, fontWeight: '500', color: COLORS.onSurface, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
});