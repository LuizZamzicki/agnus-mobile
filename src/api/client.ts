import { getTokenSync } from "../auth/tokenStore";
import { API_URL } from "../lib/env";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Objeto -> JSON. String/FormData passam direto. */
  body?: unknown;
  /** Query string a partir de um objeto (valores nullish são ignorados). */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Não anexar `Authorization` mesmo havendo token. */
  skipAuth?: boolean;
  /** Timeout em ms (padrão 20s). */
  timeoutMs?: number;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = /^https?:\/\//i.test(path)
    ? path
    : `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}${base.includes("?") ? "&" : "?"}${qs}` : base;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  // Alguns endpoints devolvem JSON sem o header correto.
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function messageFromBody(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    for (const key of ["message", "erro", "error", "msg"]) {
      if (typeof record[key] === "string" && record[key]) return record[key] as string;
    }
  }
  if (typeof body === "string" && body) return body;
  return fallback;
}

/**
 * Cliente HTTP tipado da API do Agnus.
 * - Resolve a URL contra `API_URL`.
 * - Anexa `Authorization: Bearer <token>` quando há token no SecureStore.
 * - Faz parse seguro (corpo pode ser vazio).
 * - Lança `ApiError { status, message, body }` em respostas não-2xx.
 */
export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, query, skipAuth, timeoutMs = 20_000, headers, ...rest } = opts;

  const finalHeaders = new Headers(headers as HeadersInit | undefined);
  const token = skipAuth ? null : getTokenSync();
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  let finalBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (typeof body === "string" || body instanceof FormData) {
      finalBody = body as BodyInit;
    } else {
      finalHeaders.set("Content-Type", "application/json");
      finalBody = JSON.stringify(body);
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      ...rest,
      headers: finalHeaders,
      body: finalBody,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, "Tempo de conexão esgotado. Verifique sua internet.");
    }
    throw new ApiError(0, "Não foi possível conectar à API.");
  }
  clearTimeout(timer);

  const parsed = await parseBody(res);
  if (!res.ok) {
    throw new ApiError(res.status, messageFromBody(parsed, `Erro ${res.status}`), parsed);
  }
  return parsed as T;
}
