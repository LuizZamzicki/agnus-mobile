import type { AddressInput, UserAddress } from "../types/account";

import { request } from "./client";

/** `GET /user-addresses/:id_user` — array (vazio se não houver). */
export function getUserAddresses(userId: number): Promise<UserAddress[]> {
  return request<UserAddress[]>(`/user-addresses/${userId}`);
}

export function createUserAddress(userId: number, input: AddressInput): Promise<UserAddress> {
  return request<UserAddress>("/user-addresses", {
    method: "POST",
    body: { id_usuario: userId, pais: "Brasil", ...input },
  });
}
