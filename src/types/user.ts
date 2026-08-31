export type UserRole = "cliente" | "administrador";

/** Espelha `AuthService.sanitizeUser` do `agnus-back`. */
export interface User {
  id_usuario: number;
  nome: string;
  cpf: string | null;
  email: string;
  google_id: string | null;
  tipo: UserRole | string;
  data_criacao: string | null;
  data_alteracao: string | null;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface RegisterInput {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface LoginInput {
  email: string;
  senha: string;
}

export function isAdmin(user: Pick<User, "tipo"> | null | undefined): boolean {
  return user?.tipo === "administrador";
}
