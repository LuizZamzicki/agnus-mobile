function numeroSeguro(valor: unknown, fallback = 0): number {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : fallback;
}

/**
 * Formata um valor em BRL. Portado de `agnus-front/src/utils/produtos.js`.
 */
export function formatarMoeda(valor: unknown): string {
  const numero = numeroSeguro(valor, 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

export { numeroSeguro };
