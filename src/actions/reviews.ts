import type { ReviewPhoto } from "../types/product";

import { request } from "../lib/api";

/** `GET /product-review-photos/:id_avaliacao` (público). */
export function getReviewPhotos(reviewId: number): Promise<ReviewPhoto[]> {
  return request<ReviewPhoto[]>(`/product-review-photos/${reviewId}`, { skipAuth: true });
}
