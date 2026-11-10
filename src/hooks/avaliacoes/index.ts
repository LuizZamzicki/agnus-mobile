import { useQuery } from "@tanstack/react-query";

import { getMyOrders, getOrderItems } from "../../actions/orders";
import { getProductColors } from "../../actions/products";
import { getReviewPhotos } from "../../actions/reviews";
import { useAuth } from "../../contexts/AuthContext";

export function useReviewPhotos(reviewId: number) {
  return useQuery({
    queryKey: ["review-photos", reviewId],
    queryFn: () => getReviewPhotos(reviewId),
    enabled: reviewId > 0,
    staleTime: 5 * 60_000,
  });
}

/**
 * Só quem recebeu a peça pode avaliar. Mesma regra do backend: algum item de um
 * pedido entregue tem uma das cores do produto. Quem decide é a API (403); isto
 * só esconde o botão de quem não pode.
 */
export function useCanReview(productId: number) {
  const { user } = useAuth();
  const userId = user?.id_usuario ?? 0;

  return useQuery({
    queryKey: ["can-review", userId, productId],
    queryFn: async () => {
      const entregues = await getMyOrders("entregue");
      if (entregues.length === 0) return false;
      const [cores, itens] = await Promise.all([
        getProductColors(productId),
        Promise.all(entregues.map((pedido) => getOrderItems(pedido.id_pedido))),
      ]);
      const idsCores = new Set(cores.map((cor) => Number(cor.id_produto_cor)));
      return itens.flat().some((item) => idsCores.has(Number(item.id_produto_cor)));
    },
    enabled: userId > 0 && productId > 0,
    staleTime: 5 * 60_000,
  });
}
