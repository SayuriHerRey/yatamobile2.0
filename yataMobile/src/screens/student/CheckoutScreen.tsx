// src/screens/student/CheckoutScreen.tsx
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

// 👤 DATOS MOCK
const MOCK_USER = {
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARm1f6uRHvdlyTriTFdd4T5WeLoHHFfzPkYLkXvQXpTJg3HJShK5YN5c2otU437_0yxMUAXngKHTknjxxBCF3eVmogWa75X1wGp9XWmTaiux906Nsn6vlxI8cCyHDYehB0pPn467uYAJ16lV77HBgOD9RHintb1g2YE_OL6LwhDcml_o7xNCpi9PEuGHCOUJqNCCI7lMyIutBsrGmehrd-gWg3sEX8bI1hUEvhn87djwLqouNWnmeQUGspwCJ4',
};

const ORDER_TOTAL = 75.00;

export default function CheckoutScreen({ navigation }: any) {
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
  const handleGoBack = () => {
    console.log('🔙 Volver al carrito');
    navigation.goBack();
  };

  const handleUpdateCardField = (field: keyof CardFormData, value: string) => {
    // Formateo básico para mejor UX
    let formattedValue = value;

    if (field === 'number') {
      // Espacios cada 4 dígitos: 1234 5678 9012 3456
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    } else if (field === 'expiry') {
      // Formato MM/AA
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    } else if (field === 'cvv') {
      // Solo números, máximo 4 dígitos
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const handleConfirmOrder = async () => {
    if (paymentMethod === 'card') {
      // Validación básica
      if (cardData.number.replace(/\s/g, '').length < 16) {
        console.log('❌ Número de tarjeta inválido');
        return;
      }
      if (cardData.cvv.length < 3) {
        console.log('❌ CVV inválido');
        return;
      }
    }

    setIsProcessing(true);
    console.log('💳 Confirmar pedido:', {
      total: ORDER_TOTAL,
      paymentMethod,
      cardLast4: paymentMethod === 'card' ? cardData.number.slice(-4) : undefined,
      generateReceipt,
    });
    const orderId = `#A-${Math.floor(Math.random() * 1000)}`;

    setTimeout(() => {
      setIsProcessing(false);
      navigation.reset({
        index: 0,
        routes: [
          { name: 'StudentTabs' },
          { name: 'Seguimiento', params: { orderId } },
        ],
      });
    }, 1500);
  };

  // 🧩 RENDER: Formulario de tarjeta
  const renderCardForm = () => (
    <View style={styles.cardForm}>
      {/* Número de tarjeta */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Número de tarjeta</Text>
        <TextInput
          style={styles.input}
          placeholder="0000 0000 0000 0000"
          placeholderTextColor={COLORS.outline}
          value={cardData.number}
          onChangeText={(value) => handleUpdateCardField('number', value)}
          keyboardType="number-pad"
          maxLength={19}
        />
      </View>

      {/* Fecha y CVV */}
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, styles.inputGroupHalf]}>
          <Text style={styles.inputLabel}>Fecha (MM/AA)</Text>
          <TextInput
            style={styles.input}
            placeholder="12/26"
            placeholderTextColor={COLORS.outline}
            value={cardData.expiry}
            onChangeText={(value) => handleUpdateCardField('expiry', value)}
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
            onChangeText={(value) => handleUpdateCardField('cvv', value)}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      {/* Nombre en tarjeta */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre en tarjeta</Text>
        <TextInput
          style={[styles.input, styles.inputUppercase]}
          placeholder="NOMBRE COMPLETO"
          placeholderTextColor={COLORS.outline}
          value={cardData.name}
          onChangeText={(value) => handleUpdateCardField('name', value.toUpperCase())}
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

      {/* Radio button visual */}
      <View style={styles.radioButton}>
        <View style={[
          styles.radioButtonInner,
          paymentMethod === 'cash' && styles.radioButtonInnerSelected
        ]} />
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
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleGoBack}
              accessibilityLabel="Volver"
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Selecciona método de pago</Text>
          </View>

          <Image
            source={{ uri: MOCK_USER.avatar }}
            style={styles.avatar}
            accessibilityLabel="Foto de perfil"
          />
        </View>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollPadding}
          showsVerticalScrollIndicator={false}
        >
          {/* Header: Total a pagar */}
          <View style={styles.totalSection}>
            <Text style={styles.checkoutLabel}>Checkout</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={styles.totalValue}>${ORDER_TOTAL.toFixed(2)}</Text>
            </View>
          </View>

          {/* Opciones de pago */}
          <View style={styles.paymentSection}>

            {/* Tarjeta */}
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

              {/* Radio button visual */}
              <View style={styles.radioButton}>
                <View style={[
                  styles.radioButtonInner,
                  paymentMethod === 'card' && styles.radioButtonInnerSelected
                ]} />
              </View>
            </TouchableOpacity>

            {/* Formulario de tarjeta (solo si está seleccionado) */}
            {paymentMethod === 'card' && renderCardForm()}

            {/* Efectivo */}
            {renderCashOption()}
          </View>

          {/* Toggle: Recibo digital */}
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

          {/* Badge de seguridad */}
          <View style={styles.securityBadge}>
            <MaterialCommunityIcons name="lock-outline" size={14} color={COLORS.onSurfaceVariant} />
            <Text style={styles.securityText}>Pago Seguro SSL</Text>
          </View>

          {/* Espacio para botón fijo */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ── BOTÓN FIJO: CONFIRMAR PEDIDO ── */}
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

// 🎨 ESTILOS
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
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainer,
  },

  /* Scroll Content */
  scrollContent: { flex: 1 },
  scrollPadding: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 140, // Aumentado para mejor scroll
  },

  /* Total Section */
  totalSection: {
    marginBottom: 32,
  },
  checkoutLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* Payment Section */
  paymentSection: {
    gap: 16,
    marginBottom: 24,
  },
  paymentOption: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionText: {
    flex: 1,
    marginLeft: 8,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  radioButtonInnerSelected: {
    backgroundColor: COLORS.primary,
  },

  /* Card Form */
  cardForm: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginTop: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.outline,
    paddingHorizontal: 4,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputUppercase: {
    textTransform: 'uppercase',
  },

  /* Receipt Card */
  receiptCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  receiptText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
  },

  /* Security Badge */
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    opacity: 0.6,
  },
  securityText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* Bottom Spacer */
  bottomSpacer: { height: 24 },

  /* Footer fijo */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: `${COLORS.surface}CC`,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
  confirmButtonPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});