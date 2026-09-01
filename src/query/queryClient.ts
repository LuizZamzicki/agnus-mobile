import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "../api/client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Não re-tentar erros de cliente (4xx).
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30_000,
      // Mantém no cache por 24h para leitura offline após reabrir o app.
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Persiste o cache do React Query no AsyncStorage (offline básico). */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "agnus.query-cache",
  throttleTime: 1000,
});
