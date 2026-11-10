import type { ProductReview, ReviewPhoto } from "../types/product";

import { request } from "../lib/api";

/** Máximo de fotos por avaliação (mesmo limite do site e do upload no backend). */
export const MAX_FOTOS_AVALIACAO = 4;

export interface ReviewInput {
  id_produto: number;
  id_usuario: number;
  /** De 0,5 a 5, de meia em meia estrela. */
  nota: number;
  /** Nome exibido na avaliação. */
  titulo: string;
  comentario: string;
}

/** Foto escolhida no aparelho, ainda não enviada. */
export interface LocalPhoto {
  uri: string;
  name: string;
  type: string;
}

/** `GET /product-review-photos/:id_avaliacao` (público). */
export function getReviewPhotos(reviewId: number): Promise<ReviewPhoto[]> {
  return request<ReviewPhoto[]>(`/product-review-photos/${reviewId}`, { skipAuth: true });
}

/**
 * `POST /product-reviews`. Erros com `message`: 403 (não recebeu a peça) e 409
 * (já avaliou este produto).
 */
export function createReview(input: ReviewInput): Promise<ProductReview> {
  return request<ProductReview>("/product-reviews", { method: "POST", body: input });
}

/** `PUT /product-reviews/:id` — só o autor. */
export function updateReview(reviewId: number, input: ReviewInput): Promise<ProductReview> {
  return request<ProductReview>(`/product-reviews/${reviewId}`, { method: "PUT", body: input });
}

/** `DELETE /product-reviews/:id` (204) — só o autor. */
export async function deleteReview(reviewId: number): Promise<void> {
  await request<void>(`/product-reviews/${reviewId}`, { method: "DELETE" });
}

/** `POST /product-review-photos` multipart (`files`), até 4 por envio. */
export function uploadReviewPhotos(reviewId: number, photos: LocalPhoto[]): Promise<ReviewPhoto[]> {
  const form = new FormData();
  form.append("id_avaliacao_produto", String(reviewId));
  for (const photo of photos) {
    // Formato de arquivo do FormData do React Native: { uri, name, type }.
    form.append("files", photo as unknown as Blob);
  }
  return request<ReviewPhoto[]>("/product-review-photos", {
    method: "POST",
    body: form,
    timeoutMs: 60_000,
  });
}

/** `DELETE /product-review-photos/:id` (204) — só o autor. */
export async function deleteReviewPhoto(photoId: number): Promise<void> {
  await request<void>(`/product-review-photos/${photoId}`, { method: "DELETE" });
}
