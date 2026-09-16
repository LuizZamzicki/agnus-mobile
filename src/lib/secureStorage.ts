import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "agnus.jwt";

/**
 * Guarda o JWT no SecureStore. Mantém uma cópia em memória para leitura
 * síncrona pelo cliente HTTP (o SecureStore é assíncrono).
 */
let cachedToken: string | null = null;

export function getTokenSync(): string | null {
  return cachedToken;
}

export async function loadToken(): Promise<string | null> {
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    cachedToken = null;
  }
  return cachedToken;
}

export async function saveToken(token: string): Promise<void> {
  cachedToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
