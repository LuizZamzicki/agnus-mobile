import { NavigationContainer, DefaultTheme, type LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "../auth/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { NotFoundScreen } from "../screens/NotFoundScreen";
import { ProductScreen } from "../screens/ProductScreen";
import { colors } from "../theme";

import { Tabs } from "./Tabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.text },
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["agnusapp://"],
  config: {
    screens: {
      Tabs: {
        screens: { Home: "", Catalog: "catalogo", Cart: "carrinho", Account: "conta" },
      },
      Product: "produto/:id",
      Login: "login",
      Checkout: "checkout",
      OrderConfirmation: "pedido/:id_pedido",
      NotFound: "*",
    },
  },
};

export function RootNavigator() {
  const { initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Product" component={ProductScreen} options={{ title: "Produto" }} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Entrar", presentation: "modal" }}
        />
        <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: "Ops" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
