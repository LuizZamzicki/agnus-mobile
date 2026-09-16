import Constants from "expo-constants";

type Extra = { apiUrl?: string; googleLogin?: boolean };

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

/**
 * Mostra o botão "Continuar com Google" no login. Ligado por padrão; desligue
 * com `EXPO_PUBLIC_GOOGLE_LOGIN=false` quando o backend não tiver o OAuth do
 * Google configurado no ambiente.
 */
export const GOOGLE_LOGIN_ENABLED: boolean =
  extra.googleLogin !== false && process.env.EXPO_PUBLIC_GOOGLE_LOGIN !== "false";
