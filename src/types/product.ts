/** Metadados de paginação (`buildPaginationMeta` do agnus-back). */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * Item da vitrine — `GET /products/catalog` e `GET /products/best-sellers`.
 * Campos numéricos (`preco_base`) chegam como string (DECIMAL do MySQL).
 */
export interface CatalogProduct {
  id_produto: number;
  nome: string;
  preco_base: string | number;
  ativo: boolean | number;
  id_categoria: number | null;
  categoria_nome: string | null;
  imagens: string[];
  /** Presente apenas em best-sellers. */
  quantidade_vendida?: string | number;
}

/** Linha crua de `GET /products/:id` (sem cores/grades/fotos/reviews). */
export interface ProductDetail {
  id_produto: number;
  id_categoria: number | null;
  nome: string;
  descricao: string | null;
  preco_base: string | number;
  preco_custo?: string | number | null;
  margem_lucro?: string | number | null;
  ativo: boolean | number;
  data_criacao: string | null;
  data_alteracao: string | null;
}

/** `GET /product-colors/:id_produto` — `codigo_rgb` no formato `rgb(r,g,b)`. */
export interface ProductColor {
  id_produto_cor: number;
  id_produto: number;
  nome: string;
  codigo_rgb: string;
  acrescimo: string | number | null;
}

/** `GET /product-grades/:id_produto`. */
export interface ProductGrade {
  id_produto_grade: number;
  id_produto: number;
  nome: string;
  acrescimo: string | number | null;
}

/** `GET /product-photos/:id_produto` — `caminho_url` pode ser relativo. */
export interface ProductPhoto {
  id_produto_foto: number;
  id_produto: number;
  id_produto_cor: number;
  caminho_url: string;
}

/** `GET /product-reviews/:id_produto` — `nota` de 0 a 5 (string DECIMAL) ou null. */
export interface ProductReview {
  id_avaliacao_produto: number;
  id_produto: number;
  id_usuario: number;
  titulo: string | null;
  comentario: string | null;
  nota: string | number | null;
}

/** `GET /categories` (paginado). */
export interface Category {
  id_categoria: number;
  nome: string;
}

/** Agregado montado no cliente para a tela de produto. */
export interface ProductBundle {
  produto: ProductDetail;
  cores: ProductColor[];
  grades: ProductGrade[];
  fotos: ProductPhoto[];
  avaliacoes: ProductReview[];
}
