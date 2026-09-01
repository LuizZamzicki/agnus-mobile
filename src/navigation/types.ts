import type { NavigatorScreenParams } from "@react-navigation/native";

export type AccountStackParamList = {
  AccountHome: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  Addresses: undefined;
  AddressForm: { id?: number } | undefined;
  Contacts: undefined;
  ContactForm: { id?: number } | undefined;
  Orders: undefined;
  OrderDetail: { id_pedido: number };
};

export type TabsParamList = {
  Home: undefined;
  Catalog: { id_categoria?: number; q?: string } | undefined;
  Cart: undefined;
  Account: NavigatorScreenParams<AccountStackParamList> | undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabsParamList> | undefined;
  Product: { id: number };
  Login: { redirect?: keyof RootStackParamList } | undefined;
  Checkout: { itemIds: number[] };
  OrderConfirmation: { id_pedido: number };
  NotFound: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
