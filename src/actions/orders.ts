import type { CartItem } from "../types/cart";
import type { Order, OrderStatus } from "../types/account";

import { request } from "../lib/api";

/** `GET /orders/me` — pedidos de quem está logado, do mais novo ao mais antigo. */
export function getMyOrders(status?: OrderStatus): Promise<Order[]> {
  return request<Order[]>("/orders/me", { query: { status } });
}

/**
 * `POST /orders/checkout` — compra a sacola inteira. O backend calcula o total
 * pelos preços do catálogo, cria o pedido, esvazia a sacola e desfaz tudo se
 * algo falhar no meio. Erros com `message`: 400 (sacola vazia ou sem endereço),
 * 404 (endereço) e 409 (peça indisponível ou sacola mudou durante a compra).
 */
export function checkout(addressId: number): Promise<Order> {
  return request<Order>("/orders/checkout", {
    method: "POST",
    body: { id_usuario_endereco: addressId },
  });
}

/** `GET /orders/:id` — liberado para o dono do pedido. */
export function getOrder(orderId: number): Promise<Order> {
  return request<Order>(`/orders/${orderId}`);
}

export function getOrderItems(orderId: number): Promise<CartItem[]> {
  return request<CartItem[]>(`/order-items/${orderId}`);
}
