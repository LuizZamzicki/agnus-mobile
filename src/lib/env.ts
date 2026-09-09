import Constants from "expo-constants";

type Extra = {
  apiUrl?: string;
  googleWebClientId?: string;
  googleIosClientId?: string;
};

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
 * OAuth client IDs do Google para o login nativo (`@react-native-google-signin`).
 * `googleWebClientId` é o que gera o `id_token` enviado ao backend; o iOS usa o
 * seu próprio client. Vêm de `app.config.ts` -> `extra` <- `EXPO_PUBLIC_GOOGLE_*`.
 * Ausentes: o botão "Continuar com Google" fica escondido.
 */
export const GOOGLE_WEB_CLIENT_ID: string | undefined =
  extra.googleWebClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined;

export const GOOGLE_IOS_CLIENT_ID: string | undefined =
  extra.googleIosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined;
