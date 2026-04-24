// src/screens/auth/LoginPersonalScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'

// 🎨 COLORES (mismos que SplashScreen)
const COLORS = {
  primary: '#630ED4',
  primaryContainer: '#7C3AED',
  surface: '#F8F9FA',
  onSurface: '#191C1D',
  onSurfaceVariant: '#4A4455',
  onPrimary: '#FFFFFF',
  surfaceContainerLow: '#F3F4F5',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerHigh: '#E7E8E9',
  outline: '#7B7487',
  outlineVariant: '#CCC3D8',
};

export default function LoginPersonalScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // 🔒 Validación básica (opcional pero recomendada)
    if (!email.trim() || !password.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    console.log('👨‍🍳 Login de personal exitoso:', email);
    // TODO: Aquí iría la llamada a auth-service para validar credenciales

    // ✅ REPLACE: Limpia el login del historial y entra al flujo staff
    navigation.replace('StaffStack');
  };


  const handleGoogleSignIn = () => {
    console.log('🔐 Redirigiendo a login de estudiante');
    navigation.replace('StudentStack');
  };

  const handleForgotPassword = () => {
    console.log('🔑 Recuperar contraseña');
    alert('Contacta al administrador de la cafetería para restablecer tu acceso.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* ── HEADER: Logo y Título ── */}
        <View style={styles.header}>
          <Text style={styles.logoText}>YaTa</Text>
          <Text style={styles.title}>Acceso para personal de cafetería</Text>
        </View>

        {/* ── FORMULARIO ── */}
        <View style={styles.form}>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="nombre@universidad.edu"
                placeholderTextColor={COLORS.outline}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Contraseña</Text>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.outline}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
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
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── FOOTER: Divider y Google Login ── */}
        <View style={styles.footer}>

          {/* Divider con "O" */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.footerText}>¿Eres estudiante? Usa tu cuenta de Google</Text>

          {/* Botón Google */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQuh6bK1K21WKrQfoq77XBMdty3tXyluMlhVtKauwHUiyXewB3dJB0gl3jgg4inr-WgfDgnMXwEiD4lVUPHfAXqHVb0hhxi8e0u8k-j2m4LglqEwf4mesacgVq7rAMQTPxiuaIuwr95v0L5Fyf5RvX5fiJEzDtUcvtC58VjEW7Qvj9Ff2tsDSJiTpRTRpkYT3VPFDwyluFTibITHuKcqaXVH5GhpfXxbLTrya-5zAjIbgK4cFY6xUrj8ITO134uPKoNrpRJ1DodQU'
              }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* ── Acentos de fondo (decorativos) ── */}
      <View style={styles.bgAccent1} />
      <View style={styles.bgAccent2} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },

  /* Header */
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -2,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    lineHeight: 28,
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
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
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
    top: '50%',
    marginTop: -10,
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

  /* Footer */
  footer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${COLORS.outlineVariant}4D`, // 30% opacity
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 2,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginBottom: 24,
  },
  googleButton: {
    height: 48,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
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