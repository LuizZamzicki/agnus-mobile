import { somenteDigitos } from "./cpf";

/** `00000-000` progressivo. */
export function formatarCEP(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function cepValido(valor: string): boolean {
  return somenteDigitos(valor).length === 8;
}
