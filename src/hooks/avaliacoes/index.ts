import { useQuery } from "@tanstack/react-query";

import { getReviewPhotos } from "../../actions/reviews";

export function useReviewPhotos(reviewId: number) {
  return useQuery({
    queryKey: ["review-photos", reviewId],
    queryFn: () => getReviewPhotos(reviewId),
    enabled: reviewId > 0,
    staleTime: 5 * 60_000,
  });
}
