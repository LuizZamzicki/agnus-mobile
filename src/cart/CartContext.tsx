import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * Esqueleto do carrinho — a orquestração completa (GET/POST /carts,
 * /cart-items ...) entra na Fase 3. Por ora mantém apenas o `id_carrinho`
 * e a contagem para o badge da tab.
 */
export interface CartItem {
  id_carrinho_item: number;
  id_produto_cor: number;
  id_produto_grade: number;
  quantidade: number;
  preco_unitario: number;
  produto?: { nome?: string };
  cor?: { nome?: string };
  grade?: { nome?: string };
  foto_produto?: string | null;
}

interface CartContextValue {
  cartId: number | null;
  items: CartItem[];
  count: number;
  setCartId: (id: number | null) => void;
  setItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<number | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(
    () => ({
      cartId,
      items,
      count: items.reduce((total, item) => total + (item.quantidade ?? 0), 0),
      setCartId,
      setItems,
    }),
    [cartId, items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
