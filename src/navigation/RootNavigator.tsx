// src/navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginPersonalScreen from '../screens/auth/LoginPersonalScreen';
import StudentStack from './StudentStack';
import StaffStack from './StaffStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // TODO: Aquí iría la lógica para determinar el rol del usuario
  // Ej: const { user } = useAuthStore();
  // Por ahora, mostramos SplashScreen como punto de entrada
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Auth Flow */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LoginPersonal" component={LoginPersonalScreen} />
      
      {/* Student Flow */}
      <Stack.Screen name="StudentStack" component={StudentStack} />
      
      {/* Staff Flow */}
      <Stack.Screen name="StaffStack" component={StaffStack} />
    </Stack.Navigator>

  );
}