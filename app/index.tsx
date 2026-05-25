import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NavigationRoot from './navigation/NavigationRoot';
import { FeatureProvider } from './context/FeatureContext';
import { AuthProvider } from './context/AuthContext';
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
      <AuthProvider>
        <FeatureProvider>
          <>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <NavigationRoot />
          </>
        </FeatureProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
