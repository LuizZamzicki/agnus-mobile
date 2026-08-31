import Constants from "expo-constants";

type Extra = { apiUrl?: string };

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/**
 * Base URL da API (backend direto, sem o prefixo `/api` do nginx do web).
 * Vem de `app.config.ts` -> `extra.apiUrl` <- `EXPO_PUBLIC_API_URL`.
 */
export const API_URL: string = (
  extra.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://10.0.2.2:3000"
).replace(/\/+$/, "");
