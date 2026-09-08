import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import { CartProvider } from "./src/cart/CartContext";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { OfflineBanner } from "./src/components/OfflineBanner";
import { ToastProvider } from "./src/components/Toast";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { asyncStoragePersister, queryClient } from "./src/query/queryClient";
import { ThemeProvider, useTheme } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function SplashGate({ children }: { children: React.ReactNode }) {
  const { initializing } = useAuth();
  useEffect(() => {
    if (!initializing) SplashScreen.hideAsync().catch(() => {});
  }, [initializing]);
  return <>{children}</>;
}

function ThemedStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar style={scheme === "dark" ? "light" : "dark"} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{ persister: asyncStoragePersister, maxAge: 24 * 60 * 60 * 1000 }}
            >
              <AuthProvider>
                <CartProvider>
                  <ToastProvider>
                    <ThemedStatusBar />
                    <OfflineBanner />
                    <SplashGate>
                      <RootNavigator />
                    </SplashGate>
                  </ToastProvider>
                </CartProvider>
              </AuthProvider>
            </PersistQueryClientProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
