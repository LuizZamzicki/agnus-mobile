import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack, ThemeProvider as NavigationThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { OfflineBanner } from "../src/components/layout/OfflineBanner";
import { ErrorBoundary } from "../src/components/layout/ErrorBoundary";
import { ToastProvider } from "../src/components/layout/Toast";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { CartProvider } from "../src/contexts/CartContext";
import { asyncStoragePersister, queryClient } from "../src/query/queryClient";
import {
  ThemeProvider,
  useNavigationTheme,
  useTheme,
  useThemedStyles,
  type Theme,
} from "../src/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function SplashGate({ children }: { children: React.ReactNode }) {
  const { initializing } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  useEffect(() => {
    if (!initializing) SplashScreen.hideAsync().catch(() => {});
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function ThemedStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar style={scheme === "dark" ? "light" : "dark"} />;
}

function RootStack() {
  const navTheme = useNavigationTheme();

  return (
    <NavigationThemeProvider value={navTheme}>
      <ThemedStatusBar />
      <OfflineBanner />
      <SplashGate>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="produto/[id]" options={{ title: "Produto" }} />
          <Stack.Screen name="login" options={{ title: "Entrar", presentation: "modal" }} />
          <Stack.Screen name="checkout" options={{ title: "Finalizar compra" }} />
          <Stack.Screen
            name="pedido/[id_pedido]"
            options={{
              title: "Pedido confirmado",
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen name="+not-found" options={{ title: "Ops" }} />
        </Stack>
      </SplashGate>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
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
                    <RootStack />
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

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
  });
