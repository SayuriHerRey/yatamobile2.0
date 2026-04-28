// src/screens/auth/LoginUnificadoScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 🎨 COLORES
const COLORS = {
  primary: '#630ED4',
  primaryContainer: '#7C3AED',
  surface: '#F8F9FA',
  onSurface: '#191C1D',
  onSurfaceVariant: '#4A4455',
  onPrimary: '#FFFFFF',
  surfaceContainerLow: '#F3F4F5',
  surfaceContainerLowest: '#FFFFFF',
  outline: '#7B7487',
  outlineVariant: '#CCC3D8',
  error: '#BA1A1A',
  green: '#16A34A',
};

export default function LoginUnificadoScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectedRole, setDetectedRole] = useState<'student' | 'staff' | null>(null);

  // Detectar rol según el dominio del correo
  const detectRoleByEmail = (emailText: string) => {
    if (emailText.includes('@unach.mx')) {
      return 'student';
    } else if (emailText.includes('@cafeteria.com') ||
      emailText.includes('@cafe.unach.mx') ||
      emailText.includes('@staff.unach.mx')) {
      return 'staff';
    }
    return null;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    const role = detectRoleByEmail(text);
    setDetectedRole(role);
  };

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }

    // Detectar rol por dominio (mantiene tu validación visual)
    const role = detectRoleByEmail(email);

    if (!role) {
      Alert.alert(
        'Dominio no válido',
        'Por favor usa un correo válido:\n\n' +
        '• Estudiantes: @unach.mx\n' +
        '• Personal: @cafeteria.com'
      );
      return;
    }

    setLoading(true);

    try {
      // ⚠️ Recuerda: 10.0.2.2 para Emulador Android. Cambia por tu IP (ej. 192.168.1.75) si usas celular físico.
      const response = await fetch('http://192.168.100.15:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Enviamos el email en minúsculas y sin espacios al backend
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Correo o contraseña incorrectos');
      }

      console.log('✅ Login exitoso en BD real. Token:', data.access_token);

      // (Opcional) Aquí guardarías el token en AsyncStorage en el futuro
      // await AsyncStorage.setItem('userToken', data.access_token);

      // Navegar según el rol devuelto por el BACKEND (más seguro que el frontend)
      if (data.role === 'student') {
        navigation.replace('StudentStack');
      } else if (data.role === 'staff') {
        navigation.replace('StaffStack');
      } else {
        throw new Error('Rol no reconocido por el servidor');
      }

    } catch (error: any) {
      Alert.alert('Error de acceso', error.message || 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSplash = () => {
    navigation.replace('Splash');
  };

  // Credenciales reales de la base de datos para autocompletar en desarrollo
  const exampleCredentials = [
    { email: 'estudiante@unach.mx', password: '123456', role: 'student', icon: 'account-school' },
    { email: 'admin@cafeteria.com', password: 'admin123', role: 'staff', icon: 'chef-hat' },
  ];

  const fillCredentials = (cred: typeof exampleCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setDetectedRole(cred.role === 'estudiante' ? 'student' : 'staff');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Botón de regreso */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackToSplash}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={48} color={COLORS.primary} />
              <Text style={styles.logoText}>YaTa</Text>
            </View>
            <Text style={styles.title}>Bienvenido a YaTa Cafetería</Text>
            <Text style={styles.subtitle}>
              Ingresa con tu correo institucional
            </Text>
          </View>

          {/* Detección de rol en tiempo real */}
          {detectedRole && email.length > 0 && (
            <View style={styles.roleDetector}>
              <MaterialCommunityIcons
                name={detectedRole === 'student' ? 'account-school' : 'chef-hat'}
                size={20}
                color={detectedRole === 'student' ? COLORS.green : COLORS.primary}
              />
              <Text style={styles.roleDetectorText}>
                {detectedRole === 'student'
                  ? '🎓 Accediendo como Estudiante'
                  : '👨‍🍳 Accediendo como Personal de Cafetería'}
              </Text>
            </View>
          )}

          {/* FORMULARIO */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico institucional</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={COLORS.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@unach.mx"
                  placeholderTextColor={COLORS.outline}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Contraseña</Text>
                <TouchableOpacity onPress={() => Alert.alert('Recuperar contraseña', 'Contacta al administrador del sistema para restablecer tu acceso.')}>
                  <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={COLORS.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.outline}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.outline}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón Iniciar Sesión */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.9}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryContainer]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.onPrimary} />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.onPrimary} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Info de dominios */}
          <View style={styles.infoSection}>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Dominios válidos</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.domainCards}>
              <View style={styles.domainCard}>
                <MaterialCommunityIcons name="account-school" size={24} color={COLORS.green} />
                <Text style={styles.domainTitle}>Estudiantes</Text>
                <Text style={styles.domainText}>@unach.mx</Text>
              </View>
              <View style={styles.domainCard}>
                <MaterialCommunityIcons name="chef-hat" size={24} color={COLORS.primary} />
                <Text style={styles.domainTitle}>Personal</Text>
                <Text style={styles.domainText}>@cafeteria.com</Text>
              </View>
            </View>
          </View>

          {/* SECCIÓN DE CREDENCIALES DE EJEMPLO (SOLO DEMO) */}
          <View style={styles.demoSection}>
            <Text style={styles.demoNote}>
              ⚡ Demo: Toca una credencial para autocompletar
            </Text>

            {exampleCredentials.map((cred, index) => (
              <TouchableOpacity
                key={index}
                style={styles.demoCard}
                onPress={() => fillCredentials(cred)}
                activeOpacity={0.7}
              >
                <View style={[styles.demoCardIcon, { backgroundColor: cred.role === 'estudiante' ? 'rgba(22,163,74,0.1)' : 'rgba(99,14,212,0.1)' }]}>
                  <MaterialCommunityIcons
                    name={cred.icon as any}
                    size={24}
                    color={cred.role === 'estudiante' ? COLORS.green : COLORS.primary}
                  />
                </View>
                <View style={styles.demoCardContent}>
                  <Text style={styles.demoCardRole}>{cred.role}</Text>
                  <Text style={styles.demoCardEmail}>{cred.email}</Text>
                  <Text style={styles.demoCardPassword}>🔑 {cred.password}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.outline} />
              </TouchableOpacity>
            ))}
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 YaTa Cafetería - Todos los derechos reservados
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Acentos de fondo */}
      <View style={styles.bgAccent1} />
      <View style={styles.bgAccent2} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  /* Back Button */
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 8 : 16,
    marginBottom: 16,
    backgroundColor: COLORS.surfaceContainerLow,
  },

  /* Header */
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -2,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  /* Role Detector */
  roleDetector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  roleDetectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  /* Formulario */
  form: {
    width: '100%',
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    paddingHorizontal: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  forgotPassword: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: 48,
    paddingRight: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },

  /* Info Section */
  infoSection: {
    marginTop: 32,
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${COLORS.outlineVariant}4D`,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1,
  },
  domainCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  domainCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  domainTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 4,
  },
  domainText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* Demo Section */
  demoSection: {
    marginTop: 24,
    width: '100%',
  },
  demoNote: {
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  demoCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoCardContent: {
    flex: 1,
  },
  demoCardRole: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  demoCardEmail: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginBottom: 2,
  },
  demoCardPassword: {
    fontSize: 11,
    color: COLORS.outline,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* Footer */
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    opacity: 0.5,
  },

  /* Acentos de fondo */
  bgAccent1: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 256,
    height: 256,
    backgroundColor: 'rgba(99, 14, 212, 0.05)',
    borderRadius: 9999,
    transform: [{ translateX: 64 }, { translateY: -64 }],
  },
  bgAccent2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 192,
    height: 192,
    backgroundColor: 'rgba(113, 46, 221, 0.05)',
    borderRadius: 9999,
    transform: [{ translateX: -48 }, { translateY: 48 }],
  },
});
