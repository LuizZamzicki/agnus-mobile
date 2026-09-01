import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";

import {
  addCartItem,
  ensureCart,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "../api/cart";
import { useAuth } from "../auth/AuthContext";
import { numeroSeguro } from "../lib/format";
import type { AddToCartInput, CartItem } from "../types/cart";

interface CartContextValue {
  cartId: number | null;
  items: CartItem[];
  /** Soma das quantidades — usado no badge da tab. */
  count: number;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  refetch: () => void;
  /** Adiciona; se já houver item com a mesma cor+grade, soma a quantidade. */
  addItem: (input: AddToCartInput) => Promise<void>;
  setQuantity: (itemId: number, quantidade: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  removeItems: (itemIds: number[]) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id_usuario ?? null;
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart", userId],
    queryFn: () => ensureCart(userId as number),
    enabled: userId != null,
    staleTime: 5 * 60_000,
  });
  const cartId = cartQuery.data?.id_carrinho ?? null;

  const itemsQuery = useQuery({
    queryKey: ["cart-items", cartId],
    queryFn: () => getCartItems(cartId as number),
    enabled: cartId != null,
  });

  // Ao deslogar, limpa o cache do carrinho.
  useEffect(() => {
    if (userId == null) {
      queryClient.removeQueries({ queryKey: ["cart"] });
      queryClient.removeQueries({ queryKey: ["cart-items"] });
    }
  }, [userId, queryClient]);

  const items = useMemo(
    () => (userId != null ? (itemsQuery.data ?? []) : []),
    [userId, itemsQuery.data],
  );

  const invalidateItems = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["cart-items", cartId] }),
    [queryClient, cartId],
  );

  const addMutation = useMutation({
    mutationFn: async (input: AddToCartInput) => {
      const id = cartId ?? (await ensureCart(userId as number)).id_carrinho;
      const current = itemsQuery.data ?? (await getCartItems(id));
      const existing = current.find(
        (item) =>
          item.id_produto_cor === input.id_produto_cor &&
          item.id_produto_grade === input.id_produto_grade,
      );
      if (existing) {
        return updateCartItemQuantity(
          existing.id_carrinho_item,
          existing.quantidade + input.quantidade,
        );
      }
      return addCartItem(id, input);
    },
    onSuccess: invalidateItems,
  });

  const quantityMutation = useMutation({
    mutationFn: ({ itemId, quantidade }: { itemId: number; quantidade: number }) =>
      updateCartItemQuantity(itemId, quantidade),
    onSuccess: invalidateItems,
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onSuccess: invalidateItems,
  });

  const addItem = useCallback(
    async (input: AddToCartInput) => {
      await addMutation.mutateAsync(input);
    },
    [addMutation],
  );

  const setQuantity = useCallback(
    async (itemId: number, quantidade: number) => {
      if (quantidade < 1) {
        await removeMutation.mutateAsync(itemId);
        return;
      }
      await quantityMutation.mutateAsync({ itemId, quantidade });
    },
    [quantityMutation, removeMutation],
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      await removeMutation.mutateAsync(itemId);
    },
    [removeMutation],
  );

  const removeItems = useCallback(
    async (itemIds: number[]) => {
      for (const id of itemIds) {
        await removeCartItem(id);
      }
      await invalidateItems();
    },
    [invalidateItems],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cartId,
      items,
      count: items.reduce((total, item) => total + numeroSeguro(item.quantidade, 0), 0),
      isLoading: cartQuery.isPending || (cartId != null && itemsQuery.isPending),
      isError: cartQuery.isError || itemsQuery.isError,
      isMutating: addMutation.isPending || quantityMutation.isPending || removeMutation.isPending,
      refetch: () => {
        cartQuery.refetch();
        itemsQuery.refetch();
      },
      addItem,
      setQuantity,
      removeItem,
      removeItems,
    }),
    [
      cartId,
      items,
      cartQuery,
      itemsQuery,
      addMutation.isPending,
      quantityMutation.isPending,
      removeMutation.isPending,
      addItem,
      setQuantity,
      removeItem,
      removeItems,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
