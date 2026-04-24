// App.tsx (en yata/mobile/App.tsx)
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { ProductProvider } from './src/contexts/ProductContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProductProvider>
        <NavigationContainer>
          <StatusBar style="auto" backgroundColor="transparent" translucent />
          <RootNavigator />
        </NavigationContainer>
      </ProductProvider>
    </SafeAreaProvider>

  );
}