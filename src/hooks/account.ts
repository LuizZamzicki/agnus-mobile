import { useQuery } from "@tanstack/react-query";

import { getUserAddresses, getUserContacts } from "../api/account";
import { getOrderItems, getUserOrders } from "../api/orders";
import { useAuth } from "../auth/AuthContext";

function useUserId() {
  const { user } = useAuth();
  return user?.id_usuario ?? 0;
}

export function useAddresses() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => getUserAddresses(userId),
    enabled: userId > 0,
  });
}

export function useContacts() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["contacts", userId],
    queryFn: () => getUserContacts(userId),
    enabled: userId > 0,
  });
}

export function useOrders() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => getUserOrders(userId),
    enabled: userId > 0,
  });
}

export function useOrderItems(orderId: number) {
  return useQuery({
    queryKey: ["order-items", orderId],
    queryFn: () => getOrderItems(orderId),
    enabled: orderId > 0,
  });
}
