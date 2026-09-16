import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { useCart } from "../../src/contexts/CartContext";
import { useTheme } from "../../src/theme";

const icons = {
  index: "home-outline",
  catalogo: "grid-outline",
  carrinho: "cart-outline",
  conta: "person-outline",
} as const;

export default function TabsLayout() {
  const { colors } = useTheme();
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={icons[route.name as keyof typeof icons] ?? "ellipse-outline"}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="catalogo" options={{ title: "Catálogo" }} />
      <Tabs.Screen
        name="carrinho"
        options={{ title: "Carrinho", tabBarBadge: count > 0 ? count : undefined }}
      />
      <Tabs.Screen name="conta" options={{ title: "Conta", headerShown: false }} />
    </Tabs>
  );
}
