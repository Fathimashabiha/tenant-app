import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppNavigator from "./AppNavigator";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../../constants/Theme";

const NAV_STATE_KEY = "@zendwell_navigation_state";

export default function NavigationRoot() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [navReady, setNavReady] = useState(false);
  const [initialState, setInitialState] = useState<Parameters<
    typeof NavigationContainer
  >[0]["initialState"]>();

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    (async () => {
      try {
        if (isLoggedIn) {
          const saved = await AsyncStorage.getItem(NAV_STATE_KEY);
          if (saved && !cancelled) {
            setInitialState(JSON.parse(saved));
          }
        } else {
          await AsyncStorage.removeItem(NAV_STATE_KEY);
        }
      } catch {
        // Ignore corrupt saved navigation state.
      } finally {
        if (!cancelled) setNavReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn]);

  if (authLoading || !navReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={(state) => {
        if (isLoggedIn && state) {
          AsyncStorage.setItem(NAV_STATE_KEY, JSON.stringify(state)).catch(() => {});
        }
      }}
    >
      <AppNavigator />
    </NavigationContainer>
  );
}
