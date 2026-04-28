// src/screens/student/CheckoutScreen.tsx
// Conectado al microservicio Payment (FastAPI en puerto 8002)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { API_URLS } from '../../config/apiConfig';

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
  surfaceContainerHigh: '#E7E8E9',
  outline: '#7B7487',
  outlineVariant: '#CCC3D8',
};

// 📦 TIPOS
type PaymentMethod = 'card' | 'cash';

interface CardFormData {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

// 👤 DATOS MOCK de usuario — reemplaza con tu AuthContext cuando lo tengas
const MOCK_USER = {
  id: 'user-demo-001',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARm1f6uRHvdlyTriTFdd4T5WeLoHHFfzPkYLkXvQXpTJg3HJShK5YN5c2otU437_0yxMUAXngKHTknjxxBCF3eVmogWa75X1wGp9XWmTaiux906Nsn6vlxI8cCyHDYehB0pPn467uYAJ16lV77HBgOD9RHintb1g2YE_OL6LwhDcml_o7xNCpi9PEuGHCOUJqNCCI7lMyIutBsrGmehrd-gWg3sEX8bI1hUEvhn87djwLqouNWnmeQUGspwCJ4',
};

export default function CheckoutScreen({ route, navigation }: any) {
  // El total se recibe desde la pantalla anterior (CarritoScreen)
  const ORDER_TOTAL: number = route?.params?.total ?? 0;
  const ORDER_ID: string    = route?.params?.orderId ?? `order-${Date.now()}`;

  const clearCart = useCartStore(s => s.clearCart);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardData, setCardData] = useState<CardFormData>({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [generateReceipt, setGenerateReceipt] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🔧 HANDLERS
  const handleGoBack = () => navigation.goBack();

  const handleUpdateCardField = (field: keyof CardFormData, value: string) => {
    let v = value;
    if (field === 'number') {
      v = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    } else if (field === 'expiry') {
      v = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    } else if (field === 'cvv') {
      v = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardData(prev => ({ ...prev, [field]: v }));
  };

  // ── Llamada al microservicio de pagos ─────────────────────────────────────
  const processPaymentWithService = async (): Promise<string> => {
    const body: Record<string, any> = {
      order_id: ORDER_ID,
      user_id: MOCK_USER.id,
      amount: ORDER_TOTAL,
      method: paymentMethod,
      generate_receipt: generateReceipt,
    };

    if (paymentMethod === 'card') {
      body.card_last4  = cardData.number.replace(/\s/g, '').slice(-4);
      body.card_holder = cardData.name;
    }

    const res = await fetch(`${API_URLS.PAYMENT_SERVICE}/payments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail ?? `Error del servidor: ${res.status}`);
    }

    const payment = await res.json();

    // El microservicio retorna status: 'completed' | 'pending' | 'failed'
    if (payment.status === 'failed') {
      throw new Error(payment.failure_reason ?? 'Pago rechazado por el gateway');
    }

    return payment.id; // id del pago para el seguimiento
  };

  const handleConfirmOrder = async () => {
    // Validaciones locales
    if (paymentMethod === 'card') {
      if (cardData.number.replace(/\s/g, '').length < 16) {
        Alert.alert('Tarjeta inválida', 'Ingresa los 16 dígitos de tu tarjeta.');
        return;
      }
      if (cardData.cvv.length < 3) {
        Alert.alert('CVV inválido', 'El CVV debe tener 3 o 4 dígitos.');
        return;
      }
      if (!cardData.name.trim()) {
        Alert.alert('Nombre requerido', 'Ingresa el nombre como aparece en la tarjeta.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const paymentId = await processPaymentWithService();

      // Limpia el carrito después del pago exitoso
      clearCart();

      // Navegar al seguimiento del pedido
      navigation.reset({
        index: 0,
        routes: [
          { name: 'StudentTabs' },
          { name: 'Seguimiento', params: { orderId: ORDER_ID, paymentId } },
        ],
      });

    } catch (e: any) {
      const msg = e?.message ?? 'No se pudo procesar el pago. Intenta de nuevo.';
      Alert.alert(
        paymentMethod === 'cash' ? 'Error al registrar pedido' : 'Error de pago',
        msg,
        [{ text: 'Entendido' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 🧩 RENDER: Formulario de tarjeta
  const renderCardForm = () => (
    <View style={styles.cardForm}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Número de tarjeta</Text>
        <TextInput
          style={styles.input}
          placeholder="0000 0000 0000 0000"
          placeholderTextColor={COLORS.outline}
          value={cardData.number}
          onChangeText={v => handleUpdateCardField('number', v)}
          keyboardType="number-pad"
          maxLength={19}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, styles.inputGroupHalf]}>
          <Text style={styles.inputLabel}>Fecha (MM/AA)</Text>
          <TextInput
            style={styles.input}
            placeholder="12/26"
            placeholderTextColor={COLORS.outline}
            value={cardData.expiry}
            onChangeText={v => handleUpdateCardField('expiry', v)}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>

        <View style={[styles.inputGroup, styles.inputGroupHalf]}>
          <Text style={styles.inputLabel}>CVV</Text>
          <TextInput
            style={styles.input}
            placeholder="***"
            placeholderTextColor={COLORS.outline}
            value={cardData.cvv}
            onChangeText={v => handleUpdateCardField('cvv', v)}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre en tarjeta</Text>
        <TextInput
          style={[styles.input, styles.inputUppercase]}
          placeholder="NOMBRE COMPLETO"
          placeholderTextColor={COLORS.outline}
          value={cardData.name}
          onChangeText={v => handleUpdateCardField('name', v.toUpperCase())}
          autoCapitalize="characters"
        />
      </View>
    </View>
  );

  // 🧩 RENDER: Opción de efectivo
  const renderCashOption = () => (
    <TouchableOpacity
      style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionSelected]}
      onPress={() => setPaymentMethod('cash')}
      activeOpacity={0.8}
    >
      <View style={styles.paymentOptionContent}>
        <MaterialCommunityIcons
          name="cash"
          size={24}
          color={paymentMethod === 'cash' ? COLORS.primary : COLORS.onSurfaceVariant}
        />
        <View style={styles.paymentOptionText}>
          <Text style={styles.paymentOptionTitle}>Efectivo</Text>
          <Text style={styles.paymentOptionSubtitle}>
            Paga en efectivo al recoger en ventanilla
          </Text>
        </View>
      </View>
      <View style={styles.radioButton}>
        <View style={[styles.radioButtonInner, paymentMethod === 'cash' && styles.radioButtonInnerSelected]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <SafeAreaView style={styles.container}>

        {/* ── TOP APP BAR ── */}
        <View style={[styles.topBar, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
          <View style={styles.topBarLeft}>
            <TouchableOpacity style={styles.iconButton} onPress={handleGoBack} accessibilityLabel="Volver">
              <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Selecciona método de pago</Text>
          </View>
          <Image source={{ uri: MOCK_USER.avatar }} style={styles.avatar} />
        </View>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={false}
        >
          {/* Total a pagar */}
          <View style={styles.totalSection}>
            <Text style={styles.checkoutLabel}>Checkout</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={styles.totalValue}>${ORDER_TOTAL.toFixed(2)}</Text>
            </View>
          </View>

          {/* Opciones de pago */}
          <View style={styles.paymentSection}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod('card')}
              activeOpacity={0.8}
            >
              <View style={styles.paymentOptionContent}>
                <MaterialCommunityIcons
                  name="credit-card"
                  size={24}
                  color={paymentMethod === 'card' ? COLORS.primary : COLORS.onSurfaceVariant}
                />
                <Text style={styles.paymentOptionTitle}>Tarjeta de Crédito / Débito</Text>
              </View>
              <View style={styles.radioButton}>
                <View style={[styles.radioButtonInner, paymentMethod === 'card' && styles.radioButtonInnerSelected]} />
              </View>
            </TouchableOpacity>

            {paymentMethod === 'card' && renderCardForm()}
            {renderCashOption()}
          </View>

          {/* Toggle recibo digital */}
          <View style={styles.receiptCard}>
            <View style={styles.receiptContent}>
              <MaterialCommunityIcons name="receipt-text-outline" size={20} color={COLORS.onSurfaceVariant} />
              <Text style={styles.receiptText}>Generar recibo digital por correo</Text>
            </View>
            <Switch
              value={generateReceipt}
              onValueChange={setGenerateReceipt}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : COLORS.onPrimary}
              ios_backgroundColor={COLORS.outlineVariant}
            />
          </View>

          {/* Badge seguridad */}
          <View style={styles.securityBadge}>
            <MaterialCommunityIcons name="lock-outline" size={14} color={COLORS.onSurfaceVariant} />
            <Text style={styles.securityText}>Pago Seguro SSL</Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ── BOTÓN CONFIRMAR ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmOrder}
            activeOpacity={0.9}
            disabled={isProcessing}
            accessibilityLabel={`Confirmar pedido por $${ORDER_TOTAL.toFixed(2)}`}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              style={styles.confirmGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.confirmButtonText}>
                {isProcessing ? 'Procesando...' : 'Confirmar pedido'}
              </Text>
              <Text style={styles.confirmButtonPrice}>${ORDER_TOTAL.toFixed(2)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

// 🎨 ESTILOS (idénticos al original)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topBarTitle: { fontSize: 20, fontWeight: '700', color: COLORS.onSurface },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surfaceContainer },
  scrollContent: { flex: 1 },
  scrollPadding: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 140 },
  totalSection: { marginBottom: 32 },
  checkoutLabel: {
    fontSize: 12, fontWeight: '600', color: COLORS.secondary,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  totalLabel: { fontSize: 28, fontWeight: '700', color: COLORS.onSurface },
  totalValue: {
    fontSize: 28, fontWeight: '700', color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  paymentSection: { gap: 16, marginBottom: 24 },
  paymentOption: {
    backgroundColor: COLORS.surfaceContainerLowest, borderRadius: 16, padding: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 2, borderColor: 'transparent',
  },
  paymentOptionText: { flex: 1, marginLeft: 8 },
  paymentOptionSelected: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}08` },
  paymentOptionContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  paymentOptionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface },
  paymentOptionSubtitle: { fontSize: 14, color: COLORS.onSurfaceVariant, marginTop: 2 },
  radioButton: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: COLORS.outlineVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  radioButtonInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'transparent' },
  radioButtonInnerSelected: { backgroundColor: COLORS.primary },
  cardForm: {
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 16,
    padding: 20, gap: 16, marginTop: 8,
  },
  inputGroup: { gap: 8 },
  inputGroupHalf: { flex: 1 },
  inputRow: { flexDirection: 'row', gap: 16 },
  inputLabel: { fontSize: 12, fontWeight: '500', color: COLORS.outline, paddingHorizontal: 4 },
  input: {
    backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.outlineVariant,
    borderRadius: 12, paddingVertical: 16, paddingHorizontal: 16, fontSize: 16, color: COLORS.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputUppercase: { textTransform: 'uppercase' },
  receiptCard: {
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  receiptContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  receiptText: { fontSize: 14, fontWeight: '500', color: COLORS.onSurface },
  securityBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 16, opacity: 0.6,
  },
  securityText: {
    fontSize: 10, fontWeight: '700', color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  bottomSpacer: { height: 24 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: `${COLORS.surface}CC`,
    shadowColor: COLORS.onSurface, shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06, shadowRadius: 24, elevation: 8,
  },
  confirmButton: { borderRadius: 16, overflow: 'hidden' },
  confirmGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 32, paddingVertical: 16,
  },
  confirmButtonText: { fontSize: 18, fontWeight: '700', color: COLORS.onPrimary },
  confirmButtonPrice: {
    fontSize: 18, fontWeight: '700', color: COLORS.onPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});