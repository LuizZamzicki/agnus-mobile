export interface Uf {
  sigla: string;
  nome: string;
}

/** 26 estados + Distrito Federal, em ordem alfabética de sigla. */
export const UFS: Uf[] = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

const SIGLAS = new Set(UFS.map((u) => u.sigla));

export function ufValida(valor: string | null | undefined): boolean {
  return !!valor && SIGLAS.has(valor.toUpperCase());
}

const ACENTOS: Record<string, string> = {
  à: "a",
  á: "a",
  â: "a",
  ã: "a",
  ä: "a",
  è: "e",
  é: "e",
  ê: "e",
  ë: "e",
  ì: "i",
  í: "i",
  î: "i",
  ï: "i",
  ò: "o",
  ó: "o",
  ô: "o",
  õ: "o",
  ö: "o",
  ù: "u",
  ú: "u",
  û: "u",
  ü: "u",
  ç: "c",
  ñ: "n",
};

/** minúsculas, sem acentos e sem espaços nas pontas — base para comparar nomes de cidade. */
export function normalizarNome(valor: string): string {
  return valor
    .toLowerCase()
    .replace(/[àáâãäèéêëìíîïòóôõöùúûüçñ]/g, (c) => ACENTOS[c] ?? c)
    .trim();
}

/**
 * Sugestões de município a partir do que foi digitado: primeiro os que começam
 * com o termo, depois os que apenas o contêm. No máximo `limite` (padrão 5).
 */
export function filtrarMunicipios(lista: string[], termo: string, limite = 5): string[] {
  const alvo = normalizarNome(termo);
  if (!alvo) return [];
  const comeca: string[] = [];
  const contem: string[] = [];
  for (const nome of lista) {
    const n = normalizarNome(nome);
    if (n === alvo) return [nome];
    if (n.startsWith(alvo)) comeca.push(nome);
    else if (n.includes(alvo)) contem.push(nome);
  }
  return [...comeca, ...contem].slice(0, limite);
}

/** Nome canônico do município se o termo bater exatamente (ignorando caixa/acentos); senão `null`. */
export function municipioExato(lista: string[], termo: string): string | null {
  const alvo = normalizarNome(termo);
  if (!alvo) return null;
  return lista.find((nome) => normalizarNome(nome) === alvo) ?? null;
}
