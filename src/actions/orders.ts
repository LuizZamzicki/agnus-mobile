import type { CartItem } from "../types/cart";
import type { Order, OrderStatus } from "../types/account";

import { request } from "../lib/api";

/** `GET /orders/me` — pedidos de quem está logado, do mais novo ao mais antigo. */
export function getMyOrders(status?: OrderStatus): Promise<Order[]> {
  return request<Order[]>("/orders/me", { query: { status } });
}

/** `GET /orders/:id` — liberado para o dono do pedido. */
export function getOrder(orderId: number): Promise<Order> {
  return request<Order>(`/orders/${orderId}`);
}

export function getOrderItems(orderId: number): Promise<CartItem[]> {
  return request<CartItem[]>(`/order-items/${orderId}`);
}

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
