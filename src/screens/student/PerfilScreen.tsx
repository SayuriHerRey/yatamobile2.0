// src/screens/student/PerfilScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Platform,
  Alert,
  Modal,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentTabParamList, StudentStackParamList } from '../../types';

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
  surfaceContainerHighest: '#E1E3E4',
  outlineVariant: '#CCC3D8',
  error: '#BA1A1A',
  green: '#16A34A',
};

// 📦 TIPOS
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  studentId: string;
  career: string;
  semester: string;
  avatar: string;
  defaultPaymentMethodId: string;
  pushNotifications: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'efectivo' | 'transferencia' | 'tarjeta';
  name: string;
  details?: {
    bank?: string;
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
  };
}

// 👤 DATOS MOCK (luego vendrán de useAuthStore)
const MOCK_USER: UserProfile = {
  name: 'Brian Aquino',
  email: 'brian.aquino@unach.mx',
  phone: '9611234567',
  studentId: 'A20240001',
  career: 'Ingeniería en Sistemas Computacionales',
  semester: '6to Semestre',
  avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEWTFMH7NMbGjAC99Dt81we2KDXfTKrbYeMg&s',
  defaultPaymentMethodId: 'efectivo_1',
  pushNotifications: true,
};

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'efectivo_1',
    type: 'efectivo',
    name: 'Efectivo',
  },
  {
    id: 'transferencia_1',
    type: 'transferencia',
    name: 'Transferencia bancaria',
    details: {
      bank: 'BBVA',
    },
  },
  {
    id: 'tarjeta_1',
    type: 'tarjeta',
    name: 'Visa terminada en 4242',
    details: {
      cardNumber: '**** **** **** 4242',
      cardHolder: 'Brian Aquino',
      expiryDate: '12/28',
    },
  },
];

type PerfilNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<StudentTabParamList, 'Perfil'>,
  NativeStackNavigationProp<StudentStackParamList>
>;

export default function PerfilScreen() {
  const navigation = useNavigation<PerfilNavigationProp>();
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [pushEnabled, setPushEnabled] = useState(user.pushNotifications);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);

  // Estados para modales
  const [modalVisible, setModalVisible] = useState(false);
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);

  // Estado para editar perfil
  const [editForm, setEditForm] = useState({
    name: user.name,
    phone: user.phone,
    studentId: user.studentId,
    career: user.career,
    semester: user.semester,
  });

  // Estado para nueva tarjeta
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  // Obtener método de pago actual
  const currentPaymentMethod = paymentMethods.find(m => m.id === user.defaultPaymentMethodId);

  // 🔧 HANDLERS
  const handleNotification = () => {
    console.log('🔔 Ver notificaciones');
  };

  const handleEditAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería para cambiar la foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setTempAvatar(result.assets[0].uri);
      Alert.alert(
        'Actualizar foto',
        '¿Deseas actualizar tu foto de perfil?',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => setTempAvatar(null) },
          {
            text: 'Actualizar',
            onPress: () => {
              setUser(prev => ({ ...prev, avatar: result.assets[0].uri }));
              setTempAvatar(null);
              Alert.alert('✅ Foto actualizada', 'Tu foto de perfil ha sido actualizada correctamente.');
            },
          },
        ]
      );
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      name: user.name,
      phone: user.phone,
      studentId: user.studentId,
      career: user.career,
      semester: user.semester,
    });
    setEditProfileModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setUser(prev => ({
        ...prev,
        name: editForm.name,
        phone: editForm.phone,
        studentId: editForm.studentId,
        career: editForm.career,
        semester: editForm.semester,
      }));
      setIsLoading(false);
      setEditProfileModalVisible(false);
      Alert.alert('✅ Perfil actualizado', 'Tu información ha sido actualizada correctamente.');
    }, 1000);
  };

  const handlePaymentMethod = () => {
    setModalVisible(true);
  };

  const handleSelectPaymentMethod = (methodId: string) => {
    setUser(prev => ({ ...prev, defaultPaymentMethodId: methodId }));
    setModalVisible(false);
    const selectedMethod = paymentMethods.find(m => m.id === methodId);
    Alert.alert(
      '✅ Método de pago actualizado',
      `Ahora pagarás con ${selectedMethod?.name} por defecto.`
    );
  };

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.cardHolder || !newCard.expiryDate || !newCard.cvv) {
      Alert.alert('Error', 'Por favor completa todos los campos de la tarjeta');
      return;
    }

    const newPaymentMethod: PaymentMethod = {
      id: `tarjeta_${Date.now()}`,
      type: 'tarjeta',
      name: `Tarjeta terminada en ${newCard.cardNumber.slice(-4)}`,
      details: {
        cardNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}`,
        cardHolder: newCard.cardHolder,
        expiryDate: newCard.expiryDate,
      },
    };

    setPaymentMethods(prev => [...prev, newPaymentMethod]);
    setAddCardModalVisible(false);
    setNewCard({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });

    Alert.alert(
      '✅ Tarjeta agregada',
      `La tarjeta ${newPaymentMethod.name} ha sido agregada correctamente.`,
      [
        {
          text: 'Establecer como predeterminada',
          onPress: () => handleSelectPaymentMethod(newPaymentMethod.id),
        },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const handleDeleteCard = (methodId: string) => {
    const methodToDelete = paymentMethods.find(m => m.id === methodId);
    if (methodToDelete?.type === 'efectivo') {
      Alert.alert('No se puede eliminar', 'El método de pago en efectivo no se puede eliminar.');
      return;
    }

    Alert.alert(
      'Eliminar tarjeta',
      `¿Estás seguro de que deseas eliminar ${methodToDelete?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const newMethods = paymentMethods.filter(m => m.id !== methodId);
            setPaymentMethods(newMethods);

            if (user.defaultPaymentMethodId === methodId) {
              const efectivoMethod = newMethods.find(m => m.type === 'efectivo');
              if (efectivoMethod) {
                setUser(prev => ({ ...prev, defaultPaymentMethodId: efectivoMethod.id }));
              }
            }
            Alert.alert('✅ Tarjeta eliminada', 'La tarjeta ha sido eliminada correctamente.');
          },
        },
      ]
    );
  };

  const handleToggleNotifications = (value: boolean) => {
    setPushEnabled(value);
    console.log('🔔 Notificaciones push:', value ? 'activadas' : 'desactivadas');
  };

  const handleSupport = () => {
    console.log('🆘 Contacto con soporte de cafetería');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            console.log('🚪 Cerrando sesión y limpiando navegación...');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Splash' } as any],
            });
          },
        },
      ]
    );
  };

  // Renderizar icono según tipo de pago
  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'efectivo':
        return <MaterialCommunityIcons name="cash" size={20} color={COLORS.secondary} />;
      case 'transferencia':
        return <MaterialCommunityIcons name="bank-transfer" size={20} color={COLORS.primary} />;
      case 'tarjeta':
        return <MaterialCommunityIcons name="credit-card" size={20} color={COLORS.green} />;
      default:
        return <MaterialCommunityIcons name="credit-card" size={20} color={COLORS.primary} />;
    }
  };

  // Obtener texto del método de pago actual
  const getPaymentMethodText = () => {
    if (!currentPaymentMethod) return 'Seleccionar método';
    switch (currentPaymentMethod.type) {
      case 'efectivo':
        return '💵 Efectivo';
      case 'transferencia':
        return '🏦 Transferencia bancaria';
      case 'tarjeta':
        return `💳 ${currentPaymentMethod.name}`;
      default:
        return currentPaymentMethod.name;
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <SafeAreaView style={styles.container}>

        {/* ── TOP APP BAR ── */}
        <View style={[styles.topBar, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8 }]}>
          <View style={styles.topBarLeft}>
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatarSmall}
              accessibilityLabel="Foto de perfil"
            />
            <Text style={styles.topBarTitle}>Perfil</Text>
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

          {/* Sección: Identidad del usuario */}
          <View style={styles.identitySection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleEditAvatar}
              accessibilityLabel="Editar foto de perfil"
            >
              <Image
                source={{ uri: tempAvatar || user.avatar }}
                style={styles.avatarLarge}
                accessibilityLabel="Avatar"
              />
              <View style={styles.editBadge}>
                <MaterialCommunityIcons name="camera" size={14} color={COLORS.onPrimary} />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            {/* Botón Editar Perfil */}
            <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
              <MaterialCommunityIcons name="pencil" size={16} color={COLORS.primary} />
              <Text style={styles.editProfileButtonText}>Editar perfil</Text>
            </TouchableOpacity>

            {/* Información adicional del estudiante */}
            <View style={styles.studentInfo}>
              <View style={styles.studentInfoRow}>
                <MaterialCommunityIcons name="badge-account" size={16} color={COLORS.onSurfaceVariant} />
                <Text style={styles.studentInfoText}>Matrícula: {user.studentId}</Text>
              </View>
              <View style={styles.studentInfoRow}>
                <MaterialCommunityIcons name="school" size={16} color={COLORS.onSurfaceVariant} />
                <Text style={styles.studentInfoText}>{user.career}</Text>
              </View>
              <View style={styles.studentInfoRow}>
                <MaterialCommunityIcons name="book-open-page-variant" size={16} color={COLORS.onSurfaceVariant} />
                <Text style={styles.studentInfoText}>{user.semester}</Text>
              </View>
              <View style={styles.studentInfoRow}>
                <MaterialCommunityIcons name="phone" size={16} color={COLORS.onSurfaceVariant} />
                <Text style={styles.studentInfoText}>{user.phone}</Text>
              </View>
            </View>
          </View>

          {/* Sección: Preferencias */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Preferencias</Text>

            <View style={styles.preferencesGrid}>
              {/* Método de pago */}
              <TouchableOpacity
                style={styles.preferenceCard}
                onPress={handlePaymentMethod}
                activeOpacity={0.8}
              >
                <View style={styles.preferenceContent}>
                  <View style={[styles.preferenceIcon, { backgroundColor: `${COLORS.secondary}1A` }]}>
                    <MaterialCommunityIcons name="credit-card" size={20} color={COLORS.secondary} />
                  </View>
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>Métodos de pago</Text>
                    <Text style={styles.preferenceValue}>{getPaymentMethodText()}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>

              {/* Notificaciones push */}
              <View style={styles.preferenceCard}>
                <View style={styles.preferenceContent}>
                  <View style={[styles.preferenceIcon, { backgroundColor: `${COLORS.primary}1A` }]}>
                    <MaterialCommunityIcons name="bell-ring" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>Notificaciones push</Text>
                    <Text style={styles.preferenceValue}>Alertas de pedido listo</Text>
                  </View>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: COLORS.surfaceContainerHighest, true: COLORS.primary }}
                  thumbColor={Platform.OS === 'ios' ? undefined : COLORS.onPrimary}
                  ios_backgroundColor={COLORS.surfaceContainerHighest}
                />
              </View>
            </View>
          </View>

          {/* Sección: Enlaces de utilidad */}
          <View style={styles.utilitySection}>
            <TouchableOpacity
              style={styles.utilityButton}
              onPress={handleSupport}
              activeOpacity={0.8}
            >
              <Text style={styles.utilityButtonText}>Soporte / Contacto cafetería</Text>
              <MaterialCommunityIcons name="headphones" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="logout" size={20} color={COLORS.error} />
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>

          {/* Espacio para bottom nav */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ── BOTTOM NAVIGATION BAR ── */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => console.log('🏠 Ir a Inicio')}
          >
            <MaterialCommunityIcons name="home-outline" size={24} color={COLORS.onSurface} />
            <Text style={styles.navLabel}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => console.log('🍽️ Ir a Menú')}
          >
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={COLORS.onSurface} />
            <Text style={styles.navLabel}>Menú</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItemActive}
            onPress={() => console.log('👤 Perfil (actual)')}
          >
            <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
            <Text style={styles.navLabelActive}>Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* ── MODAL: SELECCIÓN DE MÉTODO DE PAGO ── */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Métodos de pago</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {paymentMethods.map((method) => {
                  const isSelected = user.defaultPaymentMethodId === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[styles.paymentMethodItem, isSelected && styles.paymentMethodItemSelected]}
                      onPress={() => handleSelectPaymentMethod(method.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.paymentMethodContent}>
                        <View style={styles.paymentMethodIcon}>
                          {getPaymentIcon(method.type)}
                        </View>
                        <View style={styles.paymentMethodInfo}>
                          <Text style={styles.paymentMethodName}>{method.name}</Text>
                          {method.details?.cardNumber && (
                            <Text style={styles.paymentMethodDetails}>{method.details.cardNumber}</Text>
                          )}
                          {method.details?.bank && (
                            <Text style={styles.paymentMethodDetails}>Banco: {method.details.bank}</Text>
                          )}
                        </View>
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />
                          </View>
                        )}
                      </View>

                      {method.type !== 'efectivo' && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteCard(method.id)}
                        >
                          <MaterialCommunityIcons name="delete-outline" size={20} color={COLORS.error} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={styles.addCardButton}
                  onPress={() => {
                    setModalVisible(false);
                    setAddCardModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="plus-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.addCardButtonText}>Agregar nueva tarjeta</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ── MODAL: AGREGAR TARJETA ── */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={addCardModalVisible}
          onRequestClose={() => setAddCardModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar tarjeta</Text>
                <TouchableOpacity onPress={() => setAddCardModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <View style={styles.addCardForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Número de tarjeta"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  keyboardType="numeric"
                  value={newCard.cardNumber}
                  onChangeText={(text) => setNewCard(prev => ({ ...prev, cardNumber: text }))}
                  maxLength={16}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Nombre del titular"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={newCard.cardHolder}
                  onChangeText={(text) => setNewCard(prev => ({ ...prev, cardHolder: text }))}
                />

                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="MM/AA"
                    placeholderTextColor={COLORS.onSurfaceVariant}
                    value={newCard.expiryDate}
                    onChangeText={(text) => setNewCard(prev => ({ ...prev, expiryDate: text }))}
                    maxLength={5}
                  />

                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="CVV"
                    placeholderTextColor={COLORS.onSurfaceVariant}
                    keyboardType="numeric"
                    value={newCard.cvv}
                    onChangeText={(text) => setNewCard(prev => ({ ...prev, cvv: text }))}
                    maxLength={4}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity style={styles.confirmButton} onPress={handleAddCard}>
                  <Text style={styles.confirmButtonText}>Agregar tarjeta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── MODAL: EDITAR PERFIL ── */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editProfileModalVisible}
          onRequestClose={() => setEditProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.editProfileModal]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar perfil</Text>
                <TouchableOpacity onPress={() => setEditProfileModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  style={styles.editInput}
                  placeholder="Nombre completo"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                />

                <TextInput
                  style={styles.editInput}
                  placeholder="Teléfono"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  keyboardType="phone-pad"
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                />

                <TextInput
                  style={styles.editInput}
                  placeholder="Matrícula"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={editForm.studentId}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, studentId: text }))}
                />

                <TextInput
                  style={styles.editInput}
                  placeholder="Carrera"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={editForm.career}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, career: text }))}
                />

                <TextInput
                  style={styles.editInput}
                  placeholder="Semestre"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  value={editForm.semester}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, semester: text }))}
                />

                <View style={styles.editButtonsRow}>
                  <TouchableOpacity
                    style={[styles.editButton, styles.cancelEditButton]}
                    onPress={() => setEditProfileModalVisible(false)}
                  >
                    <Text style={styles.cancelEditButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.editButton, styles.saveEditButton]}
                    onPress={handleSaveProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={COLORS.onPrimary} />
                    ) : (
                      <Text style={styles.saveEditButtonText}>Guardar cambios</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

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
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
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
    paddingTop: 16,
    paddingBottom: 100,
  },

  /* Identity Section */
  identitySection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: COLORS.surfaceContainerLow,
    backgroundColor: COLORS.surfaceContainer,
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    opacity: 0.8,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: `${COLORS.primary}1A`,
    borderRadius: 20,
    marginTop: 4,
  },
  editProfileButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  studentInfo: {
    marginTop: 12,
    gap: 8,
    width: '100%',
    paddingHorizontal: 16,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentInfoText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },

  /* Section */
  section: {
    marginTop: 24,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.6,
    paddingHorizontal: 4,
  },

  /* Preferences Grid */
  preferencesGrid: {
    gap: 12,
  },
  preferenceCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceText: {
    gap: 2,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  preferenceValue: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    opacity: 0.7,
  },

  /* Utility Section */
  utilitySection: {
    marginTop: 24,
    gap: 12,
  },
  utilityButton: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  utilityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  logoutButton: {
    backgroundColor: `${COLORS.error}0D`,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: `${COLORS.error}1A`,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
  },

  /* Bottom Spacer */
  bottomSpacer: { height: 24 },

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

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  editProfileModal: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  paymentMethodItemSelected: {
    backgroundColor: `${COLORS.primary}1A`,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  paymentMethodDetails: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  selectedBadge: {
    marginLeft: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addCardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  addCardForm: {
    gap: 16,
  },
  input: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },

  /* Edit Profile Styles */
  editInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.onSurface,
    marginBottom: 16,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelEditButton: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  cancelEditButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  saveEditButton: {
    backgroundColor: COLORS.primary,
  },
  saveEditButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onPrimary,
  },
});