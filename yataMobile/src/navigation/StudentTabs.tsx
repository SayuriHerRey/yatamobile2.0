import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StudentTabParamList } from '../types';
import HomeScreen from '../screens/student/HomeScreen';
import MenuScreen from '../screens/student/MenuScreen';
import CarritoScreen from '../screens/student/CarritoScreen';
import PerfilScreen from '../screens/student/PerfilScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { useCartStore } from '../store/cartStore';
import HistorialScreen from '../screens/student/HistorialScreen';

const Tab = createBottomTabNavigator<StudentTabParamList>();

export default function StudentTabs() {
  const insets = useSafeAreaInsets();
  const totalItems = useCartStore((state: any) => state.totalItems());

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#F8F9FA',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 12,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#630ED4',
        tabBarInactiveTintColor: '#191C1D',
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Home') {
            return <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          }
          if (route.name === 'Menu') {
            return <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />;
          }
          if (route.name === 'Carrito') {
            return (
              <View>
                <MaterialCommunityIcons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
                {totalItems > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
                  </View>
                )}
              </View>
            );
          }
          if (route.name === 'Pedidos') {
            return <MaterialCommunityIcons name={focused ? 'clipboard-text' : 'clipboard-text-outline'} size={size} color={color} />;
          }
          if (route.name === 'Perfil') {
            return <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={size} color={color} />;
          }
          return null;
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Menu" component={MenuScreen} options={{ tabBarLabel: 'Menú' }} />
      <Tab.Screen name="Carrito" component={CarritoScreen} options={{ tabBarLabel: 'Carrito' }} />
      <Tab.Screen name="Pedidos" component={HistorialScreen} options={{ tabBarLabel: 'Pedidos' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#630ED4',
    borderRadius: 9999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});