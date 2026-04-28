// src/screens/student/HistorialScreen.tsx
// Conectado al microservicio de Pagos — historial real por usuario
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getUserPaymentHistory, getPaymentStatusLabel, Payment } from '../../services/paymentService';

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

// 👤 Reemplaza con tu AuthContext cuando lo tengas
const CURRENT_USER_ID = 'user-demo-001';

type OrderStatus = 'completed' | 'pending' | 'failed' | 'refunded';

const STATUS_MAP: Record<OrderStatus, { bg: string; text: string; label: string; icon: string }> = {
  completed: { bg: `${COLORS.green}1A`,   text: COLORS.green,   label: 'Completado',          icon: 'check-circle-outline' },
  pending:   { bg: `${COLORS.primary}1A`, text: COLORS.primary, label: 'Efectivo pendiente',   icon: 'cash-clock' },
  failed:    { bg: `${COLORS.error}1A`,   text: COLORS.error,   label: 'Fallido',              icon: 'close-circle-outline' },
  refunded:  { bg: `${COLORS.onSurface}14`, text: COLORS.onSurfaceVariant, label: 'Reembolsado', icon: 'cash-refund' },
};

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(new Date(iso));
  } catch {
    return '';
  }
}

export default function HistorialScreen() {
  const navigation = useNavigation<any>();

  const [payments, setPayments]     = useState<Payment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const loadHistory = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const data = await getUserPaymentHistory(CURRENT_USER_ID);
      // Más reciente primero
      setPayments(data.sort((a: any, b: any) =>
        (b.created_at ?? '').localeCompare(a.created_at ?? '')
      ));
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo cargar el historial.');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const methodLabel = (method: string) =>
    method === 'cash' ? 'Efectivo' : 'Tarjeta';
  const methodIcon  = (method: string) =>
    method === 'cash' ? 'cash' : 'credit-card-outline';

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <SafeAreaView style={styles.container}>

        {/* TOP BAR */}
        <View style={[styles.topBar, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8 }]}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Historial de Pagos</Text>
          <View style={styles.iconButton} />
        </View>

        {/* LOADING */}
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando historial...</Text>
          </View>
        )}

        {/* ERROR */}
        {!loading && error && (
          <View style={styles.centered}>
            <MaterialCommunityIcons name="wifi-off" size={48} color={COLORS.outlineVariant} />
            <Text style={styles.errorTitle}>Sin conexión</Text>
            <Text style={styles.errorSub}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadHistory()}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LISTA */}
        {!loading && !error && (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadHistory(true)}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          >
            {payments.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="receipt-text-outline" size={56} color={COLORS.outlineVariant} />
                <Text style={styles.emptyTitle}>Sin historial</Text>
                <Text style={styles.emptySub}>Tus pagos aparecerán aquí después de tu primer pedido.</Text>
              </View>
            ) : (
              payments.map(payment => {
                const st = STATUS_MAP[payment.status as OrderStatus] ?? STATUS_MAP.pending;
                return (
                  <View key={payment.id} style={styles.orderCard}>
                    {/* Header */}
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderNumber}>
                        #{payment.order_id.slice(-6).toUpperCase()}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                        <MaterialCommunityIcons name={st.icon as any} size={11} color={st.text} />
                        <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                      </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.orderFooter}>
                      <View style={styles.orderMeta}>
                        <View style={styles.metaRow}>
                          <MaterialCommunityIcons name={methodIcon(payment.method) as any} size={14} color={COLORS.onSurfaceVariant} />
                          <Text style={styles.metaText}>{methodLabel(payment.method)}</Text>
                          {payment.card_last4 && (
                            <Text style={styles.metaText}>···· {payment.card_last4}</Text>
                          )}
                        </View>
                        {(payment as any).created_at && (
                          <View style={styles.metaRow}>
                            <MaterialCommunityIcons name="calendar" size={14} color={COLORS.onSurfaceVariant} />
                            <Text style={styles.metaText}>{formatDate((payment as any).created_at)}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.orderTotal}>${payment.amount.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })
            )}
            <View style={{ height: 32 }} />
          </ScrollView>
        )}

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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  loadingText: { fontSize: 14, color: COLORS.onSurfaceVariant },
  errorTitle: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface },
  errorSub: { fontSize: 14, color: COLORS.onSurfaceVariant, textAlign: 'center' },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 8 },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.onPrimary },
  list: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32, gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface },
  emptySub: { fontSize: 14, color: COLORS.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
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
  orderNumber: {
    fontSize: 18, fontWeight: '700', color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  orderMeta: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.onSurfaceVariant },
  orderTotal: {
    fontSize: 18, fontWeight: '500', color: COLORS.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});