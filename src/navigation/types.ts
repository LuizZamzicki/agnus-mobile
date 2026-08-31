import type { NavigatorScreenParams } from "@react-navigation/native";

export type TabsParamList = {
  Home: undefined;
  Catalog: { id_categoria?: number; q?: string } | undefined;
  Cart: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabsParamList> | undefined;
  Product: { id: number };
  Login: { redirect?: keyof RootStackParamList } | undefined;
  Checkout: undefined;
  OrderConfirmation: { id_pedido: number };
  NotFound: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
