/** Linha de `usuario_enderecos`. */
export interface UserAddress {
  id_usuario_endereco: number;
  id_usuario: number;
  cep: string;
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  principal: boolean | number;
  ativo: boolean | number;
}

export interface AddressInput {
  cep: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  principal?: boolean;
}

export type OrderStatus =
  | "aguardando_calculo_frete"
  | "aguardando_pagamento"
  | "pago"
  | "enviado"
  | "entregue"
  | "cancelado";

/** Linha de `pedidos`. */
export interface Order {
  id_pedido: number;
  id_usuario: number;
  id_usuario_endereco: number;
  status: OrderStatus;
  valor_total: string | number | null;
  valor_frete: string | number | null;
  data_criacao: string | null;
}
