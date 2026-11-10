import Constants from "expo-constants";

type Extra = { apiUrl?: string; googleLogin?: boolean };

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/**
 * Base URL da API, sempre pelo gateway: `https://<host>/api`, ou a raiz do
 * domínio do ngrok, cuja entrada já acrescenta o `/api` (ver `.env.example`).
 * Vem de `app.config.ts` -> `extra.apiUrl` <- `EXPO_PUBLIC_API_URL`.
 */
export const API_URL: string = (
  extra.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "https://localhost/api"
).replace(/\/+$/, "");

/**
 * O ngrok gratuito responde com uma página de aviso em vez da API quando a
 * requisição parece vir de um navegador (caso do `expo start --web`). Este
 * cabeçalho pula a página; só é enviado para domínios do ngrok.
 */
export const API_EXTRA_HEADERS: Record<string, string> = /\.ngrok(-free)?\.(app|dev|io)$/i.test(
  hostOf(API_URL),
)
  ? { "ngrok-skip-browser-warning": "1" }
  : {};

function hostOf(url: string): string {
  const match = /^https?:\/\/([^/:?#]+)/i.exec(url);
  return match ? match[1] : "";
}

/**
 * Mostra o botão "Continuar com Google" no login. Ligado por padrão; desligue
 * com `EXPO_PUBLIC_GOOGLE_LOGIN=false` quando o backend não tiver o OAuth do
 * Google configurado no ambiente.
 */
export const GOOGLE_LOGIN_ENABLED: boolean =
  extra.googleLogin !== false && process.env.EXPO_PUBLIC_GOOGLE_LOGIN !== "false";
