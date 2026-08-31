import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import { useCart } from "../cart/CartContext";
import { AccountScreen } from "../screens/AccountScreen";
import { CartScreen } from "../screens/CartScreen";
import { CatalogScreen } from "../screens/CatalogScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { colors } from "../theme";

import type { TabsParamList } from "./types";

const Tab = createBottomTabNavigator<TabsParamList>();

const icons: Record<keyof TabsParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Catalog: "grid-outline",
  Cart: "cart-outline",
  Account: "person-outline",
};

export function Tabs() {
  const { count } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Início" }} />
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: "Catálogo" }} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Carrinho", tabBarBadge: count > 0 ? count : undefined }}
      />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: "Conta" }} />
    </Tab.Navigator>
  );
}
