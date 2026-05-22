import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './navigation/AppNavigator';
import { FeatureProvider } from './context/FeatureContext';
import { registerRootComponent } from 'expo';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { Sora_400Regular, Sora_700Bold } from '@expo-google-fonts/sora';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function App() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_700Bold,
    Sora_400Regular,
    Sora_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <FeatureProvider>
        <NavigationContainer>
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <AppNavigator />
        </NavigationContainer>
      </FeatureProvider>
    </QueryClientProvider>
  );
}

export default App;
registerRootComponent(App);
