import type { AuthResult, LoginInput, RegisterInput, User } from "../types/user";
import { somenteDigitos } from "../lib/cpf";

import { request } from "./client";

/** `POST /auth/login` -> `{ user, token }` (401 `{ message }` em erro). */
export function login(input: LoginInput): Promise<AuthResult> {
  return request<AuthResult>("/auth/login", {
    method: "POST",
    body: { email: input.email.trim(), senha: input.senha },
    skipAuth: true,
  });
}

/** `POST /users` (público) — cadastro. `cpf` é enviado só com dígitos. */
export function register(input: RegisterInput): Promise<unknown> {
  return request("/users", {
    method: "POST",
    body: {
      nome: input.nome.trim(),
      email: input.email.trim(),
      cpf: somenteDigitos(input.cpf),
      senha: input.senha,
    },
    skipAuth: true,
  });
}

/** `GET /auth/me` (Bearer) -> `{ user }`. */
export async function me(): Promise<User> {
  const data = await request<{ user: User }>("/auth/me");
  return data.user;
}
