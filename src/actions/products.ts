import type {
  CatalogProduct,
  Category,
  Paginated,
  ProductBundle,
  ProductColor,
  ProductDetail,
  ProductGrade,
  ProductPhoto,
  ProductReview,
} from "../types/product";

import { request } from "../lib/api";

export type ProductSort = "preco_asc" | "preco_desc";

export interface CatalogParams {
  page?: number;
  limit?: number;
  id_categoria?: number;
  /** Busca no Meilisearch (aceita `q`, `search` ou `busca` no back). */
  q?: string;
  /** Ordena por preço; sem valor mantém a ordem padrão (id do produto). */
  sort?: ProductSort;
}

/** `GET /products/catalog` — vitrine paginada. */
export function getCatalog(params: CatalogParams = {}): Promise<Paginated<CatalogProduct>> {
  const { page = 1, limit = 12, id_categoria, q, sort } = params;
  return request<Paginated<CatalogProduct>>("/products/catalog", {
    query: { page, limit, id_categoria, q: q?.trim() || undefined, sort },
  });
}

/** `GET /products/best-sellers` — mais vendidos. */
export function getBestSellers(limit = 6): Promise<Paginated<CatalogProduct>> {
  return request<Paginated<CatalogProduct>>("/products/best-sellers", {
    query: { page: 1, limit },
  });
}

/** `GET /products/:id` — linha crua do produto. */
export function getProduct(id: number): Promise<ProductDetail> {
  return request<ProductDetail>(`/products/${id}`);
}

export function getProductColors(id: number): Promise<ProductColor[]> {
  return request<ProductColor[]>(`/product-colors/${id}`);
}

export function getProductGrades(id: number): Promise<ProductGrade[]> {
  return request<ProductGrade[]>(`/product-grades/${id}`);
}

export function getProductPhotos(id: number): Promise<ProductPhoto[]> {
  return request<ProductPhoto[]>(`/product-photos/${id}`);
}

export function getProductReviews(id: number): Promise<ProductReview[]> {
  return request<ProductReview[]>(`/product-reviews/${id}`);
}

/**
 * Monta a tela de produto: linha crua + cores/grades/fotos/reviews em paralelo.
 * `GET /products/:id` não traz nenhuma dessas relações.
 */
export async function getProductBundle(id: number): Promise<ProductBundle> {
  const [produto, cores, grades, fotos, avaliacoes] = await Promise.all([
    getProduct(id),
    getProductColors(id).catch(() => [] as ProductColor[]),
    getProductGrades(id).catch(() => [] as ProductGrade[]),
    getProductPhotos(id).catch(() => [] as ProductPhoto[]),
    getProductReviews(id).catch(() => [] as ProductReview[]),
  ]);
  return { produto, cores, grades, fotos, avaliacoes };
}

/** `GET /categories` — traz todas (limite alto; a loja tem poucas categorias). */
export async function getCategories(): Promise<Category[]> {
  const res = await request<Paginated<Category>>("/categories", {
    query: { page: 1, limit: 100 },
  });
  return res.data;
}
