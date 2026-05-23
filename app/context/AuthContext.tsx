import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "@zendwell_auth_logged_in";
const PHONE_KEY = "@zendwell_auth_phone";

interface AuthContextValue {
  isLoggedIn: boolean;
  isLoading: boolean;
  phone: string;
  login: (phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  isLoading: true,
  phone: "",
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [phone, setPhone] = useState("");

  // On mount: restore auth state from storage
  useEffect(() => {
    (async () => {
      try {
        const [loggedIn, savedPhone] = await Promise.all([
          AsyncStorage.getItem(AUTH_KEY),
          AsyncStorage.getItem(PHONE_KEY),
        ]);
        if (loggedIn === "true") {
          setIsLoggedIn(true);
          setPhone(savedPhone ?? "");
        }
      } catch {
        // If storage read fails, keep logged out
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (phoneNumber: string) => {
    await AsyncStorage.multiSet([
      [AUTH_KEY, "true"],
      [PHONE_KEY, phoneNumber],
    ]);
    setPhone(phoneNumber);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([AUTH_KEY, PHONE_KEY]);
    setPhone("");
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, phone, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
