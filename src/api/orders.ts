import type { CartItem } from "../types/cart";
import type { Order } from "../types/account";

import { request } from "./client";

export interface CreateOrderInput {
  id_usuario: number;
  id_usuario_endereco: number;
  valor_total: number;
}

export interface OrderItemInput {
  id_pedido: number;
  id_produto_cor: number;
  id_produto_grade: number;
  quantidade: number;
}

/** `POST /orders` — nasce "aguardando_pagamento" (não há gateway). */
export function createOrder(input: CreateOrderInput): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: {
      ...input,
      status: "aguardando_pagamento",
      valor_frete: 0,
    },
  });
}

/** `POST /order-items` — o back calcula `preco_unitario` e `subtotal`. */
export function createOrderItem(input: OrderItemInput): Promise<CartItem> {
  return request<CartItem>("/order-items", { method: "POST", body: input });
}

export function getUserOrders(userId: number): Promise<Order[]> {
  return request<Order[]>("/orders", { query: { id_usuario: userId } });
}

export function getOrderItems(orderId: number): Promise<CartItem[]> {
  return request<CartItem[]>(`/order-items/${orderId}`);
}
