import type { CatalogProduct, ProductColor, ProductGrade, ProductReview } from "../types/product";

import { assetUrl } from "./assetUrl";
import { numeroSeguro } from "./format";

/**
 * Normalização defensiva de dados de produto. Portado de
 * `agnus-front/src/utils/produtos.js` (`parseJsonSeguro`, extração de imagem/cor),
 * adaptado às respostas reais dos controllers do `agnus-back`.
 */

/** Aceita array, string JSON de array, ou devolve o fallback. */
export function parseJsonSeguro<T = unknown>(valor: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(valor)) return valor as T[];
  if (typeof valor !== "string") return fallback;
  try {
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

/** Resolve URL de imagem (relativa -> absoluta via `assetUrl`); ignora vazios. */
export function normalizarUrlImagem(url: unknown): string {
  if (typeof url !== "string") return "";
  const valor = url.trim();
  if (!valor) return "";
  if (/^(?:https?:|data:|blob:)/i.test(valor)) return valor;
  return assetUrl(valor);
}

/** Remove duplicatas e vazios preservando a ordem. */
export function deduplicarUrls(lista: string[]): string[] {
  return [...new Set(lista.filter(Boolean))];
}

/** Primeira imagem utilizável de um item da vitrine. */
export function imagemPrincipal(produto: Pick<CatalogProduct, "imagens">): string | null {
  const urls = deduplicarUrls((produto.imagens ?? []).map(normalizarUrlImagem));
  return urls[0] ?? null;
}

/** `codigo_rgb` já vem como `rgb(r,g,b)`; cai num cinza se vier inválido. */
export function corDeFundo(cor: Pick<ProductColor, "codigo_rgb">): string {
  const valor = String(cor?.codigo_rgb ?? "").trim();
  return /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i.test(valor) ? valor : "#d0d0d5";
}

/** Preço final = base + acréscimo da cor + acréscimo da grade. */
export function precoComVariacoes(
  precoBase: unknown,
  cor?: Pick<ProductColor, "acrescimo"> | null,
  grade?: Pick<ProductGrade, "acrescimo"> | null,
): number {
  return (
    numeroSeguro(precoBase, 0) + numeroSeguro(cor?.acrescimo, 0) + numeroSeguro(grade?.acrescimo, 0)
  );
}

/** Média das notas válidas (0 se não houver). */
export function mediaAvaliacoes(avaliacoes: Pick<ProductReview, "nota">[]): number {
  const notas = avaliacoes
    .map((a) => numeroSeguro(a.nota, NaN))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!notas.length) return 0;
  return notas.reduce((soma, n) => soma + n, 0) / notas.length;
}

/** `true`/`1` -> ativo. */
export function estaAtivo(valor: boolean | number | undefined): boolean {
  return valor === true || valor === 1;
}
