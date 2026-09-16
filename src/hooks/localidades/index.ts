import { useQuery } from "@tanstack/react-query";

import { getMunicipios } from "../../actions/localidades";
import { ufValida } from "../../lib/localidade";

/** Lista de municípios da UF (IBGE), cacheada por bastante tempo — dado praticamente estático. */
export function useMunicipios(uf: string | null | undefined) {
  const sigla = uf?.toUpperCase() ?? "";
  return useQuery({
    queryKey: ["municipios", sigla],
    queryFn: () => getMunicipios(sigla),
    enabled: ufValida(sigla),
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime: 30 * 24 * 60 * 60 * 1000,
  });
}
