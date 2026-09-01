import { API_URL } from "./env";

function isAbsoluteUrl(value: string): boolean {
  return /^(?:https?:|data:|blob:)/i.test(value);
}

/**
 * Resolve um caminho da API para URL absoluta.
 * Portado de `agnus-front/src/utils/api.js` (`apiUrl`), com base fixa em `API_URL`.
 */
export function apiUrl(path: string | null | undefined = ""): string {
  const value = String(path ?? "");
  if (isAbsoluteUrl(value)) return value;

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  if (!API_URL) return normalizedPath;
  if (normalizedPath === API_URL || normalizedPath.startsWith(`${API_URL}/`)) {
    return normalizedPath;
  }
  return `${API_URL}${normalizedPath}`;
}

/**
 * Resolve URL de imagem/asset (`/produto_fotos/x.jpg` -> `${API_URL}/produto_fotos/x.jpg`).
 * Portado de `agnus-front/src/utils/api.js` (`assetUrl`).
 */
export function assetUrl(path: string | null | undefined = ""): string {
  if (typeof path !== "string") return "";
  const value = path.trim();
  return value ? apiUrl(value) : "";
}
