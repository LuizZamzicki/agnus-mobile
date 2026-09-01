/** Linha de `carrinhos`. */
export interface Cart {
  id_carrinho: number;
  id_usuario: number;
}

/**
 * Item de carrinho já enriquecido pelo back (`enrichItemsWithProductData`).
 * `produto`/`cor`/`grade` vêm `null` se o produto vinculado sumiu.
 */
export interface CartItem {
  id_carrinho_item: number;
  id_carrinho: number;
  id_produto_cor: number;
  id_produto_grade: number;
  quantidade: number;
  preco_unitario: number;
  subtotal?: number;
  foto_produto: string | null;
  produto: {
    id_produto: number;
    nome: string;
    descricao: string | null;
    preco_base: number;
    foto: string | null;
  } | null;
  cor: {
    id_produto_cor: number;
    nome: string;
    codigo_rgb: string;
    acrescimo: number;
  } | null;
  grade: {
    id_produto_grade: number;
    nome: string;
    acrescimo: number;
  } | null;
}

export interface AddToCartInput {
  id_produto_cor: number;
  id_produto_grade: number;
  quantidade: number;
}
