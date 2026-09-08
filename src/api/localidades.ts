import { request } from "./client";

interface MunicipioIBGE {
  nome: string;
}

/**
 * Municípios de uma UF, via API pública do IBGE (sem chave).
 * `skipAuth` para não enviar o Bearer do Agnus a um serviço de terceiros.
 */
export async function getMunicipios(uf: string): Promise<string[]> {
  const data = await request<MunicipioIBGE[]>(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf.toUpperCase()}/municipios`,
    { skipAuth: true, timeoutMs: 15_000 },
  );
  return data.map((m) => m.nome).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
