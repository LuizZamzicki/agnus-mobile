/**
 * Tempo litúrgico do dia e a cor que o app veste. Portado de
 * `agnus-front/src/utils/liturgia.js` (mesmas datas e cores do site; ver DESIGN.md).
 * Calendário simplificado do Rito Romano: as festas móveis derivam da Páscoa;
 * solenidades isoladas (exceto Pentecostes) não mudam a cor.
 */

export type TempoChave = "advento" | "natal" | "comum" | "quaresma" | "pascoa" | "pentecostes";

export interface TempoLiturgico {
  chave: TempoChave;
  nome: string;
  /** Cor para o tema claro (contraste ≥ 4,5:1 com branco e com a pedra). */
  cor: string;
  /** Mesma cor, mais clara, para o tema escuro (≥ 4,8:1 sobre o papel escuro). */
  corEscura: string;
}

const TEMPOS: Record<TempoChave, Omit<TempoLiturgico, "chave">> = {
  advento: { nome: "Advento", cor: "#5b3a86", corEscura: "#a587cd" },
  natal: { nome: "Tempo do Natal", cor: "#7a5c17", corEscura: "#be8e1f" },
  comum: { nome: "Tempo Comum", cor: "#2f6a46", corEscura: "#47a86d" },
  quaresma: { nome: "Quaresma", cor: "#4e2f6e", corEscura: "#aa87ce" },
  pascoa: { nome: "Tempo Pascal", cor: "#7a5c17", corEscura: "#be8e1f" },
  pentecostes: { nome: "Pentecostes", cor: "#a1231c", corEscura: "#e9736d" },
};

const meiaNoite = (data: Date) => new Date(data.getFullYear(), data.getMonth(), data.getDate());
const somarDias = (data: Date, dias: number) =>
  new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias);

/** Domingo de Páscoa pelo algoritmo de Meeus/Jones/Butcher (calendário gregoriano). */
export function pascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

/** Primeiro domingo do Advento: quarto domingo antes do Natal. */
export function inicioAdvento(ano: number): Date {
  const natal = new Date(ano, 11, 25);
  const diasAteDomingoAnterior = natal.getDay() === 0 ? 7 : natal.getDay();
  return somarDias(natal, -(diasAteDomingoAnterior + 21));
}

/** Batismo do Senhor: domingo depois de 6 de janeiro, que encerra o Tempo do Natal. */
export function batismoDoSenhor(ano: number): Date {
  const epifania = new Date(ano, 0, 6);
  return somarDias(epifania, 7 - epifania.getDay());
}

export function tempoLiturgico(data: Date = new Date()): TempoLiturgico {
  const dia = meiaNoite(data);
  const ano = dia.getFullYear();
  const domingoPascoa = pascoa(ano);
  const cinzas = somarDias(domingoPascoa, -46);
  const pentecostes = somarDias(domingoPascoa, 49);
  const advento = inicioAdvento(ano);

  let chave: TempoChave = "comum";
  if (dia < somarDias(batismoDoSenhor(ano), 1) || dia >= new Date(ano, 11, 25)) {
    chave = "natal";
  } else if (dia >= advento) {
    chave = "advento";
  } else if (dia >= cinzas && dia < domingoPascoa) {
    chave = "quaresma";
  } else if (dia.getTime() === pentecostes.getTime()) {
    chave = "pentecostes";
  } else if (dia >= domingoPascoa && dia < pentecostes) {
    chave = "pascoa";
  }
  return { chave, ...TEMPOS[chave] };
}
