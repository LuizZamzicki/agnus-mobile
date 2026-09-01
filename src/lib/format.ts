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

/** Data legível em pt-BR (`dd/mm/aaaa`); vazio se não parsear. */
export function formatarData(valor: string | null | undefined): string {
  if (!valor) return "";
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? ""
    : data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export { numeroSeguro };
