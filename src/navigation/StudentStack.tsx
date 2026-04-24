// src/navigation/StudentStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../types';
import StudentTabs from './StudentTabs';
import DetalleProductoScreen from '../screens/student/DetalleProductoScreen';
import CarritoScreen from '../screens/student/CarritoScreen';
import CheckoutScreen from '../screens/student/CheckoutScreen';
import SeguimientoScreen from '../screens/student/SeguimientoScreen';
import HistorialScreen from '../screens/student/HistorialScreen';

const Stack = createNativeStackNavigator<StudentStackParamList>();

export default function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tabs principales */}
      <Stack.Screen name="StudentTabs" component={StudentTabs} />

      {/* Flujo de pedido (modales o pantallas completas) */}
      <Stack.Screen
        name="DetalleProducto"
        component={DetalleProductoScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Carrito"
        component={CarritoScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Historial"
        component={HistorialScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Seguimiento"
        component={SeguimientoScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
          gestureEnabled: false, // Evitar que cierren el seguimiento accidentalmente
        }}
      />

    </Stack.Navigator>
  );
}