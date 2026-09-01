import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { AccountHomeScreen } from "../screens/account/AccountHomeScreen";
import { AddressesScreen } from "../screens/account/AddressesScreen";
import { AddressFormScreen } from "../screens/account/AddressFormScreen";
import { ChangePasswordScreen } from "../screens/account/ChangePasswordScreen";
import { ContactFormScreen } from "../screens/account/ContactFormScreen";
import { ContactsScreen } from "../screens/account/ContactsScreen";
import { OrderDetailScreen } from "../screens/account/OrderDetailScreen";
import { OrdersScreen } from "../screens/account/OrdersScreen";
import { ProfileScreen } from "../screens/account/ProfileScreen";

import type { AccountStackParamList } from "./types";

const Stack = createNativeStackNavigator<AccountStackParamList>();

export function AccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AccountHome" component={AccountHomeScreen} options={{ title: "Conta" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Meus dados" }} />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: "Trocar senha" }}
      />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: "Endereços" }} />
      <Stack.Screen
        name="AddressForm"
        component={AddressFormScreen}
        options={{ title: "Endereço" }}
      />
      <Stack.Screen name="Contacts" component={ContactsScreen} options={{ title: "Contatos" }} />
      <Stack.Screen
        name="ContactForm"
        component={ContactFormScreen}
        options={{ title: "Contato" }}
      />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: "Meus pedidos" }} />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Pedido" }}
      />
    </Stack.Navigator>
  );
}
