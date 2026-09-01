import type { AddToCartInput, Cart, CartItem } from "../types/cart";

import { request } from "./client";

/** `GET /carts?id_usuario=` — o back não tem endpoint "meu carrinho". */
export async function getCartByUser(userId: number): Promise<Cart | null> {
  const carts = await request<Cart[]>("/carts", { query: { id_usuario: userId } });
  return carts[0] ?? null;
}

export function createCart(userId: number): Promise<Cart> {
  return request<Cart>("/carts", { method: "POST", body: { id_usuario: userId } });
}

/** Garante um carrinho para o usuário (pega o primeiro ou cria). */
export async function ensureCart(userId: number): Promise<Cart> {
  return (await getCartByUser(userId)) ?? (await createCart(userId));
}

export function getCartItems(cartId: number): Promise<CartItem[]> {
  return request<CartItem[]>(`/cart-items/${cartId}`);
}

export function addCartItem(cartId: number, input: AddToCartInput): Promise<CartItem> {
  return request<CartItem>("/cart-items", {
    method: "POST",
    body: { id_carrinho: cartId, ...input },
  });
}

export function updateCartItemQuantity(itemId: number, quantidade: number): Promise<CartItem> {
  return request<CartItem>(`/cart-items/${itemId}`, {
    method: "PUT",
    body: { quantidade },
  });
}

export function removeCartItem(itemId: number): Promise<void> {
  return request<void>(`/cart-items/${itemId}`, { method: "DELETE" });
}
