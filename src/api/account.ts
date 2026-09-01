import { somenteDigitos } from "../lib/cpf";
import type {
  AddressInput,
  ContactInput,
  PasswordChangeInput,
  ProfileInput,
  UserAddress,
  UserContact,
} from "../types/account";
import type { User } from "../types/user";

import { request } from "./client";

/* ---------------------------------- Perfil --------------------------------- */

/** `PUT /users/:id` (Bearer, self-or-admin). */
export function updateProfile(userId: number, input: ProfileInput): Promise<User> {
  return request<User>(`/users/${userId}`, {
    method: "PUT",
    body: {
      nome: input.nome.trim(),
      email: input.email.trim(),
      cpf: somenteDigitos(input.cpf),
    },
  });
}

/** `PATCH /users/:id/password` (Bearer). 204 em caso de sucesso. */
export function changePassword(userId: number, input: PasswordChangeInput): Promise<void> {
  return request<void>(`/users/${userId}/password`, {
    method: "PATCH",
    body: {
      senhaAtual: input.senhaAtual,
      confirmacaoSenhaAtual: input.senhaAtual,
      novaSenha: input.novaSenha,
    },
  });
}

/* -------------------------------- Endereços -------------------------------- */

export function getUserAddresses(userId: number): Promise<UserAddress[]> {
  return request<UserAddress[]>(`/user-addresses/${userId}`);
}

export function createUserAddress(userId: number, input: AddressInput): Promise<UserAddress> {
  return request<UserAddress>("/user-addresses", {
    method: "POST",
    body: { id_usuario: userId, pais: "Brasil", ...input },
  });
}

export function updateUserAddress(id: number, input: AddressInput): Promise<UserAddress> {
  return request<UserAddress>(`/user-addresses/${id}`, { method: "PUT", body: input });
}

export function deleteUserAddress(id: number): Promise<void> {
  return request<void>(`/user-addresses/${id}`, { method: "DELETE" });
}

/* --------------------------------- Contatos -------------------------------- */

export function getUserContacts(userId: number): Promise<UserContact[]> {
  return request<UserContact[]>(`/user-contacts/${userId}`);
}

export function createUserContact(userId: number, input: ContactInput): Promise<UserContact> {
  return request<UserContact>("/user-contacts", {
    method: "POST",
    body: { id_usuario: userId, ...input },
  });
}

export function updateUserContact(id: number, input: ContactInput): Promise<UserContact> {
  return request<UserContact>(`/user-contacts/${id}`, { method: "PUT", body: input });
}

export function deleteUserContact(id: number): Promise<void> {
  return request<void>(`/user-contacts/${id}`, { method: "DELETE" });
}
