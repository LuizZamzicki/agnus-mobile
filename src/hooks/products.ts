import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getBestSellers,
  getCatalog,
  getCategories,
  getProductBundle,
  type CatalogParams,
} from "../api/products";

export interface CatalogFilters {
  id_categoria?: number;
  q?: string;
}

const CATALOG_PAGE_SIZE = 12;

export function useCatalog(filters: CatalogFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["catalog", filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const params: CatalogParams = { ...filters, page: pageParam, limit: CATALOG_PAGE_SIZE };
      return getCatalog(params);
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
  });
}

export function useBestSellers(limit = 6) {
  return useQuery({
    queryKey: ["best-sellers", limit],
    queryFn: () => getBestSellers(limit),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60_000,
  });
}

export function useProductBundle(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductBundle(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
