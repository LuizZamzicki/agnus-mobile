import { useQuery } from "@tanstack/react-query";

import { getOrderItems, getUserOrders } from "../../actions/orders";
import { useAuth } from "../../contexts/AuthContext";

function useUserId() {
  const { user } = useAuth();
  return user?.id_usuario ?? 0;
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
