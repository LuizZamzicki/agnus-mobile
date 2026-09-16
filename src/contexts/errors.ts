/**
 * Lançado quando um usuário `administrador` tenta entrar no app do cliente.
 * O painel administrativo é web; o app não libera a loja para admins.
 */
export class AdminNotAllowedError extends Error {
  constructor() {
    super("Esta conta é de administrador. Use o painel web para gerenciar a loja.");
    this.name = "AdminNotAllowedError";
  }
}

/** Lançado quando o usuário fecha o fluxo do Google sem concluir o login. */
export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("Login com Google cancelado.");
    this.name = "GoogleSignInCancelledError";
  }
}
